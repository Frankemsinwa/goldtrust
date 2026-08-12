const { query } = require('../config/db');
const { sendInvestmentConfirmation } = require('../config/mailer');
const { parseRoi, getAccruedValue, getAccruedRoi, getTotalRoi, getMarketChart, getPortfolioProfit } = require('../utils/marketEngine');
const { handleReferralCommission } = require('../utils/referral');

const getPackages = async (req, res) => {
    try {
        const result = await query('SELECT * FROM investment_packages ORDER BY min_investment ASC');
        // Yield is a fixed total ROI declared on the package — no simulated movement.
        const packages = result.rows.map(pkg => ({
            ...pkg,
            roi: parseRoi(pkg.yield)
        }));
        res.json(packages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch packages', message: err.message });
    }
};

// --- WALLETS ---

const getWallets = async (req, res) => {
    try {
        // Ensure the user has a USD escrow wallet (auto-create for existing users)
        const walletPromises = ['USD', 'REWARDS'].map(async (type) => {
            const check = await query(
                'SELECT id FROM wallets WHERE user_id = $1 AND type = $2',
                [req.user.id, type]
            );
            if (check.rows.length === 0) {
                await query(
                    'INSERT INTO wallets (user_id, type, balance) VALUES ($1, $2, $3)',
                    [req.user.id, type, 0]
                );
            }
        });
        await Promise.all(walletPromises);

        const result = await query(
            'SELECT * FROM wallets WHERE user_id = $1 ORDER BY type ASC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch wallets', message: err.message });
    }
};

// --- INVESTMENTS ---

const getInvestments = async (req, res) => {
    try {
        const result = await query(
            `SELECT i.*, p.name as package_name, p.type as package_type, p.yield 
             FROM investments i 
             JOIN investment_packages p ON i.package_id = p.id 
             WHERE i.user_id = $1 
             ORDER BY i.created_at DESC`,
            [req.user.id]
        );
        const investments = result.rows.map(inv => {
            const roi = parseRoi(inv.yield);
            return {
                ...inv,
                roi,
                total_roi: getTotalRoi(roi, inv.lock_up_until, inv.created_at),
                current_value: getAccruedValue(inv.amount, roi, inv.created_at, inv.lock_up_until),
                accrued_roi: getAccruedRoi(roi, inv.created_at, inv.lock_up_until),
                is_matured: new Date(inv.lock_up_until || inv.created_at).getTime() <= Date.now()
            };
        });
        res.json(investments);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch investments', message: err.message });
    }
};

const createInvestment = async (req, res) => {
    const { packageId, amount, duration = 12 } = req.body;

    try {
        // 1. Validate package
        const pkgResult = await query('SELECT * FROM investment_packages WHERE id = $1', [packageId]);
        if (pkgResult.rows.length === 0) {
            return res.status(404).json({ error: 'Investment package not found' });
        }
        const pkg = pkgResult.rows[0];

        // 2. Check investment range (min ≤ amount ≤ max)
        const minInvestment = parseFloat(pkg.min_investment);
        const maxInvestment = parseFloat(pkg.max_investment);
        if (parseFloat(amount) < minInvestment || (maxInvestment > 0 && parseFloat(amount) > maxInvestment)) {
            return res.status(400).json({
                error: `Investment must be between $${minInvestment.toLocaleString()} and $${maxInvestment.toLocaleString()} for this package`
            });
        }

        // 3. Check user balance (assuming we use internal wallets for some flows)
        // Note: For Web3 flows, verification happens in web3Controller. This is for balance-based investing.
        // Task rewards (REWARDS wallet) may only be used for investing and is consumed first.
        const [rewardsResult, usdResult] = await Promise.all([
            query('SELECT * FROM wallets WHERE user_id = $1 AND type = $2', [req.user.id, 'REWARDS']),
            query('SELECT * FROM wallets WHERE user_id = $1 AND type = $2', [req.user.id, 'USD'])
        ]);
        const rewardsBalance = rewardsResult.rows.length ? parseFloat(rewardsResult.rows[0].balance) : 0;
        const usdBalance = usdResult.rows.length ? parseFloat(usdResult.rows[0].balance) : 0;
        const investAmt = parseFloat(amount);

        // A portion (REWARDS-first, then USD) must cover the full amount
        if (rewardsBalance + usdBalance < investAmt) {
            return res.status(400).json({ error: 'Insufficient balance in USD wallet' });
        }

        // 4. Deduct balance & Create records
        await query('BEGIN'); // Start transaction

        // Consume reward balance first
        const rewardsUsed = Math.min(rewardsBalance, investAmt);
        if (rewardsUsed > 0) {
            await query(
                'UPDATE wallets SET balance = balance - $1 WHERE user_id = $2 AND type = $3',
                [rewardsUsed, req.user.id, 'REWARDS']
            );
        }
        // Then USD for the remainder
        const usdUsed = investAmt - rewardsUsed;
        if (usdUsed > 0) {
            await query(
                'UPDATE wallets SET balance = balance - $1 WHERE user_id = $2 AND type = $3',
                [usdUsed, req.user.id, 'USD']
            );
        }

        const lockUpUntil = new Date();
        lockUpUntil.setMonth(lockUpUntil.getMonth() + parseInt(duration));

        const invResult = await query(
            'INSERT INTO investments (user_id, package_id, amount, status, duration_months, lock_up_until) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.user.id, packageId, amount, 'active', duration, lockUpUntil]
        );

        await query(
            'INSERT INTO transactions (user_id, type, amount, status, metadata) VALUES ($1, $2, $3, $4, $5)',
            [req.user.id, 'INVESTMENT', amount, 'completed', JSON.stringify({ packageId, packageName: pkg.name, rewardsUsed, usdUsed })]
        );

        await query('COMMIT');

        // Process referral commission asynchronously
        handleReferralCommission(req.user.id, amount, {
            packageId,
            packageName: pkg.name
        });

        // 5. Send Premium Confirmation Email
        try {
            const userResult = await query('SELECT email, full_name FROM users WHERE id = $1', [req.user.id]);
            if (userResult.rows.length > 0) {
                const user = userResult.rows[0];
                await sendInvestmentConfirmation(user.email, user.full_name, pkg.name, amount, pkg.yield);
            }
        } catch (mailErr) {
            console.error('[FINANCE] Failed to send investment email:', mailErr);
        }

        res.status(201).json({ message: 'Investment created successfully', investment: invResult.rows[0] });

    } catch (err) {
        await query('ROLLBACK');
        res.status(500).json({ error: 'Investment failed', message: err.message });
    }
};

// --- WITHDRAWALS ---

const requestWithdrawal = async (req, res) => {
    const { amount, blockchain, network, destinationAddress } = req.body;

    try {
        // 1. Validate minimum amount
        if (parseFloat(amount) < 100) {
            return res.status(400).json({ error: 'Minimum withdrawal amount is $100' });
        }

        // 2. Check balance
        const walletResult = await query('SELECT * FROM wallets WHERE user_id = $1 AND type = $2', [req.user.id, 'USD']);
        if (walletResult.rows.length === 0 || parseFloat(walletResult.rows[0].balance) < parseFloat(amount)) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        await query('BEGIN');

        // 3. Deduct balance immediately (lock the funds)
        await query(
            'UPDATE wallets SET balance = balance - $1 WHERE id = $2',
            [amount, walletResult.rows[0].id]
        );

        // 4. Create pending transaction with structured metadata
        const metadata = { blockchain, network, destinationAddress };
        const result = await query(
            'INSERT INTO transactions (user_id, type, amount, status, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.id, 'WITHDRAWAL', amount, 'pending', JSON.stringify(metadata)]
        );

        await query('COMMIT');

        res.status(201).json({ message: 'Withdrawal request submitted', transaction: result.rows[0] });

    } catch (err) {
        await query('ROLLBACK');
        res.status(500).json({ error: 'Withdrawal failed', message: err.message });
    }
};

const getTransactions = async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch transactions', message: err.message });
    }
};

const createTransaction = async (req, res) => {
    let { type, amount, status, metadata } = req.body;

    // Handle multipart form data if metadata is sent as a string
    if (typeof metadata === 'string') {
        try {
            metadata = JSON.parse(metadata);
        } catch (e) {
            metadata = {};
        }
    }

    if (req.file) {
        metadata = { ...metadata, proofImageUrl: req.file.path || req.file.secure_url };
    }

    try {
        const result = await query(
            'INSERT INTO transactions (user_id, type, amount, status, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.id, type, amount, status || 'pending', JSON.stringify(metadata || {})]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create transaction', message: err.message });
    }
};

const getMarketData = async (req, res) => {
    try {
        const { id, timeframe } = req.params;
        const invResult = await query(
            `SELECT i.*, p.name as package_name, p.yield 
             FROM investments i 
             JOIN investment_packages p ON i.package_id = p.id 
             WHERE i.id = $1 AND i.user_id = $2`,
            [id, req.user.id]
        );
        if (invResult.rows.length === 0) return res.status(404).json({ error: 'Investment not found' });
        const inv = invResult.rows[0];
        const result = getMarketChart(inv.amount, timeframe, inv.package_name, {
            createdAt: inv.created_at,
            lockUpUntil: inv.lock_up_until,
            roi: inv.yield
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch market data' });
    }
};

const getPortfolioPerformance = async (req, res) => {
    try {
        const result = await query(
            `SELECT i.*, p.yield as package_yield 
             FROM investments i 
             JOIN investment_packages p ON i.package_id = p.id 
             WHERE i.user_id = $1 AND i.status = 'active'`,
            [req.user.id]
        );
        const profit = getPortfolioProfit(result.rows);
        res.json({ profit });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch portfolio performance' });
    }
};

// --- MATURITY CLAIM ---

const claimInvestment = async (req, res) => {
    const { id } = req.params;

    try {
        const invResult = await query(
            `SELECT i.*, p.yield 
             FROM investments i 
             JOIN investment_packages p ON i.package_id = p.id 
             WHERE i.id = $1 AND i.user_id = $2`,
            [id, req.user.id]
        );
        if (invResult.rows.length === 0) {
            return res.status(404).json({ error: 'Investment not found' });
        }
        const inv = invResult.rows[0];

        if (inv.status === 'completed') {
            return res.status(400).json({ error: 'Investment already claimed' });
        }

        const matured = new Date(inv.lock_up_until || inv.created_at).getTime() <= Date.now();
        if (!matured) {
            return res.status(400).json({ error: 'Investment has not reached maturity yet' });
        }

        const currentValue = getAccruedValue(inv.amount, inv.yield, inv.created_at, inv.lock_up_until);
        const profit = currentValue - parseFloat(inv.amount);

        await query('BEGIN');

        // Credit principal + accrued ROI to the USD wallet
        await query(
            'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 AND type = $3',
            [currentValue, req.user.id, 'USD']
        );

        // Mark investment completed
        await query(
            'UPDATE investments SET status = $1 WHERE id = $2',
            ['completed', id]
        );

        // Log transactions
        await query(
            'INSERT INTO transactions (user_id, type, amount, status, metadata) VALUES ($1, $2, $3, $4, $5)',
            [req.user.id, 'INVESTMENT_RETURN', currentValue, 'completed', JSON.stringify({ investmentId: id, packageName: inv.package_name || 'Investment' })]
        );
        if (profit > 0) {
            await query(
                'INSERT INTO transactions (user_id, type, amount, status, metadata) VALUES ($1, $2, $3, $4, $5)',
                [req.user.id, 'YIELD', profit, 'completed', JSON.stringify({ investmentId: id, source: 'Maturity ROI Accrual' })]
            );
        }

        await query('COMMIT');

        res.json({ message: 'Investment claimed successfully', amount: currentValue, profit });
    } catch (err) {
        await query('ROLLBACK');
        res.status(500).json({ error: 'Failed to claim investment', message: err.message });
    }
};

module.exports = { getPackages, getWallets, getInvestments, createInvestment, requestWithdrawal, getTransactions, createTransaction, getMarketData, getPortfolioPerformance, claimInvestment };

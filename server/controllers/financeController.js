const { query } = require('../config/db');
const { sendInvestmentConfirmation } = require('../config/mailer');
const { getDynamicYield, getMarketChart, getPortfolioProfit } = require('../utils/marketEngine');
const { handleReferralCommission } = require('../utils/referral');

const getPackages = async (req, res) => {
    try {
        const result = await query('SELECT * FROM investment_packages ORDER BY min_investment ASC');
        const dynamicPackages = result.rows.map(pkg => ({
            ...pkg,
            yield: getDynamicYield(pkg.yield, pkg.name)
        }));
        res.json(dynamicPackages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch packages', message: err.message });
    }
};

// --- WALLETS ---

const getWallets = async (req, res) => {
    try {
        // Ensure the user has a USD escrow wallet (auto-create for existing users)
        const usdCheck = await query(
            'SELECT id FROM wallets WHERE user_id = $1 AND type = $2',
            [req.user.id, 'USD']
        );
        if (usdCheck.rows.length === 0) {
            await query(
                'INSERT INTO wallets (user_id, type, balance) VALUES ($1, $2, $3)',
                [req.user.id, 'USD', 0]
            );
        }

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
        const dynamicInvestments = result.rows.map(inv => ({
            ...inv,
            yield: getDynamicYield(inv.yield, inv.package_name)
        }));
        res.json(dynamicInvestments);
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

        // 2. Check minimum investment
        if (parseFloat(amount) < parseFloat(pkg.min_investment)) {
            return res.status(400).json({ error: `Minimum investment for this package is $${pkg.min_investment}` });
        }

        // 3. Check user balance (assuming we use internal wallets for some flows)
        // Note: For Web3 flows, verification happens in web3Controller. This is for balance-based investing.
        const walletResult = await query('SELECT * FROM wallets WHERE user_id = $1 AND type = $2', [req.user.id, 'USD']);
        if (walletResult.rows.length === 0 || parseFloat(walletResult.rows[0].balance) < parseFloat(amount)) {
            return res.status(400).json({ error: 'Insufficient balance in USD wallet' });
        }

        // 4. Deduct balance & Create records
        await query('BEGIN'); // Start transaction
        
        await query(
            'UPDATE wallets SET balance = balance - $1 WHERE id = $2',
            [amount, walletResult.rows[0].id]
        );

        const lockUpUntil = new Date();
        lockUpUntil.setMonth(lockUpUntil.getMonth() + parseInt(duration));

        const invResult = await query(
            'INSERT INTO investments (user_id, package_id, amount, status, duration_months, lock_up_until) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.user.id, packageId, amount, 'active', duration, lockUpUntil]
        );

        await query(
            'INSERT INTO transactions (user_id, type, amount, status, metadata) VALUES ($1, $2, $3, $4, $5)',
            [req.user.id, 'INVESTMENT', amount, 'completed', JSON.stringify({ packageId, packageName: pkg.name })]
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
            `SELECT i.*, p.name as package_name 
             FROM investments i 
             JOIN investment_packages p ON i.package_id = p.id 
             WHERE i.id = $1 AND i.user_id = $2`,
            [id, req.user.id]
        );
        if (invResult.rows.length === 0) return res.status(404).json({ error: 'Investment not found' });
        const inv = invResult.rows[0];
        const result = getMarketChart(inv.amount, timeframe, inv.package_name);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch market data' });
    }
};

const getPortfolioPerformance = async (req, res) => {
    try {
        const result = await query(
            `SELECT i.* FROM investments i WHERE i.user_id = $1 AND i.status = 'active'`,
            [req.user.id]
        );
        const profit = getPortfolioProfit(result.rows);
        res.json({ profit });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch portfolio performance' });
    }
};

module.exports = { getPackages, getWallets, getInvestments, createInvestment, requestWithdrawal, getTransactions, createTransaction, getMarketData, getPortfolioPerformance };

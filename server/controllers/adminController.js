const { query } = require('../config/db');

const getAdminStats = async (req, res) => {
    try {
        const totalAUM = await query('SELECT SUM(amount) FROM investments WHERE status = $1', ['active']);
        const totalUsers = await query('SELECT COUNT(*) FROM users WHERE role = $1', ['user']);
        const activeInvestments = await query('SELECT COUNT(*) FROM investments WHERE status = $1', ['active']);
        const pendingWithdrawals = await query('SELECT COUNT(*) FROM transactions WHERE type = $1 AND status = $2', ['WITHDRAWAL', 'pending']);
        
        const recentActivity = await query(
            `SELECT t.*, u.full_name 
             FROM transactions t 
             JOIN users u ON t.user_id = u.id 
             ORDER BY t.created_at DESC LIMIT 10`
        );

        res.json({
            stats: {
                totalAUM: totalAUM.rows[0].sum || 0,
                totalUsers: totalUsers.rows[0].count,
                activeInvestments: activeInvestments.rows[0].count,
                pendingWithdrawals: pendingWithdrawals.rows[0].count
            },
            recentActivity: recentActivity.rows
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch admin stats', message: err.message });
    }
};

const getAdminUsers = async (req, res) => {
    try {
        const result = await query(
            'SELECT id, email, full_name, tier, kyc_status, role, is_blocked, failed_attempts, created_at FROM users WHERE role = $1 ORDER BY created_at DESC',
            ['user']
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users', message: err.message });
    }
};

const getAdminInvestments = async (req, res) => {
    try {
        const result = await query(
            `SELECT i.*, u.full_name, u.email, p.name as package_name, p.type as package_type 
             FROM investments i 
             JOIN users u ON i.user_id = u.id 
             JOIN investment_packages p ON i.package_id = p.id 
             ORDER BY i.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch investments', message: err.message });
    }
};

const getAdminTransactions = async (req, res) => {
    try {
        const result = await query(
            `SELECT t.*, u.full_name, u.email 
             FROM transactions t 
             JOIN users u ON t.user_id = u.id 
             ORDER BY t.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch transactions', message: err.message });
    }
};

const manageInvestment = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'rejected'

    try {
        await query(
            'UPDATE investments SET status = $1 WHERE id = $2',
            [status, id]
        );
        res.json({ message: `Investment ${status} successfully` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to manage investment', message: err.message });
    }
};

const approveTransaction = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'completed' or 'rejected'

    try {
        await query('BEGIN');

        // 1. Get the transaction details
        const txResult = await query('SELECT * FROM transactions WHERE id = $1', [id]);
        if (txResult.rows.length === 0) {
            await query('ROLLBACK');
            return res.status(404).json({ error: 'Transaction not found' });
        }
        const tx = txResult.rows[0];

        if (tx.status !== 'pending') {
            await query('ROLLBACK');
            return res.status(400).json({ error: 'Transaction is already processed' });
        }

        // 2. Update transaction status
        await query(
            'UPDATE transactions SET status = $1 WHERE id = $2',
            [status, id]
        );

        // 3. If it was a DEPOSIT and is being COMPLETED, add to user's USD balance
        if (tx.type === 'DEPOSIT' && status === 'completed') {
            const walletResult = await query(
                'SELECT * FROM wallets WHERE user_id = $1 AND type = $2',
                [tx.user_id, 'USD']
            );
            
            if (walletResult.rows.length > 0) {
                await query(
                    'UPDATE wallets SET balance = balance + $1 WHERE id = $2',
                    [tx.amount, walletResult.rows[0].id]
                );
            } else {
                // If somehow they don't have a USD wallet, create it
                await query(
                    'INSERT INTO wallets (user_id, type, balance) VALUES ($1, $2, $3)',
                    [tx.user_id, 'USD', tx.amount]
                );
            }
        }

        await query('COMMIT');
        res.json({ message: `Transaction ${status} successfully` });

    } catch (err) {
        await query('ROLLBACK');
        res.status(500).json({ error: 'Failed to approve transaction', message: err.message });
    }
};

const getAdminChats = async (req, res) => {
    try {
        const result = await query(
            `SELECT DISTINCT ON (user_id) m.*, u.full_name 
             FROM chat_messages m 
             JOIN users u ON m.user_id = u.id 
             ORDER BY user_id, m.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch chats', message: err.message });
    }
};

const replyToChat = async (req, res) => {
    const { userId } = req.params;
    const { message } = req.body;

    try {
        const result = await query(
            'INSERT INTO chat_messages (user_id, admin_id, message, sender_type) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, req.user.id, message, 'admin']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to send reply', message: err.message });
    }
};

const getAdminChatHistory = async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await query(
            'SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch chat history', message: err.message });
    }
};

const toggleUserBlock = async (req, res) => {
    const { userId } = req.params;
    const { isBlocked } = req.body;

    try {
        await query(
            'UPDATE users SET is_blocked = $1, failed_attempts = $2 WHERE id = $3',
            [isBlocked, isBlocked ? 4 : 0, userId]
        );
        res.json({ message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user block status', message: err.message });
    }
};

const getAdminPackages = async (req, res) => {
    try {
        const result = await query('SELECT * FROM investment_packages ORDER BY min_investment ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch packages', message: err.message });
    }
};

/**
 * Suggest a default total ROI for a package based on its price range.
 * Smaller packages carry smaller returns — admin can always override.
 */
const suggestRoi = (minInvestment) => {
    const min = parseFloat(minInvestment) || 0;
    if (min < 1000) return 3;
    if (min < 5000) return 6;
    if (min < 10000) return 9;
    if (min < 50000) return 12;
    return 14;
};

const ROI_MIN = 0.1;
const ROI_MAX = 30;

const updatePackage = async (req, res) => {
    const { id } = req.params;
    const { name, min_investment, max_investment, yield: yieldRate, description, type } = req.body;

    try {
        const currentResult = await query('SELECT * FROM investment_packages WHERE id = $1', [id]);
        if (currentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Package not found' });
        }

        const min = parseFloat(min_investment ?? currentResult.rows[0].min_investment);
        const max = parseFloat(max_investment ?? currentResult.rows[0].max_investment);

        if (!(min > 0)) {
            return res.status(400).json({ error: 'Minimum investment must be greater than zero' });
        }
        if (!(max >= min)) {
            return res.status(400).json({ error: 'Maximum investment must be greater than or equal to minimum' });
        }

        // Total ROI — auto-suggest from price when not provided, clamp to sane band
        let roi = parseFloat(String(yieldRate ?? '').replace(/[^0-9.-]/g, ''));
        if (isNaN(roi)) {
            roi = suggestRoi(min);
        }
        roi = Math.min(ROI_MAX, Math.max(ROI_MIN, roi));
        const roiStr = `${roi > 0 ? '+' : ''}${roi}%`;

        await query(
            `UPDATE investment_packages 
             SET name = $1, min_investment = $2, max_investment = $3, yield = $4, description = $5, type = $6 
             WHERE id = $7`,
            [name, min, max, roiStr, description, type, id]
        );
        res.json({ message: 'Package updated successfully', roi: roiStr, min_investment: min, max_investment: max });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update package', message: err.message });
    }
};

module.exports = { 
    getAdminStats, 
    getAdminUsers, 
    getAdminInvestments, 
    getAdminTransactions, 
    manageInvestment, 
    approveTransaction, 
    getAdminChats, 
    replyToChat,
    getAdminChatHistory,
    toggleUserBlock,
    getAdminPackages,
    updatePackage
};

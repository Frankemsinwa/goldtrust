const { query } = require('../config/db');

/**
 * Get referral statistics and payout ledger for the logged-in user.
 */
const getReferralStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get user's own referral code
        const userResult = await query('SELECT referral_code FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const referralCode = userResult.rows[0].referral_code;

        // 2. Get referred users list with investment analytics
        const referredUsersResult = await query(
            `SELECT 
                u.id, 
                u.email, 
                u.full_name, 
                u.created_at,
                COUNT(i.id)::int as investment_count,
                COALESCE(SUM(i.amount), 0)::float as total_invested
             FROM users u
             LEFT JOIN investments i ON u.id = i.user_id AND i.status = 'active'
             WHERE u.referred_by = $1
             GROUP BY u.id
             ORDER BY u.created_at DESC`,
            [userId]
        );
        const referredUsers = referredUsersResult.rows;

        // 3. Get commission transactions
        const commissionsResult = await query(
            "SELECT id, amount, status, metadata, created_at FROM transactions WHERE user_id = $1 AND type = 'REFERRAL_COMMISSION' ORDER BY created_at DESC",
            [userId]
        );
        const commissions = commissionsResult.rows;

        // Calculate total earned and active referred investors count
        const totalEarned = commissions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
        const investedReferredCount = referredUsers.filter(u => u.investment_count > 0).length;

        res.json({
            referralCode,
            referredCount: referredUsers.length,
            investedReferredCount,
            totalEarned,
            referredUsers,
            commissions
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch referral stats', message: err.message });
    }
};

module.exports = { getReferralStats };

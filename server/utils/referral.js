const { query } = require('../config/db');

/**
 * Checks if a user has a referrer, and if so, pays them a 5% commission in their USD escrow balance.
 * @param {number} investorId - The ID of the user who invested.
 * @param {number|string} amount - The amount invested.
 * @param {object} investmentDetails - Metadata about the investment (e.g., packageId, packageName).
 */
const handleReferralCommission = async (investorId, amount, investmentDetails) => {
    try {
        // 1. Get investor's referrer
        const userResult = await query(
            'SELECT referred_by, full_name, email FROM users WHERE id = $1',
            [investorId]
        );
        
        if (userResult.rows.length === 0) return;
        const investor = userResult.rows[0];
        const referrerId = investor.referred_by;
        
        if (!referrerId) {
            console.log(`[REFERRAL] Investor ${investor.full_name} (${investorId}) has no referrer. Skipping commission.`);
            return;
        }

        // 2. Calculate 5% commission
        const commissionAmount = parseFloat(amount) * 0.05;
        if (commissionAmount <= 0) return;

        console.log(`[REFERRAL] Investor ${investor.full_name} (${investorId}) invested $${amount}. Crediting 5% commission ($${commissionAmount}) to Referrer ID ${referrerId}`);

        // 3. Update referrer's USD wallet & record transaction
        // First check if referrer has a USD wallet
        const walletResult = await query(
            'SELECT id, balance FROM wallets WHERE user_id = $1 AND type = $2',
            [referrerId, 'USD']
        );

        await query('BEGIN');
        
        if (walletResult.rows.length > 0) {
            await query(
                'UPDATE wallets SET balance = balance + $1 WHERE id = $2',
                [commissionAmount, walletResult.rows[0].id]
            );
        } else {
            await query(
                'INSERT INTO wallets (user_id, type, balance) VALUES ($1, $2, $3)',
                [referrerId, 'USD', commissionAmount]
            );
        }

        // Create a transaction record for the referrer
        const metadata = {
            referredUserId: investorId,
            referredUserName: investor.full_name,
            referredUserEmail: investor.email,
            investmentAmount: amount,
            commissionRate: 0.05,
            ...investmentDetails
        };

        await query(
            'INSERT INTO transactions (user_id, type, amount, status, metadata) VALUES ($1, $2, $3, $4, $5)',
            [
                referrerId,
                'REFERRAL_COMMISSION',
                commissionAmount,
                'completed',
                JSON.stringify(metadata)
            ]
        );

        await query('COMMIT');
        console.log(`[REFERRAL] Commission of $${commissionAmount} successfully credited to Referrer ${referrerId}`);

    } catch (err) {
        await query('ROLLBACK');
        console.error('[REFERRAL ERROR] Failed to process referral commission:', err);
    }
};

module.exports = { handleReferralCommission };

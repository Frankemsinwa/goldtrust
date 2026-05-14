const { query } = require('../config/db');

const distributeYield = async () => {
    try {
        console.log('[YIELD ENGINE] Starting distribution cycle...');

        // 1. Get all active investments
        const activeInvestments = await query(
            `SELECT i.*, p.yield as yield_percentage 
             FROM investments i 
             JOIN investment_packages p ON i.package_id = p.id 
             WHERE i.status = 'active'`
        );

        for (const inv of activeInvestments.rows) {
            // Parse yield (e.g., "12.5% APY" -> 0.125 / 365 for daily)
            const yieldPercent = parseFloat(inv.yield_percentage.replace(/[^0-9.]/g, '')) / 100;
            const dailyYield = (parseFloat(inv.amount) * yieldPercent) / 365;

            await query('BEGIN');

            // 2. Add yield to user's USD wallet
            await query(
                'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 AND type = $3',
                [dailyYield, inv.user_id, 'USD']
            );

            // 3. Log the yield transaction
            await query(
                'INSERT INTO transactions (user_id, type, amount, status, metadata) VALUES ($1, $2, $3, $4, $5)',
                [inv.user_id, 'YIELD', dailyYield, 'completed', JSON.stringify({ investmentId: inv.id, source: 'Daily Yield Distribution' })]
            );

            await query('COMMIT');
        }

        console.log(`[YIELD ENGINE] Cycle complete. Processed ${activeInvestments.rows.length} investments.`);
    } catch (err) {
        console.error('[YIELD ENGINE] Cycle failed:', err);
        if (query) await query('ROLLBACK');
    }
};

// In a real production app, we would use node-cron to run this daily.
// For now, we'll export it so it can be triggered.
module.exports = distributeYield;

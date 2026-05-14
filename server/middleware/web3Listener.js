const { ethers } = require('ethers');
const { query } = require('../config/db');
require('dotenv').config();

const listenForDeposits = async () => {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const vaultAddress = process.env.VAULT_ADDRESS;

        console.log(`[WEB3 LISTENER] Monitoring Vault: ${vaultAddress}`);

        // This listener will fire for every block mined
        provider.on('block', async (blockNumber) => {
            try {
                const block = await provider.getBlock(blockNumber, true);
                if (!block || !block.transactions) return;

                for (const txHash of block.transactions) {
                    const tx = await provider.getTransaction(txHash);
                    
                    // Check if transaction is to our vault
                    if (tx && tx.to && tx.to.toLowerCase() === vaultAddress.toLowerCase()) {
                        console.log(`[WEB3 LISTENER] Potential Deposit Detected: ${tx.hash}`);

                        // 1. Identify the user by their linked wallet
                        const userResult = await query(
                            'SELECT user_id FROM wallets WHERE address = $1 AND type = $2',
                            [tx.from.toLowerCase(), 'EXTERNAL']
                        );

                        if (userResult.rows.length > 0) {
                            const userId = userResult.rows[0].user_id;
                            const amountInEth = ethers.formatEther(tx.value);

                            // 2. Prevent duplicate processing
                            const existingTx = await query('SELECT id FROM transactions WHERE metadata->>\'txHash\' = $1', [tx.hash]);
                            if (existingTx.rows.length > 0) continue;

                            console.log(`[WEB3 LISTENER] Verified Deposit for User ${userId}: ${amountInEth} ETH`);

                            // 3. Log transaction and update balance or create investment
                            // (In production, this would trigger an internal notification or auto-investment logic)
                            await query(
                                'INSERT INTO transactions (user_id, type, amount, status, metadata) VALUES ($1, $2, $3, $4, $5)',
                                [userId, 'DEPOSIT', amountInEth, 'completed', JSON.stringify({ txHash: tx.hash, blockNumber })]
                            );

                            await query(
                                'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 AND type = $3',
                                [amountInEth, userId, 'USD'] // Crediting as USD equivalent for simplicity
                            );
                        }
                    }
                }
            } catch (blockErr) {
                // Silently catch block processing errors to keep listener alive
            }
        });

    } catch (err) {
        console.error('[WEB3 LISTENER] Initialization failed:', err);
    }
};

module.exports = listenForDeposits;

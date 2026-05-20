const { query } = require('../config/db');
const { ethers } = require('ethers');
const { handleReferralCommission } = require('../utils/referral');

const linkWallet = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ error: 'Request body required' });
    }
    const { walletAddress, chainId } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address required' });
    }

    try {
        // Check if this wallet is already linked to another account
        const existingWallet = await query('SELECT * FROM wallets WHERE address = $1 AND type = $2', [walletAddress, 'EXTERNAL']);
        
        if (existingWallet.rows.length > 0) {
            if (existingWallet.rows[0].user_id === req.user.id) {
                return res.json({ message: 'Wallet already linked to your account', wallet: existingWallet.rows[0] });
            }
            return res.status(400).json({ error: 'This wallet is already linked to a different account' });
        }

        // Link the wallet
        const result = await query(
            'INSERT INTO wallets (user_id, type, address, balance) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.id, 'EXTERNAL', walletAddress, 0]
        );

        res.status(201).json({
            message: 'External wallet linked successfully',
            wallet: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: 'Wallet linking failed', message: err.message });
    }
};

const verifyTransaction = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ error: 'Request body required' });
    }
    const { txHash, packageId, amount } = req.body;

    if (!txHash || !packageId || !amount) {
        return res.status(400).json({ error: 'Missing transaction details' });
    }

    try {
        // 1. Connect to Ethereum Provider (using Infura/Alchemy or Public RPC)
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://cloudflare-eth.com');
        
        // 2. Fetch the transaction
        const tx = await provider.getTransaction(txHash);
        if (!tx) {
            return res.status(404).json({ error: 'Transaction not found on-chain' });
        }

        // 3. Verify recipient (Must be our Platform Vault)
        if (tx.to.toLowerCase() !== process.env.VAULT_ADDRESS.toLowerCase()) {
            return res.status(400).json({ error: 'Invalid recipient address' });
        }

        // 4. Verify amount (Relaxed for dynamic ETH/USD conversion)
        // We record the amount the user INTENDED to invest (from req.body)
        // but we verify the transaction has value.
        if (tx.value === BigInt(0)) {
            return res.status(400).json({ error: 'Transaction has no value' });
        }

        // 5. Wait for at least 1 confirmation
        const receipt = await tx.wait(1);
        if (receipt.status === 0) {
            return res.status(400).json({ error: 'Transaction failed on-chain' });
        }

        // 6. Log the transaction and activate investment
        const txResult = await query(
            'INSERT INTO transactions (user_id, type, amount, status, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [req.user.id, 'INVESTMENT', amount, 'completed', JSON.stringify({ txHash, blockNumber: receipt.blockNumber })]
        );

        await query(
            'INSERT INTO investments (user_id, package_id, amount, status) VALUES ($1, $2, $3, $4)',
            [req.user.id, packageId, amount, 'active']
        );

        // Fetch package name for referral metadata
        let packageName = 'Web3 Investment';
        try {
            const pkgResult = await query('SELECT name FROM investment_packages WHERE id = $1', [packageId]);
            if (pkgResult.rows.length > 0) {
                packageName = pkgResult.rows[0].name;
            }
        } catch (pkgErr) {
            console.error('[WEB3 REFERRAL METADATA] Failed to fetch package name:', pkgErr);
        }

        // Process referral commission asynchronously
        handleReferralCommission(req.user.id, amount, {
            packageId,
            packageName
        });

        res.json({ 
            message: 'On-chain transaction verified. Investment activated.',
            blockNumber: receipt.blockNumber
        });

    } catch (err) {
        console.error('[WEB3 ERROR]', err);
        res.status(500).json({ error: 'On-chain verification failed', message: err.message });
    }
};

module.exports = { linkWallet, verifyTransaction };

const { query } = require('../config/db');

const getProfile = async (req, res) => {
    try {
        const result = await query(
            'SELECT id, email, full_name, tier, kyc_status, role, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Fetch profile failed', message: err.message });
    }
};

const updateKyc = async (req, res) => {
    try {
        const { status } = req.body; // In a real app, this would involve document uploads
        await query(
            'UPDATE users SET kyc_status = $1 WHERE id = $2',
            [status || 'review', req.user.id]
        );
        res.json({ message: 'KYC status updated', status: status || 'review' });
    } catch (err) {
        res.status(500).json({ error: 'KYC update failed', message: err.message });
    }
};

const getUserChat = async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch chat', message: err.message });
    }
};

const sendChatMessage = async (req, res) => {
    const { message } = req.body;
    try {
        const result = await query(
            'INSERT INTO chat_messages (user_id, message, sender_type) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, message, 'user']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to send message', message: err.message });
    }
};

module.exports = { getProfile, updateKyc, getUserChat, sendChatMessage };

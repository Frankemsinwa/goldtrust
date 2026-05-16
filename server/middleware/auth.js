const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied', message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user is blocked
        const { query } = require('../config/db');
        const userResult = await query('SELECT is_blocked FROM users WHERE id = $1', [decoded.id]);
        
        if (userResult.rows.length > 0 && userResult.rows[0].is_blocked) {
            // Special case: allow chat access even if blocked? 
            // LO wants them to message admin.
            // Let's attach is_blocked to req.user and let controllers decide.
            decoded.is_blocked = true;
        } else {
            decoded.is_blocked = false;
        }

        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token', message: 'Authentication failed' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied', message: 'Administrative privileges required' });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };

const { query } = require('../config/db');

const getPackages = async (req, res) => {
    try {
        const result = await query('SELECT * FROM investment_packages ORDER BY min_investment ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch packages', message: err.message });
    }
};

const schema = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    tier VARCHAR(50) DEFAULT 'Standard',
    kyc_status VARCHAR(50) DEFAULT 'pending',
    role VARCHAR(20) DEFAULT 'user',
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    otp VARCHAR(6),
    otp_expiry TIMESTAMP,
    failed_attempts INTEGER DEFAULT 0,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    balance DECIMAL(20, 8) DEFAULT 0,
    address VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS investment_packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    yield VARCHAR(50) NOT NULL,
    min_investment DECIMAL(20, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS investments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    package_id INTEGER REFERENCES investment_packages(id),
    amount DECIMAL(20, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    lock_up_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    admin_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    sender_type VARCHAR(20) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const initDb = async () => {
    try {
        console.log('[SCHEMA] Initializing database tables...');
        await query(schema);
        // Migration: Add OTP columns if they don't exist
        await query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(6);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;
        `);

        // Seed default packages if empty
        const pkgs = await query('SELECT COUNT(*) FROM investment_packages');
        if (parseInt(pkgs.rows[0].count) === 0) {
            console.log('[SCHEMA] Seeding default investment packages...');
            await query(`
                INSERT INTO investment_packages (name, type, yield, min_investment, description) VALUES
                ('Alpha Bitcoin Core', 'crypto', '+14.2%', 5000, 'Direct institutional exposure to BTC liquidity.'),
                ('Ethereum Yield Plus', 'crypto', '+11.8%', 3000, 'Smart contract driven yield optimization.'),
                ('Blue Chip Tech', 'stocks', '+8.4%', 2500, 'Imperial tech sector giants and AI growth.'),
                ('Emerging Markets', 'stocks', '+15.6%', 1000, 'High-growth potential in developing economies.'),
                ('West African Mining', 'gold', '+12.1%', 10000, 'Direct profit participation in physical gold extraction.'),
                ('Physical Bullion', 'gold', '+4.2%', 50000, 'Allocated physical gold bars in Zurich vaults.'),
                ('Micro Crypto Starter', 'crypto', '+9.5%', 50, 'Entry-level crypto asset diversification.');
            `);
        }

        console.log('[SCHEMA] All tables verified/created successfully');
    } catch (err) {
        console.error('[SCHEMA] Initialization failed:', err);
        process.exit(1);
    }
};

module.exports = initDb;

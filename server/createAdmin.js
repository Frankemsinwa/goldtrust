const { query } = require('./config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdmin = async (email, password, fullName) => {
    try {
        console.log(`[ADMIN CREATOR] Starting creation for: ${email}`);
        
        // Check if user already exists
        const checkUser = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            console.error(`[ERROR] User with email ${email} already exists.`);
            process.exit(1);
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert admin user
        const result = await query(
            'INSERT INTO users (email, password_hash, full_name, role, is_email_verified) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [email, passwordHash, fullName, 'admin', true]
        );

        console.log(`[SUCCESS] Admin created successfully! ID: ${result.rows[0].id}`);
        process.exit(0);
    } catch (err) {
        console.error('[FATAL ERROR]', err);
        process.exit(1);
    }
};

// Get arguments from command line
const args = process.argv.slice(2);
if (args.length < 3) {
    console.log('Usage: node createAdmin.js <email> <password> <fullName>');
    console.log('Example: node createAdmin.js admin@goldtrust.com SecurePass123 "System Admin"');
    process.exit(1);
}

const [email, password, fullName] = args;
createAdmin(email, password, fullName);

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../config/db');
const { ethers } = require('ethers');
const { sendOTP } = require('../config/mailer');

const register = async (req, res) => {
    const { email, password, fullName } = req.body;

    try {
        // Check if user exists
        const userExists = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create user
        const newUser = await query(
            'INSERT INTO users (email, password_hash, full_name, otp, otp_expiry) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, tier, role, is_email_verified',
            [email, hashedPassword, fullName, otp, otpExpiry]
        );

        // Create default Imperial Balance (USD escrow wallet)
        await query(
            'INSERT INTO wallets (user_id, type, balance) VALUES ($1, $2, $3)',
            [newUser.rows[0].id, 'USD', 0]
        );

        // Send OTP via email
        const emailSent = await sendOTP(email, otp);

        console.log(`[AUTH] New user registered: ${email}`);
        if (!emailSent) {
            console.log(`[AUTH] Failed to send email to ${email}. OTP: ${otp}`);
        }

        res.status(201).json({ 
            message: 'User registered successfully. Please check your email for the verification code.',
            emailSent,
            user: newUser.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed', message: err.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check if account is blocked
        if (user.is_blocked) {
            return res.status(403).json({ 
                error: 'Account locked', 
                message: 'Your account has been locked due to too many failed login attempts. Please contact support or an admin to unblock your account.' 
            });
        }
        
        // Check if email is verified
        if (!user.is_email_verified) {
            return res.status(403).json({ 
                error: 'Email not verified', 
                message: 'Please verify your email before logging in.',
                email: user.email 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            const newAttempts = user.failed_attempts + 1;
            const maxAttempts = 4;
            
            if (newAttempts >= maxAttempts) {
                await query('UPDATE users SET failed_attempts = $1, is_blocked = TRUE WHERE id = $2', [newAttempts, user.id]);
                return res.status(403).json({ 
                    error: 'Account locked', 
                    message: 'Too many failed attempts. Your account has been locked for security reasons.' 
                });
            } else {
                await query('UPDATE users SET failed_attempts = $1 WHERE id = $2', [newAttempts, user.id]);
                const remaining = maxAttempts - newAttempts;
                return res.status(400).json({ 
                    error: 'Invalid credentials', 
                    message: `Invalid password. You have ${remaining} attempts remaining before your account is locked.` 
                });
            }
        }

        // Reset failed attempts on successful login
        await query('UPDATE users SET failed_attempts = 0 WHERE id = $1', [user.id]);

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                tier: user.tier,
                role: user.role,
                kycStatus: user.kyc_status
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Login failed', message: err.message });
    }
};

const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    try {
        const result = await query(
            'SELECT * FROM users WHERE email = $1 AND otp = $2 AND otp_expiry > NOW()',
            [email, otp]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        await query(
            'UPDATE users SET is_email_verified = TRUE, otp = NULL, otp_expiry = NULL WHERE email = $1',
            [email]
        );

        res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (err) {
        res.status(500).json({ error: 'Verification failed', message: err.message });
    }
};

const resendOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        await query(
            'UPDATE users SET otp = $1, otp_expiry = $2 WHERE email = $3',
            [otp, otpExpiry, email]
        );

        const emailSent = await sendOTP(email, otp);

        res.json({ 
            message: 'Verification code resent successfully.',
            emailSent
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to resend OTP', message: err.message });
    }
};

module.exports = { register, login, verifyOTP, resendOTP };

const express = require('express');
const router = express.Router();
const { register, login, verifyOTP, resendOTP, forgotPassword, resetPassword } = require('../controllers/authController');
const { getProfile, updateKyc, getUserChat, sendChatMessage, sendSupportMessage } = require('../controllers/userController');
const { linkWallet, verifyTransaction } = require('../controllers/web3Controller');
const { getPackages, getWallets, getInvestments, createInvestment, requestWithdrawal, getTransactions, createTransaction, getMarketData, getPortfolioPerformance } = require('../controllers/financeController');
const { 
    getAdminStats, 
    getAdminUsers, 
    getAdminInvestments, 
    getAdminTransactions, 
    manageInvestment, 
    approveTransaction, 
    getAdminChats, 
    replyToChat,
    getAdminChatHistory,
    toggleUserBlock
} = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Auth routes
const authRouter = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: {type: string}
 *               password: {type: string}
 *               fullName: {type: string}
 *     responses:
 *       201: {description: User created}
 */
authRouter.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: {type: string}
 *               password: {type: string}
 *     responses:
 *       200: {description: Successful login}
 */
authRouter.post('/login', login);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify user email with OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: {type: string}
 *               otp: {type: string}
 *     responses:
 *       200: {description: Email verified}
 */
authRouter.post('/verify-otp', verifyOTP);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP to user email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: {type: string}
 *     responses:
 *       200: {description: OTP resent}
 */
authRouter.post('/resend-otp', resendOTP);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Initiate password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: {type: string}
 *     responses:
 *       200: {description: Reset code sent}
 */
authRouter.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with OTP code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: {type: string}
 *               otp: {type: string}
 *               newPassword: {type: string}
 *     responses:
 *       200: {description: Password reset successful}
 */
authRouter.post('/reset-password', resetPassword);

router.use('/auth', authRouter);

// User routes (Protected)
/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security: [{bearerAuth: []}]
 */
router.get('/profile', authMiddleware, getProfile);

/**
 * @swagger
 * /api/kyc:
 *   put:
 *     summary: Update KYC status
 *     tags: [User]
 *     security: [{bearerAuth: []}]
 */
router.put('/kyc', authMiddleware, updateKyc);
router.get('/chat', authMiddleware, getUserChat);
router.post('/chat', authMiddleware, sendChatMessage);
router.post('/chat/support', sendSupportMessage);

// Package routes
router.get('/packages', getPackages);

// Web3 routes (Protected)
/**
 * @swagger
 * /api/wallet/link:
 *   post:
 *     summary: Link external wallet
 *     tags: [Web3]
 *     security: [{bearerAuth: []}]
 */
router.post('/wallet/link', authMiddleware, linkWallet);

/**
 * @swagger
 * /api/wallet/verify-tx:
 *   post:
 *     summary: Verify on-chain transaction
 *     tags: [Web3]
 *     security: [{bearerAuth: []}]
 */
router.post('/wallet/verify-tx', authMiddleware, verifyTransaction);

// Finance routes (Protected)
/**
 * @swagger
 * /api/wallets:
 *   get:
 *     summary: List user wallets
 *     tags: [Finance]
 *     security: [{bearerAuth: []}]
 */
router.get('/wallets', authMiddleware, getWallets);

/**
 * @swagger
 * /api/investments:
 *   get:
 *     summary: List user investments
 *     tags: [Finance]
 *     security: [{bearerAuth: []}]
 *   post:
 *     summary: Create new investment
 *     tags: [Finance]
 *     security: [{bearerAuth: []}]
 */
router.get('/investments', authMiddleware, getInvestments);
router.post('/investments', authMiddleware, createInvestment);
router.get('/investments/:id/market-data/:timeframe', authMiddleware, getMarketData);
router.get('/portfolio/performance', authMiddleware, getPortfolioPerformance);

/**
 * @swagger
 * /api/withdrawals:
 *   post:
 *     summary: Request withdrawal
 *     tags: [Finance]
 *     security: [{bearerAuth: []}]
 */
router.post('/withdrawals', authMiddleware, requestWithdrawal);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: List user transactions
 *     tags: [Finance]
 *     security: [{bearerAuth: []}]
 */
router.get('/transactions', authMiddleware, getTransactions);
router.post('/transactions', authMiddleware, createTransaction);

// Admin routes (Protected + Admin Only)
/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get platform stats
 *     tags: [Admin]
 *     security: [{bearerAuth: []}]
 */
router.get('/admin/stats', authMiddleware, adminMiddleware, getAdminStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Admin]
 *     security: [{bearerAuth: []}]
 */
router.get('/admin/users', authMiddleware, adminMiddleware, getAdminUsers);
router.put('/admin/users/:userId/block', authMiddleware, adminMiddleware, toggleUserBlock);

/**
 * @swagger
 * /api/admin/investments/{id}:
 *   put:
 *     summary: Manage an investment
 *     tags: [Admin]
 *     security: [{bearerAuth: []}]
 */
router.put('/admin/investments/:id', authMiddleware, adminMiddleware, manageInvestment);
router.get('/admin/investments', authMiddleware, adminMiddleware, getAdminInvestments);

router.get('/admin/transactions', authMiddleware, adminMiddleware, getAdminTransactions);
router.put('/admin/transactions/:id', authMiddleware, adminMiddleware, approveTransaction);

/**
 * @swagger
 * /api/admin/chats:
 *   get:
 *     summary: List all chats
 *     tags: [Admin]
 *     security: [{bearerAuth: []}]
 */
router.get('/admin/chats', authMiddleware, adminMiddleware, getAdminChats);

/**
 * @swagger
 * /api/admin/chats/{userId}/reply:
 *   post:
 *     summary: Reply to a chat
 *     tags: [Admin]
 *     security: [{bearerAuth: []}]
 */
router.post('/admin/chats/:userId/reply', authMiddleware, adminMiddleware, replyToChat);
router.get('/admin/chats/:userId', authMiddleware, adminMiddleware, getAdminChatHistory);

module.exports = router;

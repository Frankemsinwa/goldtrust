# GoldTrust Backend Implementation Plan

## Phase 1: Foundation & Database (PostgreSQL / Neon)
- **Database Schema Design**:
  - `users`: id, email, password_hash, full_name, tier (Standard, Premium, Elite), kyc_status, created_at.
  - `wallets`: id, user_id, type (USD, BTC, ETH), balance, address, created_at.
  - `investment_packages`: id, name, type (crypto, stocks, gold), yield, min_investment, description.
  - `investments`: id, user_id, package_id, amount, status (pending, active, completed), lock_up_until, created_at.
  - `transactions`: id, user_id, type (deposit, withdrawal, investment, yield), amount, status, metadata (wallet_address, tx_hash), created_at.
  - `chat_messages`: id, user_id, admin_id, message, sender_type (user, admin), is_read, created_at.
- **Project Structure Setup**:
  - Configure `express` app with `helmet`, `cors`, and `morgan`.
  - Database connection pool setup using `pg`.
  - Global error handling middleware.

## Phase 2: Authentication & User Management
- **Security Implementation**:
  - Password hashing with `bcryptjs`.
  - JWT generation and verification for session management.
  - `authMiddleware` for protecting routes.
  - `adminMiddleware` for restricting admin-only endpoints.
- **Endpoints**:
  - `POST /api/auth/register`: User registration with initial wallet creation.
  - `POST /api/auth/login`: Authentication and token issuance.
  - `GET /api/user/profile`: Retrieve logged-in user details.
  - `PUT /api/user/kyc`: Submit KYC data for verification.

## Phase 3: Financial Core (Wallets & Investments)
- **Logic Implementation**:
  - Investment creation with balance checks.
  - Mock yield distribution engine (background task simulation).
  - Transaction history logging.
- **Endpoints**:
  - `GET /api/wallets`: List all user wallets and balances.
  - `POST /api/investments`: Create a new investment (implements the "Micro Crypto Starter" logic).
  - `GET /api/investments`: List user's active and past investments.
  - `POST /api/withdrawals`: Create withdrawal requests.

## Phase 4: Admin Command Center
- **Logic Implementation**:
  - System-wide monitoring queries.
  - User and investment management.
  - Live chat bridging.
- **Endpoints**:
  - `GET /api/admin/stats`: Aggregate data for the "Command Center".
  - `GET /api/admin/users`: Paginated list of all users.
  - `PUT /api/admin/investments/:id`: Approve/Reject pending investments.
  - `GET /api/admin/chats`: List active support conversations.
  - `POST /api/admin/chats/:userId/reply`: Send support replies.

## Phase 5: Web3 & Future-Proofing (Ethers.js)
- **Integration**:
  - `ethers.js` utility for validating crypto addresses.
  - Mock blockchain event listener for deposits (can be upgraded to real listeners).
  - Secure vault address management.

## Phase 6: Integration & Testing
- **Frontend Sync**:
  - Update React `App.tsx` and `Dashboard.tsx` to use `fetch`/`axios` instead of mock data.
  - Environment variable configuration for API URLs.
- **Security Audit**:
  - Rate limiting for auth routes.
  - Input validation for all POST/PUT requests.

## Phase 7: Elite Multi-Chain Expansion (Elite Upgrade)
- **Multi-Chain Integration**:
  - Implement **WalletConnect v2** or **Dynamic.xyz** for unified wallet connection (MetaMask, Phantom, Ledger).
  - Expand `verifyTransaction` to support **Solana** (using `@solana/web3.js`) and **Bitcoin** (using `bitcoinjs-lib`).
  - Develop a unified "Chain-Agnostic" transaction listener.
  - Cross-chain yield settlement logic.

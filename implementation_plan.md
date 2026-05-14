# Multi-Method Institutional Deposit System

This plan outlines the architecture for a comprehensive deposit system that allows users to fund their internal "Imperial Balance" (escrow) using multiple methods. This ensures that users who do not use Web3 wallets can still participate in GoldTrust's investment strategies (Stock, Gold, and even manual Crypto).

## User Review Required

> [!IMPORTANT]
> **Manual Verification Workflow**: For non-Web3 deposits (Bank Wire, Manual Crypto), the system will rely on an admin verification flow. Users will submit a "Deposit Request" with proof (receipt or hash), and an admin must approve it before the balance reflects in the user's dashboard.

> [!NOTE]
> **Integration Priority**: We will start with a UI-based deposit flow and a backend handling system for "Pending" deposits, allowing the admin to "Complete" them via the existing admin controller logic.

## Proposed Changes

### [Frontend] Dashboard Enhancements

#### [MODIFY] [Dashboard.tsx](file:///c:/Users/PC/Desktop/GoldTrust/src/dashboard/Dashboard.tsx)
- Activate the "Deposit Funds" button in the header.
- Implement a `DepositModal` with the following steps:
    - **Step 1: Method Selection**: Choose between Bank Wire, Manual Crypto (BTC/USDT), or Credit Card (placeholder).
    - **Step 2: Amount Entry**: Enter the USD amount to deposit.
    - **Step 3: Payment Instructions**: Show bank details or platform-owned crypto addresses.
    - **Step 4: Proof Submission**: Allow users to paste a reference number or upload a "proof of payment" note.
- Update the internal balance display to reflect "Pending" vs "Available" if needed (or just show Available).

---

### [Backend] Deposit Management

#### [MODIFY] [financeController.js](file:///c:/Users/PC/Desktop/GoldTrust/server/controllers/financeController.js)
- **New Endpoint: `createDepositRequest`**: Creates a `transaction` record with type `DEPOSIT` and status `pending`. It will include metadata about the payment method used.
- **New Endpoint: `getDepositInstructions`**: Returns the platform's payment details (Bank info, BTC address, etc.) based on the selected method.

#### [MODIFY] [api.js](file:///c:/Users/PC/Desktop/GoldTrust/server/routes/api.js)
- Register the new deposit routes under the finance section.

#### [MODIFY] [adminController.js](file:///c:/Users/PC/Desktop/GoldTrust/server/controllers/adminController.js)
- **New Endpoint: `approveDeposit`**: Allows an admin to approve a pending deposit, which then updates the user's `USD` wallet balance.

---

### [Infrastructure] Environment & Configuration

#### [MODIFY] [.env](file:///c:/Users/PC/Desktop/GoldTrust/server/.env)
- Add variables for Platform Bank Details and Manual Crypto Deposit Addresses (BTC_VAULT, USDT_VAULT).

## Verification Plan

### Automated Tests
- Test deposit request creation via Postman/Insomnia.
- Verify that pending deposits do not affect balance.
- Verify that admin approval correctly increments the USD wallet balance.

### Manual Verification
- Use the **Browser Tool** to walk through the new Deposit Modal:
    1. Click "Deposit Funds".
    2. Select "Bank Wire".
    3. Input "$50,000".
    4. View instructions and "Submit".
    5. Check "History" tab for the pending deposit.

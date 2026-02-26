# GlobalSend - International Money Transfer App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- User authentication (login/register)
- Dashboard showing account balance and recent transactions
- Send money flow: select recipient country, enter amount, select currency, review fees and exchange rate, confirm transfer
- Transaction history page with status (pending, completed, failed)
- Recipient management: add/save recipients with name, country, bank details
- Exchange rate display (simulated static rates for major currencies: USD, EUR, GBP, CAD, AUD, JPY, NGN, INR, MXN, PHP)
- Transfer fee calculation (flat fee + percentage)
- Notifications/status messages on transfer completion

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend:
   - User accounts with balance (stored in ICP canister)
   - Recipients stored per user (name, country, bank/account info)
   - Transfer records with status, amount, currency, timestamp
   - Exchange rates (simulated static map)
   - Functions: register, login, getBalance, sendMoney, getTransactions, addRecipient, getRecipients

2. Frontend:
   - Login / Register pages
   - Dashboard: balance card, quick send button, recent transactions list
   - Send Money page: step-by-step form (select recipient or new, amount, currency, review & confirm)
   - Transaction History page
   - Recipients page (manage saved recipients)
   - Exchange rate summary widget

## UX Notes
- Clean, trustworthy financial app feel: dark navy/blue tones with green accents
- Step indicator on the send money flow
- Show estimated arrival time (e.g., "Arrives in 1-3 business days")
- Currency flag icons or emoji flags for country selection
- Mobile-responsive layout

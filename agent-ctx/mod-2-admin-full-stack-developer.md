# MOD-2-ADMIN — Master Central Admin Control Panel

## Scope
Build Module 2 of the Qtuor admin platform: Security (master credentials), Payment
Gateways (Stripe / PayPal + Bank Accounts), and Financial Ledgers (Student
Receivables + Teacher Payables with payout release).

## Backend contract verified
- `getSession()` returns `{ userId, role, email, name }` or `null`. Admin guard:
  `if (!session || session.role !== 'ADMIN') return 401`.
- `hashPassword / verifyPassword` from `@/lib/auth` (btoa obfuscation, demo only)
  — reused for the change-password flow.
- `setSession({ userId, role, email, name })` rewrites the cookie — called after
  email change so the session reflects the new email immediately.
- Schema already pushed: `PaymentGateway`, `BankAccount`, `StudentPayment`,
  `PayoutRelease`. Existing models reused: `User`, `TutorProfile`, `Wallet`,
  `WalletSplit`, `Notification`.

## Files created

### API routes (all admin-guarded)
1. `src/app/api/admin/security/route.ts`
   - `GET` → `{ id, email, name }` for the current admin.
   - `PATCH { currentPassword, newPassword?, newEmail? }` → verifies current pw,
     validates new pw (min 6, != current), validates email shape + uniqueness,
     updates `User`, then `setSession(...)` to keep the cookie in sync. Returns
     `{ ok, email }`. 400 on bad password / duplicate email / invalid input.

2. `src/app/api/admin/payment-gateways/route.ts`
   - `GET` → `{ gateways, bankAccounts }` (both ordered).
   - `PUT { id, ...partial }` → updates gateway by id; if `isActive: true`, the
     other gateways are deactivated in a transaction (single-active convention).
3. `src/app/api/admin/payment-gateways/[id]/route.ts`
   - `PATCH { ...partial }` → same partial update by id.
   - `DELETE` → removes the gateway.

4. `src/app/api/admin/bank-accounts/route.ts`
   - `GET` → `{ bankAccounts }`.
   - `POST { bankName, accountHolder, iban?, ... isDefault? }` → creates row;
     if `isDefault: true`, unsets others first (transaction).
5. `src/app/api/admin/bank-accounts/[id]/route.ts`
   - `PATCH { ...partial }` → updates row; toggles `isDefault` (unsets others).
   - `DELETE` → removes row.

6. `src/app/api/admin/ledger/receivables/route.ts`
   - `GET` → `{ payments: [...200 most recent], summary }` where summary =
     `{ total, successCount, failedCount, pendingCount, refundedCount, totalAmount }`.
7. `src/app/api/admin/ledger/payables/route.ts`
   - `GET` → `{ tutors: [...per-tutor wallet auditor], summary }`. Each tutor row:
     `{ id, name, email, country, wallet: {balance, pendingPayout, totalEarned,
     escrowHeld, platformRevenue}, lessonsCount, releasedSplits, releasable }`.
     Summary: `{ totalPending, totalReleased, totalEscrow, platformRevenue,
     totalReleasable }`. Uses `walletSplit.groupBy` to count RELEASED splits per
     tutor in a single query.
8. `src/app/api/admin/ledger/release-payment/route.ts`
   - `POST { tutorId, amount, method, destination? }` → validates wallet has
     balance ≥ amount; in a transaction: creates `PayoutRelease` (status
     'CLEARED', releasedBy = admin userId, masked destination),
     decrements `Wallet.balance`, creates a `Notification` (type TUTOR_PAYOUT,
     channel WHATSAPP, status SIMULATED) for the tutor. Returns
     `{ ok, release, wallet }`. 400 on insufficient balance.

### Seed script
9. `scripts/seed-payments.ts` — idempotent. Skips if any `StudentPayment` rows
   exist. Otherwise inserts 10 rows with varied students, plans, methods
   (STRIPE / PAYPAL / CARD / BANK_TRANSFER), statuses (SUCCESS / FAILED / PENDING
   / REFUNDED), and `paidAt` spread across the last 27 days. Maps to real student
   ids where the email matches a real `User` row, else uses `'guest-student'`.
   Ran once via `bun run scripts/seed-payments.ts` → `Seeded 10 StudentPayment rows.`

### React Query hooks (appended to `src/lib/queries.ts`)
- `useAdminSecurity()`, `useUpdateAdminSecurity()`
- `usePaymentGateways()`, `useUpdatePaymentGateway()`
- `useCreateBankAccount()`, `useUpdateBankAccount()`, `useDeleteBankAccount()`
- `useReceivablesLedger()`, `usePayablesLedger()`, `useReleasePayment()`
- Invalidation: payment-gateway updates invalidate `['payment-gateways']` (which
  also serves the bank-accounts UI since they share the response). Release
  payment invalidates `['payables-ledger', 'receivables-ledger', 'admin-dashboard']`.

### Admin Dashboard UI (`src/components/views/admin-dashboard.tsx`)
- Added icons to the lucide import: `Shield, Lock, CreditCard, BookOpen, Wallet,
  Eye, EyeOff, RefreshCw, Building2, KeyRound, Send, Landmark, Loader2`.
- Added the new query hook imports.
- Added 3 new `<TabsTrigger>` entries (`security`, `gateways`, `ledger`) after
  the `blog` tab trigger; preserved all existing tabs.
- Added 3 new `<TabsContent>` blocks rendering `<SecurityTab />`, `<GatewaysTab />`,
  `<LedgerTab />`.
- Appended 3 new component functions (and helpers) at the end of the file:
  - `SecurityTab()` — Master Credentials card (current email read-only, update
    email input + Save button, current/new/confirm password inputs with show/
    hide toggles, Update Password button) wired to `useUpdateAdminSecurity`;
    validates new == confirm, min 6 chars, != current. On email-change success
    also calls `setUser({...user, email})` so the navbar updates immediately.
    Includes a cosmetic "Platform Secret Keys" card with masked `••••` rows and
    a "Rotate Keys" button that toasts "Key rotation is coming soon." Note in UI
    that "Passwords are encrypted before being stored."
  - `GatewaysTab()` — Two side-by-side `GatewayCard` components (Stripe Connect
    + PayPal Payouts) each with: provider name, Active/Sandbox badges,
    `isActive` + `sandbox` Switches, provider-specific credential inputs
    (Stripe: publishableKey/secretKey/webhookSecret/payoutEmail; PayPal:
    clientId/clientSecret/payoutEmail), secret fields rendered with a
    PasswordInput helper (eye toggle). Save Credentials button per card.
    Below: `BankAccountsCard` with table (bank, holder, masked IBAN, SWIFT,
    currency, default badge), "Set Default" / Edit / Delete actions, and an
    "Add Bank Account" button opening `BankAccountDialog` (full form with
    bankName, accountHolder, iban, accountNumber, swiftCode, branchCode,
    country, currency, isDefault switch, notes). Edit mode pre-fills the form.
  - `LedgerTab()` — Sub-tab toggle (Student Receivables / Teacher Payables).
    - `ReceivablesSection`: 4 MiniStat cards (Total Received / Successful /
      Failed / Pending) + scrollable Table (Student, Plan, Amount, Method,
      Date, Invoice, Status badge color-coded green/red/amber/grey).
    - `PayablesSection`: 4 MiniStat cards (Pending Payouts / Total Released /
      In Escrow / Platform Revenue 45%) + scrollable Table (Tutor, Cumulative
      Earned, Releasable Wallet, Escrow Held, Lessons, Actions). "Release
      Payment" button per tutor → `ReleasePaymentDialog` (shows current balance,
      amount input defaulting to balance, method Select BANK_TRANSFER/PAYPAL/
      STRIPE, destination input) → `useReleasePayment` mutation; toast on
      success and automatic table refresh.
  - `MiniStat` helper (compact stat card with accent color variants).

## Verification

### Lint
- `bun run lint` → exit 0, **0 errors, 0 warnings** in any of my files.
  (The earlier 2 `no-img-element` warnings were in the BlogAdminTab code added
  by a sibling agent — those were resolved separately during this session, so
  the project is now fully lint-clean.)

### Dev server
- Dev server running on port 3000 (Turbopack). Home page returns 200. No
  compile errors in `dev.log` after my changes (`grep -aE "Error:|Module not
  found|TypeError|ReferenceError|SyntaxError" dev.log` → no matches).

### API smoke tests (admin cookie)
- `GET /api/admin/security` → 200 `{id, email:"admin@qtuor.com", name:"Qtuor Admin"}`
- `PATCH /api/admin/security` with wrong current password → 400
  `{error:"Current password incorrect"}`
- `GET /api/admin/payment-gateways` → 200 with both seeded gateways (STRIPE +
  PAYPAL, both inactive + sandbox) and the default bank account.
- `GET /api/admin/bank-accounts` → 200 with the default bank account.
- `GET /api/admin/ledger/receivables` → 200 with 10 seeded payments + summary
  (`totalReceived` aggregated from SUCCESS rows).
- `GET /api/admin/ledger/payables` → 200 with all 6 tutor wallets (balance,
  pendingPayout, totalEarned, escrowHeld, platformRevenue, lessonsCount,
  releasedSplits, releasable) + summary aggregations.
- `POST /api/admin/ledger/release-payment` with amount > balance → 400
  `{error:"Insufficient wallet balance ($180.00 available)"}`.
- `POST /api/admin/ledger/release-payment` with valid amount ($10, PayPal,
  destination `tutor@example.com`) → 200, created `PayoutRelease` with
  `destination:"••••.com"` (masked), decremented `Wallet.balance` from 180 → 170,
  created `Notification` (type `TUTOR_PAYOUT`, status `SIMULATED`).

## Out of scope (NOT touched)
- `src/components/auth/auth-modal.tsx` and `src/components/views/auth-page.tsx`
  (tutor legal agreement — another agent's task).
- Blog routes/views (another agent — already added `BlogAdminTab` to the same
  admin-dashboard.tsx; my 3 tabs were inserted after the blog tab trigger with
  no restructuring of existing code).
- Prisma schema (already pushed by orchestrator; did not run `db:push`).

## Stage Summary
- Module 2 of the master admin control panel is complete: 8 new admin API
  routes, 10 new React Query hooks, 1 idempotent seed script (already executed
  → 10 StudentPayment rows), and 3 new admin dashboard tabs (Security,
  Gateways, Ledger) with their supporting sub-components.
- All endpoints follow the existing admin-auth pattern and return JSON
  responses consistent with the rest of the codebase. All mutations use
  transactions where multiple rows must change atomically (gateway activation,
  bank-account default toggle, payout release).
- The Security tab uses the existing `hashPassword` / `verifyPassword` /
  `setSession` helpers — no new auth scheme introduced. The Gateway tab masks
  all secret fields with a password input + eye toggle. The Ledger tab is
  read-only except for the payout release dialog, which validates amount ≤
  balance before mutating.
- Premium Islamic theme preserved: deep-blue primary headers, light-blue
  accents for active state, gold for default/platform-revenue badges, green
  for successful/success accents, amber for pending/sandbox, red for failed.
  No indigo/blue Tailwind defaults. Tables use `max-h-96 overflow-y-auto
  scrollbar-quran` with sticky headers, matching the existing tutor/withdrawal
  tabs. Fully responsive (2-col → 4-col stat grids, stacked → side-by-side
  gateway cards on `lg`).
- Dev server healthy; lint clean; ready for the user to log in as
  `admin@qtuor.com / admin123` and click the Security / Gateways / Ledger tabs.

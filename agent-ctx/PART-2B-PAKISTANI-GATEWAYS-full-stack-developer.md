# PART-2B-PAKISTANI-GATEWAYS — full-stack-developer

Task: Local Pakistani Payment Gateways & Banking Integration (JazzCash + EasyPaisa + local bank transfer receipt flow + withdrawal account-detail capture).

## Context Loaded
- Read worklog.md and verified prior agents' work (Foundation, Modules 1-3, monthly billing).
- Confirmed schema already has: `PaymentGateway.provider` accepting STRIPE|PAYPAL|JAZZCASH|EASYPAISA, `BankAccount` model with full wire-transfer fields, `Withdrawal` model with `accountLabel/accountNumber/iban/bankName/mobileNumber`, and `StudentPayment.receiptUrl`.
- Inspected existing code patterns: `/api/upload/tutor-doc/route.ts` (multipart upload pattern), `/api/admin/payment-gateways/route.ts` (PUT partial-update), `/api/subscriptions/route.ts` (subscribe flow with createEscrowSplit).
- Found JAZZCASH/EASYPAISA gateway rows were NOT seeded — updated `scripts/seed-modules.ts` to seed them (ran the script; verified rows now exist in DB with IDs cmrd8l9jz... / cmrd8l9k1...).
- Verified Prisma DMMF: Withdrawal fields include accountLabel/accountNumber/iban/bankName/mobileNumber; StudentPayment includes receiptUrl.

## Files Created (5)
1. `src/app/api/bank-details/public/route.ts` — Public GET returns default bank account (bankName, accountHolder, accountNumber, iban, swiftCode, branchCode, country, currency, notes). No auth required. Returns `{ bank: {...} | null }`.
2. `src/app/api/upload/receipt/route.ts` — Student-auth multipart upload (PNG/JPG/WEBP/PDF, max 10MB) → saves to `public/uploads/receipts/<userId>-<timestamp>-<filename>`. Returns `{ url: '/uploads/receipts/<filename>' }`. Mirrors `/api/upload/tutor-doc/route.ts`.
3. `src/app/api/subscriptions/local-bank/route.ts` — Student POST `{ planId, receiptUrl }`. Validates planId exists, receiptUrl non-empty and starts with `/uploads/receipts/`. Creates Subscription(status=PENDING, expiresAt=now+30d), StudentPayment(status=PENDING, paymentMethod=BANK_TRANSFER, receiptUrl, paidAt=now), and pre-creates the 55/45 escrow split (released on monthly cycle). Returns `{ ok, subscription, payment }`.
4. `src/app/api/admin/ledger/receivables/[id]/route.ts` — Admin PATCH `{ status: SUCCESS|REFUNDED|FAILED|PENDING }`. Updates StudentPayment.status. On SUCCESS also activates the student's most recent PENDING Subscription (matched by studentId + plan name → fallback to most-recent PENDING sub).
5. `public/uploads/receipts/` — empty directory created for receipts.

## Files Modified (6)
6. `src/app/api/withdrawals/route.ts` — Accepts additional body fields (`accountLabel, accountNumber, iban, bankName, mobileNumber`) and stores them on the created Withdrawal record. Also validates amount > 0.
7. `src/app/api/dashboard/admin/route.ts` — pendingWithdrawals query now orders by `createdAt desc` (newest first); account fields are auto-included because the model returns all columns.
8. `src/app/api/admin/ledger/receivables/route.ts` — Unchanged (already returns `receiptUrl` because findMany has no select clause — all columns included by default). Verified.
9. `src/components/checkout/checkout-modal.tsx` — Rewrote CheckoutModal to add a 2-option payment-method selector (`card` | `bank`). When `bank`: fetches `/api/bank-details/public` via `usePublicBankDetails`, displays bank fields in a highlighted card with per-field Copy buttons, accepts a file upload via `/api/upload/receipt`, shows thumbnail/filename preview, submits to `/api/subscriptions/local-bank` via `useLocalBankSubscribe`. Pay button changes to "Submit Receipt for Approval" (disabled until receiptUrl set). Note about admin verification shown. Modal state resets on close.
10. `src/components/views/tutor-dashboard.tsx` — Updated `WITHDRAWAL_METHODS` to BANK/JAZZCASH/EASYPAISA/PAYPAL (removed WISE). EarningsWallet now has 5 new state fields (bankName, accountNumber, iban, mobileNumber, paypalEmail). Conditional account-detail inputs rendered based on selected method (BANK → Bank Name + Account Number + IBAN; JAZZCASH/EASYPAISA → Mobile Number; PAYPAL → PayPal Email). Withdrawal request payload now includes the conditional fields. Form resets all fields on cancel/submit success.
11. `src/components/views/admin-dashboard.tsx` — Added `Smartphone` to lucide imports and `useUpdatePaymentStatus` to queries imports. Extended `AdminWithdrawal` interface with account fields. WithdrawalsTab: added `maskAccount` helper; Method column now shows method badge + (BANK → bankName + masked IBAN/account) / (JAZZCASH/EASYPAISA → mobileNumber) / (PAYPAL → accountLabel). GatewaysTab: split gateways into cardGateways (STRIPE/PAYPAL) and mobileGateways (JAZZCASH/EASYPAISA) with two grids. Added new `MobileGatewayCard` component with Smartphone icon, Active/Sandbox switches, Active/Inactive + Live/Sandbox badges, Merchant ID (→clientId) + Secure Key/Hash Key (→clientSecret, password input with show/hide), explanatory note, Save button. LedgerTab.ReceivablesSection: added Receipt column (with "View Receipt" link → `window.open(receiptUrl, '_blank')`) and Actions column (Approve green / Reject red for PENDING rows only) wired to `useUpdatePaymentStatus` mutation with toast feedback.
12. `src/lib/queries.ts` — Extended `useRequestWithdrawal` mutationFn signature to accept `accountLabel/accountNumber/iban/bankName/mobileNumber`. Appended 3 new hooks: `usePublicBankDetails()` (GET /api/bank-details/public, staleTime 5min), `useLocalBankSubscribe()` (POST /api/subscriptions/local-bank, invalidates subscription + student-dashboard), `useUpdatePaymentStatus()` (PATCH /api/admin/ledger/receivables/[id] with `{id, status}`, invalidates receivables-ledger + admin-dashboard).

## Also Modified
- `scripts/seed-modules.ts` — Extended gateway seed list to include JAZZCASH (JazzCash) and EASYPAISA (EasyPaisa). Re-ran script to populate DB.

## Verification
- `bun run lint` → exit 0, **0 errors, 0 warnings**.
- Prisma DMMF check: `Withdrawal` model exposes `accountLabel, accountNumber, iban, bankName, mobileNumber`; `StudentPayment` exposes `receiptUrl` — all wired to the client.
- DB smoke test: created a PENDING StudentPayment with receiptUrl, updated to SUCCESS, deleted — all succeeded.
- DB inspection: 4 PaymentGateway rows exist (STRIPE, PAYPAL, JAZZCASH, EASYPAISA) + 1 default BankAccount.
- Dev server was not running during this session (auto-restart per system). Per task spec, verified via lint + code inspection + DB smoke tests instead.

## Notes / Constraints Honored
- Used only existing shadcn/ui components (Dialog, Button, Input, Label, Badge, Card, Switch, Table, Select, etc.).
- TypeScript strict. All client components have `'use client'`. All API routes use `getSession()` for auth.
- Did NOT touch: TutorVettingTab, TutorProfileModal, SecurityTab, BlogAdminTab, WhatsAppTab, PlansTab, auth-page.tsx, auth-modal.tsx, or /api/upload/tutor-doc.
- Surgical Edits only to: GatewaysTab, LedgerTab (ReceivablesSection), WithdrawalsTab in admin-dashboard.tsx.
- Premium Islamic theme preserved (deep-navy #0A192F, light-blue accent oklch(0.62 0.14 230), gold oklch(0.78 0.15 85), green for approve, red for reject, amber for pending). No indigo/blue Tailwind defaults introduced.

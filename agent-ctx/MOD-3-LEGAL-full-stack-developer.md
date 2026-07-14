# MOD-3-LEGAL — Tutor Onboarding Legal Agreement Gateway

**Task ID:** MOD-3-LEGAL
**Agent:** full-stack-developer
**Date:** 2026-07-09

## Task
Implement a mandatory Legal Agreement Gate that intercepts tutor registration
right before account submission. Tutors must scroll through the full Terms of
Service & Instructor Agreement and check a mandatory checkbox before the
"Submit Application" button is enabled. Each acceptance is recorded with IP,
user agent, version, and timestamp for compliance audit.

## Files Created
- `src/app/api/tutor-legal/accept/route.ts` — POST (auth-required, records
  signature with IP/UA/version) + GET (admin-only audit list, newest first).
- `src/components/auth/legal-agreement-gate.tsx` — Reusable gate component
  shared by both auth entry points. Renders the 10-clause contract in a
  scrollable container, detects scroll-to-bottom, gates the checkbox until
  scrolled, gates the submit button until scrolled+checked.

## Files Modified
- `src/components/views/auth-page.tsx` (live full-screen auth):
  - Added `showLegalGate`, `legalScrolled`, `legalAccepted` state.
  - Reset gate state in the `authMode/authRoleLock` useEffect.
  - Form `onSubmit` intercepts tutor step-3 submit: if `role==='TUTOR' && !showLegalGate`,
    opens the gate instead of calling `handleRegister()`.
  - Renders `<LegalAgreementGate>` in place of the verification form when
    `showLegalGate` is true; hides the regular nav buttons + login link.
  - `handleRegister()` now fires `POST /api/tutor-legal/accept` (fire-and-forget,
    wrapped in try/catch) immediately after a successful tutor registration,
    so the signature is logged with the freshly-set session cookie.
- `src/components/auth/auth-modal.tsx` (legacy modal, parity):
  - Same state, same gate wiring, same `handleRegister` side-call.

## Verification (Agent Browser end-to-end)
1. Opened `localhost:3000/` → landing page rendered.
2. Clicked "Become a Tutor" (navbar) → AuthPage opened locked to TUTOR at step 2.
3. Filled name/email/password/phone/country/gender → Continue enabled → step 3.
4. Selected Noorani Qaida + Arabic + English → clicked "Submit Application".
5. **Legal Agreement Gate appeared** (NOT the registration POST). Verified:
   - Header "Qtuor Tutor Terms of Service" + all 10 clauses as h3 headings
     (Classroom Code of Conduct, Non-Circumvention, Flat Subscription, 55% Payout,
     15-Min Auto-End, $10 Fee, Data & Privacy, Termination, Amendments, Governing Law).
   - Checkbox `disabled` ✓ (via `agent-browser is enabled` → false).
   - Submit button `disabled` ✓.
6. Clicked "Scroll to the bottom to continue" hint → container scrolled to bottom.
   - Checkbox became `enabled` ✓.
   - Submit button still `disabled` ✓ (checkbox not yet checked).
7. Clicked the checkbox → `checked=true`.
   - Submit button became `enabled` ✓.
8. Clicked "Submit Application" → registration completed → "Application Submitted!"
   screen with toast "Application submitted! Pending admin approval."
9. Queried `GET /api/tutor-legal/accept` as admin → signature recorded with:
   - userId, userEmail="testtutor.legalgate@example.com", userName="Test Tutor"
   - ipAddress="::1", userAgent="Mozilla/5.0 ... HeadlessChrome/149.0.0.0"
   - agreementVersion="v1.0", acceptedAt timestamp.

## API Contract
- `POST /api/tutor-legal/accept`
  - Auth: any logged-in user (session required, else 401).
  - Body: `{ agreementVersion?: string }` (default "v1.0").
  - Captures IP from `x-forwarded-for` (first IP) or `x-real-ip` fallback.
  - Captures user agent from `user-agent` header.
  - Returns `{ ok: true, signature: { id, acceptedAt } }`.
- `GET /api/tutor-legal/accept`
  - Auth: ADMIN only (else 403).
  - Returns `{ signatures: [...] }` ordered by `acceptedAt` desc, limit 500.

## Lint Result
- `npx eslint` on all 4 of my files → **0 errors, 0 warnings**.
- (Pre-existing `BlogAdminTab`/`SecurityTab`/`GatewaysTab`/`LedgerTab` errors
  in admin-dashboard.tsx are from sibling agents' in-progress work, not mine.)
- (Pre-existing `StarMedallion style` TypeScript warnings on auth-page.tsx
  lines 478/493 are in untouched right-panel brand showcase code, not mine.)

## Stage Summary
- Legal Agreement Gate fully implemented and verified end-to-end via Agent Browser.
- Both auth entry points (live `auth-page.tsx` + legacy `auth-modal.tsx`) have parity.
- API endpoint creates audit-grade signature records with IP + UA + version + timestamp.
- Checkbox is disabled until scrolled; submit is disabled until scrolled + checked.
- Registration flow (login, student registration, tutor step navigation) preserved.
- No new packages installed; only existing shadcn/ui + lucide-react used.

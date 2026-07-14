# Task 2-d — Tutor Dashboard view

**Agent:** full-stack-developer (tutor dashboard)
**File created:** `/home/z/my-project/src/components/views/tutor-dashboard.tsx`
**Default export:** `TutorDashboard` (no props), rendered when `view === 'tutor-dashboard'`

## What was built

A complete, production-ready Tutor Dashboard view for the Qtuor platform. The component is fully client-side (`'use client'`), uses React Query hooks for data/mutations, Zustand for navigation, and the existing premium-blue design system (oklch tokens, Islamic patterns, brand badges, shared Avatar).

## Features implemented

1. **Auth & role guard**
   - `user === null` → `AuthPrompt` card with QtuorLogo, hero-mesh + Islamic pattern band, "Sign in as tutor" button → `openAuth('login')`.
   - `user.role !== 'TUTOR'` → `BecomeTutorCta` card with hero-mesh + Islamic pattern, feature pills (Earn in USD / Verified badge / Flexible hours), "Register as a tutor" button → `openAuth('register')`.
   - `isLoading` → animated skeleton placeholder.
   - `isError` / no data → friendly error state with reload button.

2. **Pending verification banner** (`StatusBanner`)
   - `PENDING` → amber/blue gradient banner with clock icon.
   - `REJECTED` → red banner with XCircle icon.
   - `APPROVED` → no banner; small green "Verified Tutor" pill is shown in the welcome header instead.

3. **Welcome header** — greeting (time-of-day aware: morning/afternoon/evening) + first name in `text-gradient-blue`, hero-mesh + Islamic pattern band, StarMedallion decoration, status pill.

4. **Stats row** (4 animated cards via framer-motion):
   - Wallet Balance (blue accent, wallet icon)
   - Total Earned (gold accent, trending-up icon)
   - Unique Students (muted accent, users icon, shows lessons taught)
   - Rating (gold accent, star icon, shows reviewCount)

5. **Two-column layout** (`lg:grid-cols-3`, left = `lg:col-span-2`):
   - **Left column:**
     - `UpcomingClasses` — list of SCHEDULED future bookings with student avatar (with country flag), name, trial badge, topic, duration, formatted date (date-fns), Today/Tomorrow relative badge. Each row has "Start Class" (light-blue, calls `setActiveBookingId` + `setView('classroom')`) and "Mark Complete" (outline, calls `useUpdateBooking({id, status:'COMPLETED'})` + toast on success). Empty state with calendar icon. Long lists scroll within `max-h-96 overflow-y-auto scrollbar-quran`.
     - `AvailabilityManager` — weekly grid (7 day cells × 6 time-slot chips). Days as vertical stack on mobile (`grid-cols-1`), 7-column grid on desktop (`md:grid-cols-7`). Chips toggle on/off; selected = filled light-blue, unselected = outline muted. Tracks dirty state, shows live count of selected slots. "Save Availability" button calls `useSaveAvailability(payload)` + success toast. Time slots: 08–10, 10–12, 14–16, 16–18, 18–20, 20–22.
   - **Right column:**
     - `EarningsWallet` — gradient balance card (deep blue → light blue), pending payout & total earned (gold) mini-cards, "Request Withdrawal" button toggles inline form (amount input + method Select [Bank/PayPal/Wise] + Withdraw button). Validates amount > 0 and ≤ balance (toasts error if not). Calls `useRequestWithdrawal`. Recent withdrawals list (amount, method, date, colored status badge) with `max-h-60 overflow-y-auto scrollbar-quran`.
     - `VerificationCenter` — profile status pill (Approved/Pending/Rejected), credential badges (Verified / Native Arabic / Hafiz / Ijaza or muted "Not X" fallbacks), specialties badges (light-blue), languages badges (muted). Hidden file input + "Upload Ijaza Certificate" button → toasts "Certificate uploaded for review" on file selection.

## Style notes

- All CTAs use `oklch(0.62 0.14 230)` (light blue) — no indigo/blue Tailwind defaults.
- Consistent `p-6` card padding; `gap-6` between sections.
- `framer-motion` entrance animations on stat cards and booking rows.
- Responsive: mobile-first, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` stats, single-column → 3-column dashboard layout, availability grid stacks on mobile.
- Custom scrollbar (`scrollbar-quran`) on long lists.
- Type-safe: explicit interfaces for `TutorProfile`, `WalletData`, `WithdrawalRow`, `AvailabilityRow`, `BookingRow`, `DashboardData`. Cast `useTutorDashboard()` result to `DashboardData` for type narrowing.

## Lint status

`bun run lint` — **0 errors, 0 warnings in this file** (2 unrelated warnings in `avatar.tsx` and `use-session.ts` from previous agents).

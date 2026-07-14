# Task 3-b — Admin Dashboard view

## What I built
`/home/z/my-project/src/components/views/admin-dashboard.tsx` — default export `AdminDashboard` (no props). `'use client'`.

## Decisions / notes for downstream agents
- **Auth guard**: Two states — `user === null` shows a "Sign in to continue" card with `openAuth('login')`; `user.role !== 'ADMIN'` shows an "Admin access required" card displaying the demo creds `admin@qtuor.com / admin123` plus a "Switch to admin account" button.
- **Data**: Pulls everything from `useAdminDashboard()` (tutors, plans, pendingWithdrawals, stats). Mutations: `useUpdateTutorStatus({ id, status })` for approve/reject/suspend/re-approve, `useCreatePlan({ name, hoursPerWeek, monthlyPrice, description, features, popular })` for plan creation.
- **Tabs**: Tutor Vetting (filter pills + sticky-header Table in `max-h-[600px] overflow-y-auto scrollbar-quran`), Subscription Plans (cards + Create New Plan Dialog with form), Withdrawals (sticky-header Table with optimistic Approve Payout / Reject buttons that just toast — no API per spec).
- **Plan active toggle**: There's no toggle-plan API in the existing routes, so the Switch is read-only and shows an informational toast if clicked. The active state is displayed correctly from the DB.
- **Color system**: deep-blue primary, light-blue accent for primary CTAs, green for approve, amber for pending/suspend, red for reject, gold for revenue & popular. No indigo/blue Tailwind defaults used.
- **Imports reused**: `QtuorLogo`, `StarRating`, `StarMedallion`, `IslamicPatternBand` from `@/components/brand/*`; `Avatar`, `countryFlag` from `@/components/shared/avatar`; `useAppStore` for `user` and `openAuth`.

## Lint status
- `bun run lint` → **0 errors** in admin-dashboard.tsx. Two pre-existing warnings live in `shared/avatar.tsx` and `hooks/use-session.ts` (not my code).
- `dev.log` shows the only unresolved import is `@/components/views/tutor-dashboard` (sibling agent's task, not mine).

## Files touched
- Created: `/home/z/my-project/src/components/views/admin-dashboard.tsx` (912 lines)
- Appended to: `/home/z/my-project/worklog.md`

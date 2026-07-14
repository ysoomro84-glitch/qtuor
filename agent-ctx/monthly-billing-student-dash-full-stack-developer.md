# Task: monthly-billing-student-dash

## Agent
full-stack-developer (student dashboard monthly billing)

## Scope
Single-file edit: `src/components/views/student-dashboard.tsx` — migrate student dashboard from class-balance model to fixed monthly subscription model.

## Changes Made
1. **`Subscription` type**: removed `classesBalance: number` field.
2. **`DashboardData['stats']` type**: replaced `classesBalance: number` with:
   - `hasActiveSubscription: boolean`
   - `subscriptionPlanName: string | null`
   - `subscriptionExpiresAt: string | null`
3. **`StatCard` component**: added optional `action?: React.ReactNode` prop (renders below sub-text) so the subscription card can host a "Subscribe" button.
4. **`StatsRow` first card**: replaced "Classes Remaining" with "Active Subscription":
   - Active → value = plan name (smaller font to fit), sub = "Active until [expiry date]".
   - Inactive → value = "No active plan", sub = "Subscribe to unlock unlimited classes", plus a "Subscribe" button (navigates to plans view).
5. **`CurrentPlan` card body rewrite**:
   - Removed `total` / `used` / `usedPct` ("used = total - classesBalance") calculation.
   - Removed the "Classes used this cycle" progress bar block.
   - Added a "Renews on [expiry date]" row with a CalendarDays icon.
   - Added helper text: "Enjoy unlimited classes within your plan until your renewal date."
   - Changed top-right badge from "Active" → "Active Subscription".
   - Renamed "Upgrade" → "Upgrade Plan".
   - Kept plan name, classes/mo · price line, features list, and both action buttons.

## Verification
- `grep` confirms zero remaining references to `classesBalance`, `hoursBalance`, or "classes remaining".
- `bun run lint` passes cleanly (no errors, no warnings).
- `Progress` component import retained (still used in `LessonProgressTracker`).
- `Clock` icon retained (still used in `BookingHistory` SectionHeader).

## Files Touched
- `/home/z/my-project/src/components/views/student-dashboard.tsx`

## Notes for Downstream Agents
- The dashboard now expects the `/api/dashboard/student` response to return `stats.hasActiveSubscription`, `stats.subscriptionPlanName`, and `stats.subscriptionExpiresAt` (no `classesBalance`).
- The `subscription` object on the response is expected to NOT have `classesBalance` or `hoursBalance`.
- If any other view consumes these stats, it must be updated similarly.

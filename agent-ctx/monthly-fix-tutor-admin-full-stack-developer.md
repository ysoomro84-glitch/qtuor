# monthly-fix-tutor-admin — tutor & admin dashboards hourly→per-class conversion

## Scope
Edit ONLY:
- /home/z/my-project/src/components/views/tutor-dashboard.tsx
- /home/z/my-project/src/components/views/admin-dashboard.tsx

## Backend contract verified
- /api/dashboard/admin returns `tutors[].perClassRate` (always present) AND `hourlyRate` (alias of same value). Plans returned with `...p` spread → carry `classesPerMonth` (Prisma schema renamed).
- /api/dashboard/tutor returns `profile.perClassRate` (old `hourlyRate` gone).
- /api/admin/plans POST expects body `{ name, classesPerMonth, monthlyPrice, description, features, popular }`.

## Changes made

### tutor-dashboard.tsx
- TutorProfile interface: `hourlyRate: number` → `perClassRate: number`.
- No other rate/earnings references existed (stats use pre-computed wallet balances; no `rate * hours` calc; no "Hourly rate" label). Left `new Date().getHours()` greeting and the "Flexible hours" scheduling badge untouched (non-billing contexts).

### admin-dashboard.tsx
- AdminTutor interface: `hourlyRate` → `perClassRate`.
- AdminPlan interface: `hoursPerWeek` → `classesPerMonth`.
- Tutor vetting TableHead: "Hourly" → "Per class".
- Tutor rate cell: `${t.hourlyRate}` → `${t.perClassRate}`; "/hr" → "/class".
- Create-plan form: state key, reset, validation, and POST body field all renamed `hoursPerWeek` → `classesPerMonth` (POST body now matches API).
- Validation toast: "hours per week" → "classes per month".
- Form label "Hours / week" → "Classes / month"; input id `plan-hours` → `plan-classes`.
- Plan card subtitle: `{p.hoursPerWeek} hrs / week` → `{p.classesPerMonth} classes / month`.

## Verification
- `bun run lint` → exit 0, 0 errors, 0 warnings.
- Re-grep both files: no remaining `hourlyRate` / `hoursPerWeek` / `Hourly` / `/hr` / `hrs / week` in billing context.

## Out of scope (flagged, NOT touched)
- `/api/plans` route (src/app/api/plans/route.ts) still references the renamed `hoursPerWeek` column → 500 in dev.log. This is a backend file owned by another agent; per task instructions I did not modify it.

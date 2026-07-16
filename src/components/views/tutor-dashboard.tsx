'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { format, parseISO, isToday, isTomorrow } from 'date-fns'
import {
  Wallet,
  TrendingUp,
  Users,
  Star,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Upload,
  Loader2,
  AlertCircle,
  XCircle,
  Banknote,
  HandCoins,
  CalendarClock,
  Sparkles,
  Languages,
  BookOpenCheck,
  Award,
  PieChart,
  Hourglass,
  Receipt,
  Home,
  LogOut,
  ChevronLeft,
  MessageCircle,
  CreditCard,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, type ViewKey } from '@/lib/store'
import {
  useTutorDashboard,
  useSaveAvailability,
  useUpdateBooking,
  useRequestWithdrawal,
  useTutorWalletLedger,
} from '@/lib/queries'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar } from '@/components/shared/avatar'
import { IslamicPatternBand, StarMedallion } from '@/components/brand/patterns'
import { QtuorLogoLockup } from '@/components/brand/logo'
import {
  VerifiedBadge,
  NativeArabicBadge,
  HafizBadge,
  IjazaBadge,
} from '@/components/brand/badges'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface TutorProfile {
  id: string
  userId: string
  bio: string
  perClassRate: number
  rating: number
  reviewCount: number
  studentCount: number
  lessonsCount: number
  verified: boolean
  nativeArabic: boolean
  hafiz: boolean
  ijazaCertified: boolean
  specialties: string
  languages: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string
  experienceYears: number
}

interface WalletData {
  id: string
  tutorId: string
  balance: number
  pendingPayout: number
  totalEarned: number
  escrowHeld?: number
  platformRevenue?: number
}

interface WithdrawalRow {
  id: string
  amount: number
  status: string
  method: string
  createdAt: string
}

interface WalletSplit {
  id: string
  subscriptionId?: string
  tutorId?: string
  studentName: string
  planName: string
  planPrice: number
  tutorShare: number
  platformShare: number
  status: 'ESCROWED' | 'RELEASED' | 'CANCELLED' | string
  escrowedAt: string
  releasedAt?: string | null
  createdAt?: string
}

interface LedgerSummary {
  balance: number
  escrowHeld: number
  totalEarned: number
  platformRevenue: number
  pendingPayout: number
  pendingSplits: number
  pendingAmount: number
}

interface LedgerData {
  wallet: WalletData
  splits: WalletSplit[]
  withdrawals: WithdrawalRow[]
  summary: LedgerSummary
}

interface AvailabilityRow {
  id: string
  tutorId: string
  dayOfWeek: number
  slots: string
}

interface BookingRow {
  id: string
  scheduledAt: string
  durationMins: number
  status: string
  isTrial: boolean
  topic?: string | null
  student: {
    id: string
    name: string
    avatar?: string | null
    country?: string | null
  }
}

interface DashboardData {
  profile: TutorProfile | null
  wallet: WalletData
  withdrawals: WithdrawalRow[]
  availabilities: AvailabilityRow[]
  bookings: BookingRow[]
  stats: {
    totalLessons: number
    upcomingLessons: number
    uniqueStudents: number
    rating: number
    reviewCount: number
    balance: number
    totalEarned: number
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const DAYS_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

const TIME_SLOTS: string[][] = [
  ['08:00', '10:00'],
  ['10:00', '12:00'],
  ['14:00', '16:00'],
  ['16:00', '18:00'],
  ['18:00', '20:00'],
  ['20:00', '22:00'],
]

const WITHDRAWAL_METHODS = [
  { value: 'BANK', label: 'Local Bank Transfer' },
  { value: 'JAZZCASH', label: 'JazzCash' },
  { value: 'EASYPAISA', label: 'EasyPaisa' },
  { value: 'PAYPAL', label: 'PayPal' },
] as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseAvailabilities(list: AvailabilityRow[]): Record<number, string[][]> {
  const map: Record<number, string[][]> = {}
  for (const a of list) {
    try {
      const parsed = JSON.parse(a.slots)
      map[a.dayOfWeek] = Array.isArray(parsed) ? (parsed as string[][]) : []
    } catch {
      map[a.dayOfWeek] = []
    }
  }
  return map
}

function slotExists(daySlots: string[][] | undefined, slot: string[]): boolean {
  if (!daySlots) return false
  return daySlots.some((s) => s[0] === slot[0] && s[1] === slot[1])
}

function toggleSlot(
  current: Record<number, string[][]>,
  day: number,
  slot: string[]
): Record<number, string[][]> {
  const existing = current[day] || []
  const has = slotExists(existing, slot)
  const next = has
    ? existing.filter((s) => !(s[0] === slot[0] && s[1] === slot[1]))
    : [...existing, slot]
  return { ...current, [day]: next }
}

function money(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatBookingDate(iso: string): { label: string; relative: string | null } {
  let d: Date
  try {
    d = parseISO(iso)
  } catch {
    d = new Date(iso)
  }
  const label = format(d, 'EEE, MMM d · h:mm a')
  let relative: string | null = null
  if (isToday(d)) relative = 'Today'
  else if (isTomorrow(d)) relative = 'Tomorrow'
  return { label, relative }
}

function withdrawalStatusVariant(status: string): string {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'APPROVED':
      return 'bg-[oklch(0.62_0.14_230/0.15)] text-[oklch(0.40_0.11_258)] border-[oklch(0.62_0.14_230/0.3)]'
    case 'REJECTED':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-amber-100 text-amber-700 border-amber-200'
  }
}

// ---------------------------------------------------------------------------
// Sub-components: Guards
// ---------------------------------------------------------------------------
function AuthPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <Card className="relative overflow-hidden border-0 p-0 text-center shadow-xl">
        <div className="hero-mesh absolute inset-0" aria-hidden />
        <IslamicPatternBand opacity={0.06} />
        <div className="relative flex flex-col items-center gap-4 p-10">
          <QtuorLogoLockup size="lg" />
          <h2 className="text-2xl font-extrabold text-foreground">Tutor Dashboard</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Sign in to manage your classes, availability, earnings and verification status on
            Qtuor.
          </p>
          <Button
            onClick={onLogin}
            className="bg-[oklch(0.62_0.14_230)] text-white hover:bg-[oklch(0.55_0.14_230)]"
          >
            <GraduationCap className="h-4 w-4" /> Sign in as tutor
          </Button>
        </div>
      </Card>
    </div>
  )
}

function BecomeTutorCta({ onRegister }: { onRegister: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Card className="relative overflow-hidden p-0">
        <div className="hero-mesh absolute inset-0" aria-hidden />
        <IslamicPatternBand opacity={0.07} />
        <div className="relative flex flex-col items-center gap-5 p-8 text-center sm:p-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.34_0.13_256)] to-[oklch(0.62_0.14_230)] text-white shadow-lg">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
              Become a Qtuor Tutor
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Share your knowledge of the Quran with students worldwide. Set your own rates,
              schedule, and teach from anywhere — all from one beautiful dashboard.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.62_0.14_230/0.1)] px-3 py-1 font-semibold text-[oklch(0.40_0.11_258)]">
              <Sparkles className="h-3 w-3" /> Earn in USD
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.78_0.15_85/0.15)] px-3 py-1 font-semibold text-[oklch(0.55_0.13_75)]">
              <Star className="h-3 w-3" /> Verified badge
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-semibold text-muted-foreground">
              <CalendarClock className="h-3 w-3" /> Flexible hours
            </span>
          </div>
          <Button
            onClick={onRegister}
            size="lg"
            className="mt-2 bg-[oklch(0.62_0.14_230)] text-white hover:bg-[oklch(0.55_0.14_230)]"
          >
            <GraduationCap className="h-4 w-4" /> Register as a tutor
          </Button>
        </div>
      </Card>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 h-32 animate-pulse rounded-2xl bg-muted" />
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-72 animate-pulse rounded-xl bg-muted" />
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="space-y-6">
          <div className="h-72 animate-pulse rounded-xl bg-muted" />
          <div className="h-60 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Status Banner
// ---------------------------------------------------------------------------
function StatusBanner({ profile }: { profile: TutorProfile | null }) {
  if (!profile) {
    return (
      <Card className="border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">Complete your tutor profile</p>
            <p className="text-amber-700">
              Your tutor profile isn&apos;t set up yet. Please contact support to continue.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (profile.status === 'PENDING') {
    return (
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-[oklch(0.62_0.14_230/0.06)] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Clock className="h-4 w-4" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-amber-900">Application pending admin approval</p>
            <p className="text-amber-700">
              You&apos;ll be visible to students once an admin approves your tutor profile. This
              usually takes 1–2 business days.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (profile.status === 'REJECTED') {
    return (
      <Card className="border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="text-sm">
            <p className="font-semibold text-red-900">Application not approved</p>
            <p className="text-red-700">
              Your tutor application was not approved. Please review your profile details and
              contact support if you believe this is an error.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  // APPROVED — small green pill shown elsewhere; no banner needed.
  return null
}

// ---------------------------------------------------------------------------
// Welcome Header
// ---------------------------------------------------------------------------
function WelcomeHeader({
  name,
  approved,
}: {
  name: string
  approved: boolean
}) {
  const first = name.split(' ')[0] || 'Teacher'
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  return (
    <Card className="relative overflow-hidden border-0 p-0 shadow-md">
      <div className="hero-mesh absolute inset-0" aria-hidden />
      <IslamicPatternBand opacity={0.08} />
      <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-4">
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/70 text-primary shadow-sm sm:flex">
            <StarMedallion className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {greet},
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              <span className="text-gradient-blue">{first}</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your classes, schedule and earnings — all in one place.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {approved ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified Tutor
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
              <Clock className="h-3.5 w-3.5" /> Pending verification
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Stats Row
// ---------------------------------------------------------------------------
function StatCard({
  icon,
  label,
  value,
  sub,
  accent = 'blue',
  index = 0,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  accent?: 'blue' | 'gold' | 'muted'
  index?: number
}) {
  const accentClass =
    accent === 'gold'
      ? 'bg-[oklch(0.78_0.15_85/0.15)] text-[oklch(0.55_0.13_75)]'
      : accent === 'muted'
        ? 'bg-muted text-muted-foreground'
        : 'bg-[oklch(0.62_0.14_230/0.15)] text-[oklch(0.40_0.11_258)]'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">
              {value}
            </p>
            {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
          </div>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              accentClass
            )}
          >
            {icon}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function StatsRow({ stats }: { stats: DashboardData['stats'] }) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          index={0}
          icon={<Users className="h-5 w-5" />}
          label="Students"
          value={stats.uniqueStudents}
          sub={`${stats.totalLessons} lessons taught`}
          accent="muted"
        />
        <StatCard
          index={1}
          icon={<Clock className="h-5 w-5" />}
          label="Hours Taught"
          value={Math.round(stats.totalLessons * 0.5)}
          sub="Approx. based on 30-min classes"
          accent="blue"
        />
        <StatCard
          index={2}
          icon={<Wallet className="h-5 w-5" />}
          label="Your Wallet"
          value={money(stats.balance)}
          sub="Available to withdraw"
          accent="blue"
        />
        <StatCard
          index={3}
          icon={<Star className="h-5 w-5" />}
          label="Rating"
          value={stats.rating ? `${stats.rating.toFixed(1)} / 5` : '—'}
          sub={
            stats.reviewCount > 0 ? `${stats.reviewCount} reviews` : 'No reviews yet'
          }
          accent="gold"
        />
      </div>
      {/* 55% Commission Transparency Disclaimer */}
      <p className="mt-3 text-center text-xs text-muted-foreground">
        <HandCoins className="mr-1 inline h-3.5 w-3.5" />
        Your wallet balance shows your <span className="font-semibold text-emerald-600">55% share</span> after the platform commission (45%).
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Upcoming Classes
// ---------------------------------------------------------------------------
function UpcomingClasses({
  bookings,
  onStart,
  onComplete,
  completing,
}: {
  bookings: BookingRow[]
  onStart: (b: BookingRow) => void
  onComplete: (b: BookingRow) => void
  completing: string | null
}) {
  const upcoming = bookings
    .filter((b) => b.status === 'SCHEDULED' && new Date(b.scheduledAt) > new Date(new Date().getTime() - 30 * 60 * 1000))
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.62_0.14_230/0.15)] text-[oklch(0.40_0.11_258)]">
            <CalendarClock className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Upcoming Classes</h2>
            <p className="text-xs text-muted-foreground">
              {upcoming.length} scheduled {upcoming.length === 1 ? 'class' : 'classes'}
            </p>
          </div>
        </div>
      </div>

      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">No upcoming classes</p>
            <p className="mt-1 text-xs text-muted-foreground">
              When students book a session with you, it will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-h-96 space-y-3 overflow-y-auto scrollbar-quran pr-1">
          {upcoming.map((b) => {
            const { label, relative } = formatBookingDate(b.scheduledAt)
            const isCompleting = completing === b.id
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-[oklch(0.62_0.14_230/0.4)] hover:shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      name={b.student.name}
                      src={b.student.avatar}
                      size={44}
                      country={b.student.country}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate font-semibold text-foreground">
                          {b.student.name}
                        </p>
                        {b.isTrial && (
                          <Badge className="bg-[oklch(0.78_0.15_85/0.18)] text-[oklch(0.55_0.13_75)] border-[oklch(0.78_0.15_85/0.4)]">
                            Trial
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {b.topic ? (
                          <span className="inline-flex items-center gap-1">
                            <BookOpenCheck className="h-3 w-3" /> {b.topic}
                          </span>
                        ) : (
                          'Quran lesson'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Clock className="h-3.5 w-3.5 text-[oklch(0.62_0.14_230)]" />
                      {b.durationMins} min
                    </div>
                    {relative && (
                      <Badge className="bg-[oklch(0.62_0.14_230/0.12)] text-[oklch(0.40_0.11_258)] border-[oklch(0.62_0.14_230/0.25)]">
                        {relative}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => onStart(b)}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Video className="h-4 w-4" /> {relative === 'Today' ? 'Join' : 'Start Class'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isCompleting}
                    onClick={() => onComplete(b)}
                  >
                    {isCompleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Mark Complete
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Availability Manager
// ---------------------------------------------------------------------------
function AvailabilityManager({
  availabilities,
}: {
  availabilities: AvailabilityRow[]
}) {
  const initial = React.useMemo(
    () => parseAvailabilities(availabilities),
    [availabilities]
  )
  const [slots, setSlots] = React.useState<Record<number, string[][]>>(initial)
  const [dirty, setDirty] = React.useState(false)
  const saveMut = useSaveAvailability()

  React.useEffect(() => {
    const next = parseAvailabilities(availabilities)
    setSlots(next)
    setDirty(false)
  }, [availabilities])

  const handleToggle = (day: number, slot: string[]) => {
    setSlots((cur) => toggleSlot(cur, day, slot))
    setDirty(true)
  }

  const handleSave = () => {
    // Build payload ensuring all 7 days are present (empty array if none)
    const payload: Record<number, string[][]> = {}
    for (let d = 0; d < 7; d++) payload[d] = slots[d] || []
    saveMut.mutate(payload, {
      onSuccess: () => {
        toast.success('Availability saved', {
          description: 'Your weekly schedule has been updated.',
        })
        setDirty(false)
      },
      onError: (e: Error) =>
        toast.error('Failed to save availability', { description: e.message }),
    })
  }

  const totalSelected = Object.values(slots).reduce(
    (sum, arr) => sum + (arr?.length || 0),
    0
  )

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.62_0.14_230/0.15)] text-[oklch(0.40_0.11_258)]">
            <Calendar className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Availability</h2>
            <p className="text-xs text-muted-foreground">
              {totalSelected} {totalSelected === 1 ? 'slot' : 'slots'} selected ·{' '}
              {dirty ? 'unsaved changes' : 'all changes saved'}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={!dirty || saveMut.isPending}
          className="bg-[oklch(0.62_0.14_230)] text-white hover:bg-[oklch(0.55_0.14_230)]"
        >
          {saveMut.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Save Availability
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
        {DAYS_SHORT.map((day, dayIdx) => {
          const daySlots = slots[dayIdx] || []
          return (
            <div
              key={day}
              className="rounded-xl border border-border bg-muted/20 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-foreground">
                  {day}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {daySlots.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {TIME_SLOTS.map((slot) => {
                  const selected = slotExists(daySlots, slot)
                  return (
                    <button
                      key={`${slot[0]}-${slot[1]}`}
                      type="button"
                      onClick={() => handleToggle(dayIdx, slot)}
                      aria-pressed={selected}
                      className={cn(
                        'w-full rounded-md border px-2 py-1.5 text-left text-[11px] font-semibold transition-all',
                        selected
                          ? 'border-transparent bg-[oklch(0.62_0.14_230)] text-white shadow-sm hover:bg-[oklch(0.55_0.14_230)]'
                          : 'border-border bg-background text-muted-foreground hover:border-[oklch(0.62_0.14_230/0.4)] hover:bg-accent/40 hover:text-foreground'
                      )}
                    >
                      <span className="block">
                        {slot[0]}–{slot[1]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Times are shown in your local timezone. Toggle chips to set when students can book you.
      </p>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Earnings & Wallet
// ---------------------------------------------------------------------------
function EarningsWallet({
  wallet,
  withdrawals,
}: {
  wallet: WalletData
  withdrawals: WithdrawalRow[]
}) {
  const [showForm, setShowForm] = React.useState(false)
  const [amount, setAmount] = React.useState('')
  const [method, setMethod] = React.useState<string>('BANK')
  // Local payout account details (conditional on method)
  const [bankName, setBankName] = React.useState('')
  const [accountNumber, setAccountNumber] = React.useState('')
  const [iban, setIban] = React.useState('')
  const [mobileNumber, setMobileNumber] = React.useState('')
  const [paypalEmail, setPaypalEmail] = React.useState('')
  const reqMut = useRequestWithdrawal()
  const { data: ledgerData } = useTutorWalletLedger() as {
    data?: LedgerData
  }

  const escrowHeld = wallet.escrowHeld ?? ledgerData?.summary.escrowHeld ?? 0
  const pendingAmount = ledgerData?.summary.pendingAmount ?? 0
  const pendingSplits = ledgerData?.summary.pendingSplits ?? 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    if (amt > wallet.balance) {
      toast.error('Insufficient balance', {
        description: `Your withdrawable balance is ${money(wallet.balance)}. Escrowed funds are released on the monthly cycle.`,
      })
      return
    }

    // Build the payload with conditional account fields.
    const payload: Record<string, string | number> = { amount: amt, method }
    if (method === 'BANK') {
      if (!bankName.trim() || !accountNumber.trim()) {
        toast.error('Bank name and account number are required')
        return
      }
      payload.bankName = bankName.trim()
      payload.accountNumber = accountNumber.trim()
      if (iban.trim()) payload.iban = iban.trim()
    } else if (method === 'JAZZCASH' || method === 'EASYPAISA') {
      if (!mobileNumber.trim()) {
        toast.error('Mobile number is required for mobile-wallet withdrawal')
        return
      }
      payload.mobileNumber = mobileNumber.trim()
      payload.accountLabel = method === 'JAZZCASH' ? 'JazzCash' : 'EasyPaisa'
    } else if (method === 'PAYPAL') {
      if (!paypalEmail.trim()) {
        toast.error('PayPal email is required')
        return
      }
      payload.accountLabel = paypalEmail.trim()
    }

    reqMut.mutate(payload as any, {
      onSuccess: () => {
        toast.success('Withdrawal requested', {
          description: `${money(amt)} via ${method} is now pending review.`,
        })
        setAmount('')
        setBankName('')
        setAccountNumber('')
        setIban('')
        setMobileNumber('')
        setPaypalEmail('')
        setShowForm(false)
      },
      onError: (err: Error) =>
        toast.error('Failed to request withdrawal', { description: err.message }),
    })
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.62_0.14_230/0.15)] text-[oklch(0.40_0.11_258)]">
          <Wallet className="h-4.5 w-4.5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Earnings &amp; Wallet</h2>
          <p className="text-xs text-muted-foreground">
            55% monthly share · released on the 1st–5th cycle
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-xl bg-gradient-to-br from-[oklch(0.34_0.13_256)] to-[oklch(0.62_0.14_230)] p-4 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-white/70">
              Withdrawable balance
            </span>
            <Wallet className="h-4 w-4 text-white/70" />
          </div>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">
            {money(wallet.balance)}
          </p>
          <p className="mt-1 text-[10px] text-white/70">
            Available to withdraw now
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-amber-200 bg-[oklch(0.78_0.15_85/0.06)] p-3">
            <div className="flex items-center gap-1.5">
              <Hourglass className="h-3 w-3 text-[oklch(0.55_0.13_75)]" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-[oklch(0.55_0.13_75)]">
                Escrow held
              </p>
            </div>
            <p className="mt-1 text-lg font-bold text-foreground">
              {money(escrowHeld)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Pending monthly release
            </p>
          </div>
          <div className="rounded-lg border border-[oklch(0.78_0.15_85/0.3)] bg-[oklch(0.78_0.15_85/0.06)] p-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-[oklch(0.55_0.13_75)]" />
              <p className="text-[10px] font-medium uppercase tracking-wide text-[oklch(0.55_0.13_75)]">
                Total earned (55%)
              </p>
            </div>
            <p className="mt-1 text-lg font-bold text-[oklch(0.40_0.10_75)]">
              {money(wallet.totalEarned)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Cumulative on Qtuor
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-[oklch(0.62_0.14_230/0.3)] bg-[oklch(0.62_0.14_230/0.06)] px-3 py-2.5">
          <div className="flex items-center gap-2">
            <PieChart className="h-4 w-4 text-[oklch(0.40_0.11_258)]" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-[oklch(0.40_0.11_258)]">
                Pending 55% share
              </p>
              <p className="text-[10px] text-muted-foreground">
                {pendingSplits} escrowed {pendingSplits === 1 ? 'split' : 'splits'} · next cycle
              </p>
            </div>
          </div>
          <p className="text-base font-extrabold text-foreground">
            {money(pendingAmount)}
          </p>
        </div>
      </div>

      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          className="mt-4 w-full bg-[oklch(0.62_0.14_230)] text-white hover:bg-[oklch(0.55_0.14_230)]"
          disabled={wallet.balance <= 0}
        >
          <HandCoins className="h-4 w-4" /> Request Withdrawal
        </Button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-3 rounded-xl border border-border bg-muted/20 p-3"
        >
          <div className="space-y-1.5">
            <Label htmlFor="wd-amt" className="text-xs">
              Amount (USD)
            </Label>
            <Input
              id="wd-amt"
              type="number"
              min="1"
              max={wallet.balance}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Up to ${money(wallet.balance)}`}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {WITHDRAWAL_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conditional account-detail fields based on method */}
          {method === 'BANK' && (
            <div className="space-y-2 rounded-lg border border-border bg-background/60 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Local bank transfer details
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="wd-bank" className="text-xs">Bank Name *</Label>
                <Input
                  id="wd-bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Bank Al Habib"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wd-acc" className="text-xs">Account Number *</Label>
                <Input
                  id="wd-acc"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="0123456789012"
                  className="font-mono text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wd-iban" className="text-xs">IBAN (optional)</Label>
                <Input
                  id="wd-iban"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="PK36SCBL0000001123456702"
                  className="font-mono text-xs"
                />
              </div>
            </div>
          )}

          {(method === 'JAZZCASH' || method === 'EASYPAISA') && (
            <div className="space-y-2 rounded-lg border border-border bg-background/60 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {method === 'JAZZCASH' ? 'JazzCash' : 'EasyPaisa'} mobile wallet
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="wd-mobile" className="text-xs">Mobile Number *</Label>
                <Input
                  id="wd-mobile"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="03XX XXXXXXX"
                  className="font-mono text-xs"
                  required
                />
                <p className="text-[10px] text-muted-foreground">
                  Enter the {method === 'JAZZCASH' ? 'JazzCash' : 'EasyPaisa'} registered mobile number.
                </p>
              </div>
            </div>
          )}

          {method === 'PAYPAL' && (
            <div className="space-y-2 rounded-lg border border-border bg-background/60 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                PayPal account
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="wd-pp" className="text-xs">PayPal Email *</Label>
                <Input
                  id="wd-pp"
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={reqMut.isPending}
              className="flex-1 bg-[oklch(0.62_0.14_230)] text-white hover:bg-[oklch(0.55_0.14_230)]"
            >
              {reqMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Banknote className="h-4 w-4" />
              )}
              Withdraw
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false)
                setAmount('')
                setBankName('')
                setAccountNumber('')
                setIban('')
                setMobileNumber('')
                setPaypalEmail('')
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Recent withdrawals */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Recent withdrawals
          </h3>
          <span className="text-[10px] text-muted-foreground">
            {withdrawals.length} {withdrawals.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
        {withdrawals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-6 text-center">
            <p className="text-xs text-muted-foreground">No withdrawals yet.</p>
          </div>
        ) : (
          <div className="max-h-60 space-y-2 overflow-y-auto scrollbar-quran pr-1">
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">{money(w.amount)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {w.method} ·{' '}
                    {format(parseISO(w.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn('text-[10px] font-semibold', withdrawalStatusVariant(w.status))}
                >
                  {w.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Wallet Ledger — 55/45 split history
// ---------------------------------------------------------------------------
function splitStatusBadge(status: string) {
  switch (status) {
    case 'RELEASED':
      return (
        <Badge
          variant="outline"
          className="border-emerald-200 bg-emerald-100 text-[10px] font-semibold text-emerald-700"
        >
          <CheckCircle2 className="mr-1 h-3 w-3" /> Paid
        </Badge>
      )
    case 'CANCELLED':
      return (
        <Badge
          variant="outline"
          className="border-red-200 bg-red-100 text-[10px] font-semibold text-red-700"
        >
          <XCircle className="mr-1 h-3 w-3" /> Cancelled
        </Badge>
      )
    case 'ESCROWED':
    default:
      return (
        <Badge
          variant="outline"
          className="border-amber-200 bg-amber-100 text-[10px] font-semibold text-amber-700"
        >
          <Hourglass className="mr-1 h-3 w-3" /> Pending
        </Badge>
      )
  }
}

function WalletLedger() {
  const { data: ledgerData, isLoading } = useTutorWalletLedger() as {
    data?: LedgerData
    isLoading: boolean
  }

  const splits = ledgerData?.splits ?? []
  const summary = ledgerData?.summary

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.62_0.14_230/0.15)] text-[oklch(0.40_0.11_258)]">
            <Receipt className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Wallet Ledger</h2>
            <p className="text-xs text-muted-foreground">
              55/45 monthly escrow split history
            </p>
          </div>
        </div>
        {summary && (
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 font-bold text-amber-700 ring-1 ring-amber-200">
              <Hourglass className="h-3 w-3" /> {summary.pendingSplits} pending
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.62_0.14_230/0.12)] px-2.5 py-1 font-bold text-[oklch(0.40_0.11_258)] ring-1 ring-[oklch(0.62_0.14_230/0.25)]">
              {money(summary.pendingAmount)} to release
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : splits.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">No splits yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              When a student subscribes to a plan, the 55/45 escrow split will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto scrollbar-quran">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Student
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Plan
                </TableHead>
                <TableHead className="text-right text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Plan Price
                </TableHead>
                <TableHead className="text-right text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Your 55%
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-right text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {splits.map((s) => {
                const dateIso = s.releasedAt || s.escrowedAt
                let dateLabel = '—'
                try {
                  dateLabel = format(parseISO(dateIso), 'MMM d, yyyy')
                } catch {
                  dateLabel = '—'
                }
                return (
                  <TableRow key={s.id} className="hover:bg-muted/40">
                    <TableCell className="max-w-[160px] truncate py-2.5 text-sm font-semibold text-foreground">
                      {s.studentName || '—'}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate py-2.5 text-sm text-muted-foreground">
                      {s.planName || '—'}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm text-muted-foreground">
                      {money(s.planPrice)}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm font-bold text-[oklch(0.40_0.11_258)]">
                      {money(s.tutorShare)}
                    </TableCell>
                    <TableCell className="py-2.5">
                      {splitStatusBadge(s.status)}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-xs text-muted-foreground">
                      {dateLabel}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="mt-3 text-[10px] text-muted-foreground">
        Student pays the full monthly plan price · 55% released to your withdrawable balance on
        the monthly cycle (1st–5th) · 45% to platform.
      </p>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Verification Center
// ---------------------------------------------------------------------------
function VerificationCenter({ profile }: { profile: TutorProfile | null }) {
  const fileRef = React.useRef<HTMLInputElement>(null)

  const specialties = profile?.specialties
    ? profile.specialties.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const languages = profile?.languages
    ? profile.languages.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      toast.success('Certificate uploaded for review', {
        description: `${f.name} — our team will verify it shortly.`,
      })
      e.target.value = ''
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.62_0.14_230/0.15)] text-[oklch(0.40_0.11_258)]">
          <ShieldCheck className="h-4.5 w-4.5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Verification Center</h2>
          <p className="text-xs text-muted-foreground">
            Your credentials &amp; teaching profile
          </p>
        </div>
      </div>

      {/* Status pill */}
      <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">Profile status</span>
        {!profile ? (
          <Badge variant="outline" className="text-amber-700">
            Not set up
          </Badge>
        ) : profile.status === 'APPROVED' ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </span>
        ) : profile.status === 'PENDING' ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
            <Clock className="h-3 w-3" /> Pending
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 ring-1 ring-red-200">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        )}
      </div>

      {/* Credential badges */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Credentials
        </p>
        <div className="flex flex-wrap gap-2">
          {profile?.verified ? (
            <VerifiedBadge />
          ) : (
            <Badge
              variant="outline"
              className="gap-1 border-border bg-muted/40 text-muted-foreground"
            >
              <ShieldCheck className="h-3 w-3" /> Not verified
            </Badge>
          )}
          {profile?.nativeArabic ? (
            <NativeArabicBadge />
          ) : (
            <Badge
              variant="outline"
              className="gap-1 border-border bg-muted/40 text-muted-foreground"
            >
              <Languages className="h-3 w-3" /> Non-native
            </Badge>
          )}
          {profile?.hafiz ? (
            <HafizBadge />
          ) : (
            <Badge
              variant="outline"
              className="gap-1 border-border bg-muted/40 text-muted-foreground"
            >
              <BookOpenCheck className="h-3 w-3" /> Not Hafiz
            </Badge>
          )}
          {profile?.ijazaCertified ? (
            <IjazaBadge />
          ) : (
            <Badge
              variant="outline"
              className="gap-1 border-border bg-muted/40 text-muted-foreground"
            >
              <Award className="h-3 w-3" /> No Ijaza
            </Badge>
          )}
        </div>
      </div>

      {/* Specialties & languages */}
      {specialties.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Specialties
          </p>
          <div className="flex flex-wrap gap-1.5">
            {specialties.map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="border-[oklch(0.62_0.14_230/0.3)] bg-[oklch(0.62_0.14_230/0.06)] text-[oklch(0.40_0.11_258)]"
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {languages.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Languages
          </p>
          <div className="flex flex-wrap gap-1.5">
            {languages.map((l) => (
              <Badge
                key={l}
                variant="outline"
                className="border-border bg-muted/40 text-foreground"
              >
                {l}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Upload Ijaza */}
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFile}
        className="hidden"
        aria-hidden
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileRef.current?.click()}
        className="w-full border-[oklch(0.62_0.14_230/0.4)] text-[oklch(0.40_0.11_258)] hover:bg-[oklch(0.62_0.14_230/0.06)]"
      >
        <Upload className="h-4 w-4" />
        {profile?.ijazaCertified ? 'Replace Ijaza Certificate' : 'Upload Ijaza Certificate'}
      </Button>
      <p className="mt-2 text-center text-[10px] text-muted-foreground">
        PDF or image · reviewed by our team in 1–2 days
      </p>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main Dashboard Content
// ---------------------------------------------------------------------------
function DashboardContent({ data, name }: { data: DashboardData; name: string }) {
  const setView = useAppStore((s) => s.setView)
  const setActiveBookingId = useAppStore((s) => s.setActiveBookingId)
  const updateMut = useUpdateBooking()
  const [completingId, setCompletingId] = React.useState<string | null>(null)

  const approved = data.profile?.status === 'APPROVED'

  const handleStart = (b: BookingRow) => {
    setActiveBookingId(b.id)
    setView('classroom')
  }

  const handleComplete = (b: BookingRow) => {
    setCompletingId(b.id)
    updateMut.mutate(
      { id: b.id, status: 'COMPLETED' },
      {
        onSuccess: () => {
          toast.success('Class marked complete', {
            description: `${b.student.name}'s lesson has been recorded & wallet credited.`,
          })
        },
        onError: (e: Error) =>
          toast.error('Could not mark class complete', { description: e.message }),
        onSettled: () => setCompletingId(null),
      }
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="space-y-6">
        {/* Status banner */}
        {data.profile && data.profile.status !== 'APPROVED' && (
          <StatusBanner profile={data.profile} />
        )}

        {/* Welcome header with Islamic greeting */}
        <div className="mb-2">
          <WelcomeHeader name={name} approved={approved} />
        </div>

        {/* Stats */}
        <StatsRow stats={data.stats} />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <UpcomingClasses
              bookings={data.bookings}
              onStart={handleStart}
              onComplete={handleComplete}
              completing={completingId}
            />
            <AvailabilityManager availabilities={data.availabilities} />
          </div>
          <div className="space-y-6">
            <EarningsWallet wallet={data.wallet} withdrawals={data.withdrawals} />
            <VerificationCenter profile={data.profile} />
          </div>
        </div>

        {/* Wallet Ledger — 55/45 split history (below wallet summary) */}
        <WalletLedger />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Default export — top-level Tutor Dashboard view
// ---------------------------------------------------------------------------

// ============================================================
// Sidebar Navigation (Tutor)
// ============================================================
const TUTOR_SIDEBAR_ITEMS: { icon: React.ComponentType<{ className?: string }>; label: string; view: ViewKey }[] = [
  { icon: Home, label: 'Home', view: 'tutor-dashboard' },
  { icon: Users, label: 'Students', view: 'tutor-dashboard' },
  { icon: Calendar, label: 'Calendar', view: 'tutor-dashboard' },
  { icon: Briefcase, label: 'Jobs', view: 'marketplace' },
  { icon: CreditCard, label: 'Earnings', view: 'tutor-dashboard' },
  { icon: MessageCircle, label: 'Chat', view: 'tutor-dashboard' },
]

function TutorSidebar({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border/60 bg-white lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border/60 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <GraduationCap className="h-4.5 w-4.5" />
        </div>
        <span className="text-base font-bold text-foreground">NOOR ACADEMY</span>
      </div>
      {/* Nav Items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {TUTOR_SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.view)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </button>
          )
        })}
      </nav>
      {/* Bottom */}
      <div className="border-t border-border/60 px-3 py-4">
        <button
          onClick={() => onNavigate('landing')}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
          Back to Site
        </button>
      </div>
    </aside>
  )
}

// ============================================================
// Mobile Bottom Nav (Tutor)
// ============================================================
function TutorMobileNav({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-white/95 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-around py-1.5">
        {TUTOR_SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.view)}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-emerald-600"
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// ============================================================
// Dashboard top bar (compact — replaces main site navbar)
// ============================================================
function DashboardTopBar({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-border/60 bg-white/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <span className="text-base font-bold text-foreground">Tutor Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium sm:inline">{userName}</span>
          <Button variant="ghost" size="sm" onClick={onLogout} className="gap-1.5 text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export function TutorDashboard() {
  const user = useAppStore((s) => s.user)
  const setView = useAppStore((s) => s.setView)
  const openAuth = useAppStore((s) => s.openAuth)
  const { data, isLoading, isError } = useTutorDashboard() as {
    data?: DashboardData
    isLoading: boolean
    isError: boolean
  }

  // Guard 1: not logged in
  if (!user) {
    return <AuthPrompt onLogin={() => openAuth('login')} />
  }

  // Guard 2: not a tutor
  if (user.role !== 'TUTOR') {
    return <BecomeTutorCta onRegister={() => openAuth('register')} />
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-foreground">
          Couldn&apos;t load your dashboard
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please try again in a moment. If the issue persists, contact support.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Reload
        </Button>
      </div>
    )
  }

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" })
    useAppStore.getState().logout()
  }

  const navigateTo = (view: ViewKey) => {
    setView(view)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      {/* Top bar - visible on all screens */}
      <DashboardTopBar userName={user.name} onLogout={handleLogout} />

      <div className="flex flex-1">
        {/* Sidebar - desktop only */}
        <TutorSidebar onNavigate={navigateTo} />

        {/* Main content */}
        <main className="flex-1 pb-20 lg:pb-8">
          <DashboardContent data={data} name={user.name} />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <TutorMobileNav onNavigate={navigateTo} />
    </div>
  )
}

export default TutorDashboard

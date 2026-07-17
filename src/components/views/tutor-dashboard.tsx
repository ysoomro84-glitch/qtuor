'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { format, parseISO, isToday, isTomorrow } from 'date-fns'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
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
  LogOut,
  CreditCard,
  LayoutDashboard,
  BookOpen,
  Settings,
  Menu,
  X,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  MessageSquare,
  BarChart3,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea as TextareaInput } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'

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
      return 'bg-[#0F4C81]/15 text-[#0F4C81] border-[#0F4C81]/30'
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
            className="text-white hover:brightness-110"
            style={{ backgroundColor: C.islamicBlue }}
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
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{ background: `linear-gradient(to bottom right, ${C.deepNavy}, ${C.islamicBlue})` }}>
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
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold" style={{ backgroundColor: `${C.islamicBlue}18`, color: C.islamicBlue }}>
              <Sparkles className="h-3 w-3" /> Earn in USD
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold" style={{ backgroundColor: `${C.gold}18`, color: C.gold }}>
              <Star className="h-3 w-3" /> Verified badge
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-semibold text-muted-foreground">
              <CalendarClock className="h-3 w-3" /> Flexible hours
            </span>
          </div>
          <Button
            onClick={onRegister}
            size="lg"
            className="mt-2 text-white hover:brightness-110"
            style={{ backgroundColor: C.islamicBlue }}
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
      <Card className="border-amber-200 p-4" style={{ background: `linear-gradient(to right, #FFFBEB, ${C.islamicBlue}0A)` }}>
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
  const accentStyles = accent === 'gold'
    ? { backgroundColor: `${C.gold}18`, color: C.gold }
    : accent === 'muted'
      ? undefined
      : { backgroundColor: `${C.islamicBlue}15`, color: C.islamicBlue }
  const accentClassName = accent === 'muted' ? 'bg-muted text-muted-foreground' : ''
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
              accentClassName
            )}
            style={accentStyles}
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
        Your wallet balance shows your <span className="font-semibold" style={{ color: C.islamicBlue }}>55% share</span> after the platform commission (45%).
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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${C.islamicBlue}15`, color: C.islamicBlue }}>
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
                className="group rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm"
                style={{ '--hover-border': C.islamicBlue } as React.CSSProperties}
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
                          <Badge className="text-[10px] font-semibold" style={{ backgroundColor: `${C.gold}20`, color: C.gold, borderColor: `${C.gold}40` }}>
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
                      <Clock className="h-3.5 w-3.5" style={{ color: C.islamicBlue }} />
                      {b.durationMins} min
                    </div>
                    {relative && (
                      <Badge className="text-[10px] font-semibold" style={{ backgroundColor: `${C.islamicBlue}12`, color: C.islamicBlue, borderColor: `${C.islamicBlue}25` }}>
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
                    className="text-white hover:brightness-110"
                    style={{ backgroundColor: C.islamicBlue }}
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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${C.islamicBlue}15`, color: C.islamicBlue }}>
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
          className="text-white hover:brightness-110"
          style={{ backgroundColor: C.islamicBlue }}
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
                          ? 'border-transparent text-white shadow-sm hover:brightness-110'
                          : 'border-border bg-background text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                      )}
                      style={selected ? { backgroundColor: C.islamicBlue } : undefined}
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
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${C.islamicBlue}15`, color: C.islamicBlue }}>
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
        <div className="rounded-xl p-4 text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${C.deepNavy}, ${C.islamicBlue})` }}>
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

        {/* Monthly Earnings Chart */}
        <div className="rounded-xl border p-4" style={{ borderColor: C.border, backgroundColor: C.offWhite }}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold" style={{ color: C.textDark }}>Monthly Earnings</p>
              <p className="text-[10px]" style={{ color: C.textMuted }}>Your 55% share over 6 months</p>
            </div>
            <div className="flex items-center gap-1.5">
              <ArrowUpRight className="h-3 w-3" style={{ color: C.teal }} />
              <span className="text-[10px] font-semibold" style={{ color: C.teal }}>+18%</span>
              <span className="text-[10px]" style={{ color: C.textMuted }}>vs prev.</span>
            </div>
          </div>
          {/* CSS Bar Chart */}
          <div className="flex items-end gap-2" style={{ height: '80px' }}>
            {[
              { month: 'Oct', value: 45, amount: 120 },
              { month: 'Nov', value: 55, amount: 148 },
              { month: 'Dec', value: 40, amount: 108 },
              { month: 'Jan', value: 65, amount: 175 },
              { month: 'Feb', value: 70, amount: 189 },
              { month: 'Mar', value: 85, amount: 229 },
            ].map((bar, i) => {
              const isLast = i === 5
              return (
                <div key={bar.month} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm transition-all"
                    style={{
                      height: `${bar.value}%`,
                      backgroundColor: isLast ? C.teal : `${C.islamicBlue}30`,
                      minHeight: '4px',
                    }}
                  />
                  <span className="text-[9px] font-medium" style={{ color: isLast ? C.teal : C.textMuted }}>{bar.month}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Current vs Last Month Comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3" style={{ borderColor: `${C.teal}30`, backgroundColor: `${C.teal}08` }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.tealDark }}>This Month</p>
            <p className="mt-1 text-lg font-bold" style={{ color: C.textDark }}>{money(wallet.totalEarned * 0.35)}</p>
            <p className="text-[10px]" style={{ color: C.textMuted }}>≈ 18 classes</p>
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: `${C.gold}30`, backgroundColor: `${C.gold}08` }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.gold }}>Last Month</p>
            <p className="mt-1 text-lg font-bold" style={{ color: C.textDark }}>{money(wallet.totalEarned * 0.28)}</p>
            <p className="text-[10px]" style={{ color: C.textMuted }}>≈ 14 classes</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-amber-200 p-3" style={{ backgroundColor: C.goldLight }}>
            <div className="flex items-center gap-1.5">
              <Hourglass className="h-3 w-3" style={{ color: C.gold }} />
              <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: C.gold }}>
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
          <div className="rounded-lg border p-3" style={{ borderColor: `${C.gold}30`, backgroundColor: C.goldLight }}>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" style={{ color: C.gold }} />
              <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: C.gold }}>
                Total earned (55%)
              </p>
            </div>
            <p className="mt-1 text-lg font-bold" style={{ color: C.textDark }}>
              {money(wallet.totalEarned)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Cumulative on Qtuor
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border px-3 py-2.5" style={{ borderColor: `${C.islamicBlue}30`, backgroundColor: `${C.islamicBlue}06` }}>
          <div className="flex items-center gap-2">
            <PieChart className="h-4 w-4" style={{ color: C.islamicBlue }} />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: C.islamicBlue }}>
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

        {/* Upcoming Payouts */}
        <div className="rounded-lg border p-3" style={{ borderColor: C.border, backgroundColor: C.offWhite }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textMuted }}>Upcoming Payouts</p>
            <CreditCard className="h-3.5 w-3.5" style={{ color: C.textMuted }} />
          </div>
          <div className="space-y-2">
            {[
              { date: 'Mar 1–5', amount: money(escrowHeld || 54.5), status: 'Scheduled' },
              { date: 'Apr 1–5', amount: '—', status: 'Pending' },
            ].map((payout, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span style={{ color: C.textMuted }}>{payout.date}</span>
                <span className="font-bold" style={{ color: C.textDark }}>{payout.amount}</span>
                <Badge variant="outline" className={cn(
                  'text-[9px] font-semibold',
                  payout.status === 'Scheduled'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                )}>
                  {payout.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          className="mt-4 w-full text-white hover:brightness-110"
          style={{ backgroundColor: C.islamicBlue }}
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
              className="flex-1 text-white hover:brightness-110"
              style={{ backgroundColor: C.islamicBlue }}
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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${C.islamicBlue}15`, color: C.islamicBlue }}>
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
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-bold ring-1" style={{ backgroundColor: `${C.islamicBlue}12`, color: C.islamicBlue, outlineColor: `${C.islamicBlue}25` }}>
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
                    <TableCell className="py-2.5 text-right text-sm font-bold" style={{ color: C.islamicBlue }}>
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
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${C.islamicBlue}15`, color: C.islamicBlue }}>
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
                className="font-semibold" style={{ backgroundColor: `${C.islamicBlue}06`, color: C.islamicBlue, borderColor: `${C.islamicBlue}30` }}
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
        className="w-full font-semibold hover:bg-accent/40" style={{ borderColor: `${C.islamicBlue}40`, color: C.islamicBlue }}
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
// Main Dashboard Content (replaced by DashboardContentWithSidebar below)
// ---------------------------------------------------------------------------

// ─── Sidebar Navigation Items ────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { id: 'overview', icon: LayoutDashboard, label: 'Home / Overview' },
  { id: 'students', icon: Users, label: 'My Students' },
  { id: 'schedule', icon: CalendarClock, label: 'Class Schedule' },
  { id: 'earnings', icon: Wallet, label: 'Earnings & Invoices' },
  { id: 'resources', icon: BookOpen, label: 'Resource Library' },
  { id: 'settings', icon: Settings, label: 'Settings' },
] as const
type SidebarSection = typeof SIDEBAR_ITEMS[number]['id']

// ─── Color Tokens (Islamic Blue + Teal + Gold) ──────────────────────
const C = {
  islamicBlue: '#0F4C81',
  deepNavy: '#0A2F4F',
  brightBlue: '#1E6CB5',
  teal: '#10B981',
  tealDark: '#059669',
  tealLight: '#D1FAE5',
  gold: '#D4AF37',
  goldLight: '#FEF3C7',
  offWhite: '#F8FAFC',
  lightGray: '#F1F5F9',
  border: '#E2E8F0',
  textDark: '#0F172A',
  textMuted: '#64748B',
}

// ============================================================
// SIDEBAR NAVIGATION (Teacher Dashboard)
// ============================================================
function SidebarNav({ active, onChange, onLogout, userName, userAvatar }: {
  active: SidebarSection; onChange: (id: SidebarSection) => void; onLogout: () => void; userName: string; userAvatar?: string | null
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [isOnline, setIsOnline] = React.useState(true)

  const navContent = (
    <div className="flex h-full flex-col text-white" style={{ background: `linear-gradient(180deg, ${C.deepNavy}, ${C.islamicBlue})` }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <QtuorLogoLockup size="sm" />
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-quran">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => { onChange(item.id); setMobileOpen(false) }}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive ? 'text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
              style={isActive ? { backgroundColor: C.teal } : undefined}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Online/Offline Toggle */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className={cn('h-2.5 w-2.5 rounded-full', isOnline ? 'bg-emerald-400' : 'bg-gray-400')} />
            <span className="text-xs font-medium text-white/80">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={cn(
              'relative h-5 w-9 rounded-full transition-colors',
              isOnline ? 'bg-emerald-500' : 'bg-white/20'
            )}
            aria-label={isOnline ? 'Go offline' : 'Go online'}
          >
            <span
              className={cn(
                'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                isOnline ? 'translate-x-4' : 'translate-x-0.5'
              )}
            />
          </button>
        </div>
      </div>

      {/* Profile + Sign out */}
      <div className="border-t border-white/10 px-3 py-4">
        <div className="flex items-center gap-3 px-2 pb-3">
          <Avatar name={userName} src={userAvatar} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{userName}</p>
            <p className="text-[10px] text-white/50">Qari · Qtuor</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" /> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen" style={{ borderColor: C.border }}>
        {navContent}
      </aside>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-3 px-4 backdrop-blur-xl lg:hidden" style={{ background: 'rgba(248,250,252,0.95)', borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100">
            <Menu className="h-5 w-5" style={{ color: C.islamicBlue }} />
          </button>
          <QtuorLogoLockup size="sm" />
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full', isOnline ? 'bg-emerald-400' : 'bg-gray-400')} />
          <span className="text-sm font-medium" style={{ color: C.textDark }}>{userName}</span>
        </div>
      </header>
      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 shadow-xl" onClick={(e) => e.stopPropagation()}>
            {navContent}
          </aside>
        </div>
      )}
    </>
  )
}

// ============================================================
// STUDENT MANAGEMENT PORTAL (Popup with Tabs)
// ============================================================
const MISTAKE_TYPES = [
  'Makhraj Jali',
  'Makhraj Khafi',
  'Tajweed Rule',
  'Hifz Error',
] as const

function StudentManagementPopup({ student, onClose }: { student: BookingRow['student'] & { planType?: string }; onClose: () => void }) {
  const [homework, setHomework] = React.useState('')
  const [selectedMistake, setSelectedMistake] = React.useState<string>('')
  const [mistakeNotes, setMistakeNotes] = React.useState('')
  const [savedMistakes, setSavedMistakes] = React.useState<{ type: string; notes: string; date: string }[]>([])
  const isQaida = student.planType?.toLowerCase().includes('qaida') || student.planType?.toLowerCase().includes('noorani')

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-lg p-0 overflow-hidden" style={{ borderColor: C.border }}>
        {/* Header */}
        <div className="p-5 text-white" style={{ background: `linear-gradient(135deg, ${C.deepNavy}, ${C.islamicBlue})` }}>
          <DialogHeader className="sr-only">
            <DialogTitle>Manage Student: {student.name}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={student.name} src={student.avatar} country={student.country} size={44} />
              <div>
                <h3 className="text-base font-bold">{student.name}</h3>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {student.planType && (
                    <Badge className="border-transparent text-[10px] font-bold text-white" style={{ backgroundColor: isQaida ? C.teal : C.gold }}>
                      {student.planType}
                    </Badge>
                  )}
                  {student.country && (
                    <span className="text-[10px] text-white/60">{student.country}</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="p-0">
          <div className="border-b px-5 pt-1" style={{ borderColor: C.border }}>
            <TabsList className="h-9 w-full bg-transparent p-0">
              <TabsTrigger
                value="overview"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F4C81] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="homework"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F4C81] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs"
              >
                <BookOpen className="h-3 w-3 mr-1" /> Homework
              </TabsTrigger>
              <TabsTrigger
                value="mistakes"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F4C81] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs"
              >
                <AlertCircle className="h-3 w-3 mr-1" /> Mistakes
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F4C81] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs"
              >
                <BarChart3 className="h-3 w-3 mr-1" /> Progress
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg p-3" style={{ backgroundColor: C.lightGray }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Plan Type</p>
                <p className="mt-1 text-sm font-bold" style={{ color: C.textDark }}>{student.planType || 'Standard'}</p>
              </div>
              <div className="rounded-lg p-3" style={{ backgroundColor: C.lightGray }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Current Lesson</p>
                <p className="mt-1 text-sm font-bold" style={{ color: C.textDark }}>Lesson 12</p>
              </div>
              <div className="rounded-lg p-3" style={{ backgroundColor: `${C.teal}10` }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.tealDark }}>Completion</p>
                <p className="mt-1 text-sm font-bold" style={{ color: C.tealDark }}>68%</p>
              </div>
              <div className="rounded-lg p-3" style={{ backgroundColor: `${C.gold}10` }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.gold }}>Last Class</p>
                <p className="mt-1 text-sm font-bold" style={{ color: C.textDark }}>2 days ago</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: C.islamicBlue }}>Recent Notes</p>
              <div className="space-y-2">
                {[
                  'Good improvement in Harakat pronunciation',
                  'Needs practice on Madd rules',
                  'Qalqalah exercises assigned',
                ].map((note, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs" style={{ color: C.textMuted }}>
                    <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" style={{ color: C.islamicBlue }} />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Assign Homework Tab */}
          <TabsContent value="homework" className="p-5 space-y-4">
            <div>
              <Label className="text-xs font-semibold" style={{ color: C.islamicBlue }}>Assign Next Sabaq (Homework)</Label>
              <TextareaInput
                value={homework}
                onChange={(e) => setHomework(e.target.value)}
                placeholder="e.g., Prepare Surah Al-Baqarah Ayahs 153-160 for tomorrow. Practice Noorani Qaida Lesson 8."
                className="mt-1.5 min-h-[100px] text-sm"
                style={{ borderColor: C.border }}
              />
            </div>
            {homework.trim() && (
              <div className="rounded-lg p-3" style={{ backgroundColor: `${C.teal}08`, border: `1px solid ${C.teal}25` }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.teal }}>Preview</p>
                <p className="mt-1 text-xs" style={{ color: C.textDark }}>{homework}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                className="text-white"
                style={{ backgroundColor: C.teal }}
                onClick={() => { toast.success('Homework assigned!', { description: `${student.name} will be notified.` }); onClose() }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Save Homework
              </Button>
              <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </TabsContent>

          {/* Mark Mistakes Tab */}
          <TabsContent value="mistakes" className="p-5 space-y-4">
            <div>
              <Label className="text-xs font-semibold" style={{ color: C.islamicBlue }}>Mistake Type</Label>
              <Select value={selectedMistake} onValueChange={setSelectedMistake}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select mistake type..." />
                </SelectTrigger>
                <SelectContent>
                  {MISTAKE_TYPES.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold" style={{ color: C.islamicBlue }}>Notes</Label>
              <TextareaInput
                value={mistakeNotes}
                onChange={(e) => setMistakeNotes(e.target.value)}
                placeholder="Describe the mistake and how to correct it..."
                className="mt-1.5 min-h-[80px] text-sm"
                style={{ borderColor: C.border }}
              />
            </div>
            <Button
              size="sm"
              className="text-white"
              style={{ backgroundColor: C.islamicBlue }}
              disabled={!selectedMistake}
              onClick={() => {
                setSavedMistakes(prev => [...prev, { type: selectedMistake, notes: mistakeNotes, date: new Date().toLocaleDateString() }])
                toast.success('Mistake recorded', { description: `${selectedMistake} for ${student.name}` })
                setSelectedMistake('')
                setMistakeNotes('')
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Save Mistake
            </Button>
            {/* Saved mistakes */}
            {savedMistakes.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>Recorded Mistakes</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {savedMistakes.map((m, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg p-2 text-xs" style={{ backgroundColor: C.lightGray }}>
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: C.islamicBlue }} />
                      <div>
                        <p className="font-semibold" style={{ color: C.textDark }}>{m.type}</p>
                        {m.notes && <p style={{ color: C.textMuted }}>{m.notes}</p>}
                        <p className="text-[10px]" style={{ color: C.textMuted }}>{m.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold" style={{ color: C.islamicBlue }}>Current Lesson</p>
                <span className="text-xs font-bold" style={{ color: C.teal }}>68%</span>
              </div>
              <Progress value={68} className="h-2" style={{ backgroundColor: C.lightGray }} />
              <p className="mt-1 text-[10px]" style={{ color: C.textMuted }}>Noorani Qaida — Lesson 12: Sukoon</p>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: C.islamicBlue }}>Last 5 Class Notes</p>
              <div className="space-y-2">
                {[
                  { date: 'Mar 10', note: 'Good progress on Sukoon. Needs more practice on Shaddah.', lesson: 'Lesson 12' },
                  { date: 'Mar 8', note: 'Shaddah concept understood but application is weak.', lesson: 'Lesson 11-12' },
                  { date: 'Mar 6', note: 'Tanween exercises completed. Moving to Sukoon next.', lesson: 'Lesson 11' },
                  { date: 'Mar 3', note: 'Excellent recitation of Tanween. Keep it up!', lesson: 'Lesson 10-11' },
                  { date: 'Mar 1', note: 'Started Tanween rules. Needs homework practice.', lesson: 'Lesson 10' },
                ].map((entry, i) => (
                  <div key={i} className="flex gap-3 rounded-lg p-2.5" style={{ backgroundColor: C.lightGray }}>
                    <div className="shrink-0 text-center" style={{ minWidth: '40px' }}>
                      <p className="text-[10px] font-bold" style={{ color: C.islamicBlue }}>{entry.date}</p>
                      <p className="text-[9px]" style={{ color: C.textMuted }}>{entry.lesson}</p>
                    </div>
                    <div className="w-px shrink-0 rounded-full" style={{ backgroundColor: C.border }} />
                    <p className="text-xs" style={{ color: C.textDark }}>{entry.note}</p>
                  </div>
                ))}
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full" style={{ borderColor: C.islamicBlue, color: C.islamicBlue }}>
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> View Full Progress Report
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// PLAN TYPE BADGE for class entries
// ============================================================
function PlanTypeBadge({ topic }: { topic?: string | null }) {
  if (!topic) return null
  const isQaida = topic.toLowerCase().includes('qaida') || topic.toLowerCase().includes('noorani')
  const isQuran = topic.toLowerCase().includes('quran') || topic.toLowerCase().includes('surah') || topic.toLowerCase().includes('tajweed') || topic.toLowerCase().includes('hifz')
  if (isQaida) return <Badge className="text-xs border-transparent text-white" style={{ backgroundColor: C.teal }}>Qaida</Badge>
  if (isQuran) return <Badge className="text-xs border-transparent text-white" style={{ backgroundColor: C.gold }}>Quran</Badge>
  return null
}

// ============================================================
// Main Dashboard — with sidebar layout
// ============================================================
function DashboardContentWithSidebar({ data, name, onLogout, userAvatar }: { data: DashboardData; name: string; onLogout: () => void; userAvatar?: string | null }) {
  const [activeSection, setActiveSection] = React.useState<SidebarSection>('overview')
  const [managingStudent, setManagingStudent] = React.useState<(BookingRow['student'] & { planType?: string }) | null>(null)
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
        onSuccess: () => toast.success('Class marked complete', { description: `${b.student.name}'s lesson has been recorded & wallet credited.` }),
        onError: (e: Error) => toast.error('Could not mark class complete', { description: e.message }),
        onSettled: () => setCompletingId(null),
      }
    )
  }

  // Derive today's classes
  const todayBookings = data.bookings
    .filter((b) => b.status === 'SCHEDULED' && isToday(parseISO(b.scheduledAt)))
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))

  const pendingFeedbacks = data.bookings.filter((b) => b.status === 'COMPLETED').length

  return (
    <div className="flex min-h-screen" style={{ background: C.offWhite }}>
      <SidebarNav active={activeSection} onChange={setActiveSection} onLogout={onLogout} userName={name} userAvatar={userAvatar} />

      {/* Main content area */}
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Status banner */}
            {data.profile && data.profile.status !== 'APPROVED' && <StatusBanner profile={data.profile} />}

            {/* Welcome header */}
            <WelcomeHeader name={name} approved={approved} />

            {/* ═══ TOP KPI CARDS ═══ */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                <Card className="relative overflow-hidden p-5" style={{ borderColor: C.border, borderTop: `3px solid ${C.islamicBlue}` }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Total Active Students</p>
                      <p className="mt-1 text-2xl font-extrabold" style={{ color: C.textDark }}>{data.stats.uniqueStudents}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${C.islamicBlue}15`, color: C.islamicBlue }}>
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" style={{ color: C.teal }} />
                    <span className="text-[10px] font-semibold" style={{ color: C.teal }}>+12%</span>
                    <span className="text-[10px]" style={{ color: C.textMuted }}>vs last month</span>
                  </div>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
                <Card className="relative overflow-hidden p-5" style={{ borderColor: C.border, borderTop: `3px solid ${C.teal}` }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Hours Taught This Month</p>
                      <p className="mt-1 text-2xl font-extrabold" style={{ color: C.textDark }}>{Math.round(data.stats.totalLessons * 0.5)}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${C.teal}15`, color: C.teal }}>
                      <Clock className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" style={{ color: C.teal }} />
                    <span className="text-[10px] font-semibold" style={{ color: C.teal }}>+8%</span>
                    <span className="text-[10px]" style={{ color: C.textMuted }}>vs last month</span>
                  </div>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <Card className="relative overflow-hidden p-5" style={{ borderColor: C.border, borderTop: `3px solid ${C.brightBlue}` }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Today&apos;s Classes</p>
                      <p className="mt-1 text-2xl font-extrabold" style={{ color: C.textDark }}>{todayBookings.length}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${C.brightBlue}15`, color: C.brightBlue }}>
                      <Calendar className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-[10px]" style={{ color: C.textMuted }}>{todayBookings.length > 0 ? 'Next: ' + (todayBookings[0] ? format(parseISO(todayBookings[0].scheduledAt), 'h:mm a') : '—') : 'No classes'}</span>
                  </div>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                <Card className="relative overflow-hidden p-5" style={{ borderColor: C.border, borderTop: `3px solid ${C.gold}` }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Pending Feedbacks</p>
                      <p className="mt-1 text-2xl font-extrabold" style={{ color: C.textDark }}>{pendingFeedbacks}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${C.gold}18`, color: C.gold }}>
                      <FileText className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {pendingFeedbacks > 0 ? (
                      <>
                        <ArrowDownRight className="h-3 w-3" style={{ color: '#EF4444' }} />
                        <span className="text-[10px] font-semibold" style={{ color: '#EF4444' }}>Action needed</span>
                      </>
                    ) : (
                      <span className="text-[10px]" style={{ color: C.teal }}>All caught up!</span>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* ═══ TODAY'S SCHEDULE (Timeline) ═══ */}
            <Card className="p-5 sm:p-6" style={{ borderColor: C.border }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${C.islamicBlue}15`, color: C.islamicBlue }}>
                  <CalendarClock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: C.textDark }}>Today&apos;s Schedule</h2>
                  <p className="text-xs" style={{ color: C.textMuted }}>{todayBookings.length} class{todayBookings.length !== 1 ? 'es' : ''} today</p>
                </div>
              </div>
              {todayBookings.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed p-8 text-center" style={{ borderColor: `${C.islamicBlue}20`, background: `${C.islamicBlue}04` }}>
                  <Calendar className="h-8 w-8" style={{ color: `${C.islamicBlue}40` }} />
                  <p className="mt-2 text-sm font-semibold" style={{ color: C.textDark }}>No classes today</p>
                  <p className="text-xs" style={{ color: C.textMuted }}>Your scheduled classes will appear here as a timeline.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline connector line */}
                  <div className="absolute left-[34px] top-6 bottom-6 w-0.5 rounded-full" style={{ backgroundColor: C.teal }} />
                  <div className="space-y-1">
                    {todayBookings.map((b, idx) => {
                      const { label } = formatBookingDate(b.scheduledAt)
                      const isCompleting = completingId === b.id
                      const isQaida = b.topic?.toLowerCase().includes('qaida') || b.topic?.toLowerCase().includes('noorani')
                      const isQuran = b.topic?.toLowerCase().includes('quran') || b.topic?.toLowerCase().includes('surah') || b.topic?.toLowerCase().includes('tajweed') || b.topic?.toLowerCase().includes('hifz')
                      return (
                        <div key={b.id} className="relative flex items-start gap-4 rounded-xl p-4 transition-colors hover:shadow-sm" style={{ border: `1px solid ${C.border}`, background: '#fff' }}>
                          {/* Timeline dot */}
                          <div className="relative z-10 flex flex-col items-center pt-1">
                            <div className="h-3 w-3 rounded-full border-2" style={{ borderColor: isQaida ? C.teal : C.gold, backgroundColor: isQaida ? C.tealLight : C.goldLight }} />
                          </div>
                          {/* Content */}
                          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3">
                              <Avatar name={b.student.name} src={b.student.avatar} country={b.student.country} size={40} />
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span
                                    className="cursor-pointer truncate text-sm font-semibold underline-offset-2 hover:underline"
                                    style={{ color: C.textDark }}
                                    onClick={() => setManagingStudent({ ...b.student, planType: isQaida ? 'Noorani Qaida' : 'Quran' })}
                                  >
                                    {b.student.name}
                                  </span>
                                  {/* Plan Type tag */}
                                  {isQaida && (
                                    <Badge className="text-[10px] font-bold border-transparent text-white" style={{ backgroundColor: C.teal }}>
                                      Noorani Qaida
                                    </Badge>
                                  )}
                                  {isQuran && (
                                    <Badge className="text-[10px] font-bold border-transparent text-white" style={{ backgroundColor: C.gold }}>
                                      Quran
                                    </Badge>
                                  )}
                                  {!isQaida && !isQuran && b.topic && (
                                    <Badge className="text-[10px] border-transparent text-white" style={{ backgroundColor: C.brightBlue }}>
                                      {b.topic}
                                    </Badge>
                                  )}
                                  {b.isTrial && <Badge style={{ backgroundColor: `${C.gold}18`, color: C.gold, borderColor: `${C.gold}40` }} className="text-[10px]">Trial</Badge>}
                                </div>
                                <p className="truncate text-xs" style={{ color: C.textMuted }}>
                                  {b.topic || 'Quran lesson'} · {b.durationMins} min
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {/* Scheduled time */}
                              <div className="shrink-0 text-right">
                                <p className="text-sm font-bold" style={{ color: C.islamicBlue }}>{format(parseISO(b.scheduledAt), 'h:mm a')}</p>
                              </div>
                              {/* Green Start Class button */}
                              <Button
                                size="sm"
                                className="text-white shadow-sm"
                                style={{ backgroundColor: C.teal }}
                                onClick={() => handleStart(b)}
                              >
                                <Video className="h-3.5 w-3.5" /> Start Class
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </Card>

            {/* ═══ TWO-COLUMN LAYOUT ═══ */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <UpcomingClasses bookings={data.bookings} onStart={handleStart} onComplete={handleComplete} completing={completingId} />
                <AvailabilityManager availabilities={data.availabilities} />
              </div>
              <div className="space-y-6">
                <EarningsWallet wallet={data.wallet} withdrawals={data.withdrawals} />
                <VerificationCenter profile={data.profile} />
              </div>
            </div>

            <WalletLedger />
          </div>
        </div>
      </main>

      {/* Student Management Popup */}
      {managingStudent && (
        <StudentManagementPopup student={managingStudent} onClose={() => setManagingStudent(null)} />
      )}
    </div>
  )
}

// ============================================================
// Default export — top-level Tutor Dashboard view
// ============================================================
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
  if (!user) return <AuthPrompt onLogin={() => openAuth('login')} />

  // Guard 2: not a tutor
  if (user.role !== 'TUTOR') return <BecomeTutorCta onRegister={() => openAuth('register')} />

  if (isLoading) return <DashboardSkeleton />

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-foreground">Couldn&apos;t load your dashboard</h2>
        <p className="mt-2 text-sm text-muted-foreground">Please try again in a moment.</p>
        <Button onClick={() => window.location.reload()} className="mt-4 text-white" style={{ backgroundColor: C.islamicBlue }}>
          Reload
        </Button>
      </div>
    )
  }

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" })
    useAppStore.getState().logout()
  }

  return <DashboardContentWithSidebar data={data} name={user.name} onLogout={handleLogout} userAvatar={(user as any).avatar} />
}

export default TutorDashboard

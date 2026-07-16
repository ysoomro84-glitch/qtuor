'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { toast } from 'sonner'
import {
  Clock,
  BookOpen,
  Moon,
  Star,
  TrendingUp,
  Video,
  X,
  Check,
  CheckCircle2,
  ArrowRight,
  LogIn,
  Search,
  Sparkles,
  Brain,
  Languages,
  ScrollText,
  Crown,
  AlertCircle,
  CalendarDays,
  Loader2,
  ShieldAlert,
  Home,
  LogOut,
  ChevronLeft,
  MessageCircle,
  CreditCard,
  Calendar,
  Users,
  GraduationCap,
  Zap,
  ClipboardList,
  FileText,
  Timer,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAppStore, type ViewKey } from '@/lib/store'
import { useStudentDashboard, useUpdateBooking } from '@/lib/queries'
import { SUBJECTS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar } from '@/components/shared/avatar'
import { BismillahHeader, StarMedallion } from '@/components/brand/patterns'
import { QtuorLogoLockup } from '@/components/brand/logo'

// ---------------- Types ----------------
type Tutor = { id: string; name: string; avatar?: string | null; country?: string | null }
type Booking = {
  id: string
  scheduledAt: string
  durationMins: number
  status: string
  isTrial?: boolean
  topic?: string | null
  meetingId?: string | null
  tutor: Tutor
}
type ProgressItem = {
  id: string
  subject: string
  lessonTitle: string
  surahName?: string | null
  completed: boolean
  progressPct: number
}
type Subscription = {
  id: string
  status: string
  startedAt: string
  expiresAt: string
  plan: {
    id: string
    name: string
    classesPerMonth: number
    monthlyPrice: number
    features: string[]
  }
}
type DashboardData = {
  subscription: Subscription | null
  bookings: Booking[]
  progress: ProgressItem[]
  stats: {
    completedLessons: number
    memorizedSurahs: number
    totalBookings: number
    completedBookings: number
    hasActiveSubscription: boolean
    subscriptionPlanName: string | null
    subscriptionExpiresAt: string | null
    completionRate: number
  }
}

// ---------------- Subject icons ----------------
const SUBJECT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Sparkles,
  Brain,
  Languages,
  ScrollText,
  Moon,
}
function subjectIcon(key: string) {
  const def = SUBJECTS.find((s) => s.key === key || s.label === key)
  const iconName = def?.icon || 'BookOpen'
  return SUBJECT_ICONS[iconName] || BookOpen
}

// ---------------- Helpers ----------------
function formatClassDate(iso: string) {
  const d = parseISO(iso)
  const day = isToday(d)
    ? 'Today'
    : isTomorrow(d)
      ? 'Tomorrow'
      : format(d, 'EEE, MMM d')
  return { day, time: format(d, 'h:mm a') }
}

function firstName(full: string) {
  return full?.trim().split(/\s+/)[0] || 'friend'
}

// ---------------- Motion variants ----------------
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: Math.min(i * 0.05, 0.4), duration: 0.45, ease: 'easeOut' as const },
  }),
}

// ============================================================
// Auth Gate
// ============================================================
function AuthGate() {
  const openAuth = useAppStore((s) => s.openAuth)
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4 py-12">
      <Card className="w-full overflow-hidden border-emerald-200 p-0 shadow-lg">
        <div className="relative h-24 bg-gradient-to-br from-emerald-600 to-teal-600">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
              <StarMedallion className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>
        <CardContent className="px-6 pb-6 pt-10 text-center">
          <h2 className="text-xl font-bold text-emerald-700">Sign in to view your dashboard</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Track your classes, lesson progress, and subscription — all in one blessed place.
          </p>
          <Button
            onClick={() => openAuth('login')}
            className="mt-5 w-full bg-emerald-600 text-white hover:bg-emerald-700"
            size="lg"
          >
            <LogIn className="h-4 w-4" />
            Log in / Sign up
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function WrongRole({ role }: { role: string }) {
  const setView = useAppStore((s) => s.setView)
  const target = role === 'TUTOR' ? 'tutor-dashboard' : role === 'ADMIN' ? 'admin' : 'landing'
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4 py-12">
      <Card className="w-full border-amber-200 bg-amber-50/60 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">This dashboard is for students</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account is registered as <span className="font-semibold">{role}</span>. Head to your own
          dashboard to continue.
        </p>
        <Button onClick={() => setView(target as any)} className="mt-4 w-full" variant="outline">
          Go to my dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Card>
    </div>
  )
}

// ============================================================
// Sidebar Navigation
// ============================================================
const SIDEBAR_ITEMS: { icon: React.ComponentType<{ className?: string }>; label: string; view: ViewKey }[] = [
  { icon: Home, label: 'Home', view: 'student-dashboard' },
  { icon: Users, label: 'Tutors', view: 'marketplace' },
  { icon: Calendar, label: 'Schedule', view: 'student-dashboard' },
  { icon: Video, label: 'Class', view: 'classroom' },
  { icon: CreditCard, label: 'Plans', view: 'plans' },
  { icon: MessageCircle, label: 'Chat', view: 'student-dashboard' },
]

function Sidebar({ activeView, onNavigate }: { activeView: string; onNavigate: (v: ViewKey) => void }) {
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
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = item.view === activeView && item.view !== 'student-dashboard'
          const Icon = item.icon
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.view)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </button>
          )
        })}
      </nav>
      {/* Bottom section */}
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
// Mobile Bottom Nav
// ============================================================
function MobileNav({ activeView, onNavigate }: { activeView: string; onNavigate: (v: ViewKey) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-white/95 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-around py-1.5">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = item.view === activeView && item.view !== 'student-dashboard'
          const Icon = item.icon
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.view)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-emerald-600' : 'text-muted-foreground'
              )}
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
// LIVE CLASSROOM Hero Section
// ============================================================
function LiveClassroomHero({ bookings }: { bookings: Booking[] }) {
  const setActiveBookingId = useAppStore((s) => s.setActiveBookingId)
  const setView = useAppStore((s) => s.setView)

  const now = new Date()
  const nextClass = bookings
    .filter((b) => b.status === 'SCHEDULED' && new Date(b.scheduledAt) > now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0]

  // Countdown timer
  const [countdown, setCountdown] = React.useState({ h: 0, m: 0, s: 0, total: 0 })
  React.useEffect(() => {
    if (!nextClass) return
    const update = () => {
      const diff = new Date(nextClass.scheduledAt).getTime() - Date.now()
      if (diff <= 0) {
        setCountdown({ h: 0, m: 0, s: 0, total: 0 })
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown({ h, m, s, total: diff })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [nextClass])

  const isWithin10Min = countdown.total > 0 && countdown.total <= 10 * 60 * 1000
  const isClassActive = nextClass && countdown.total === 0

  // Detect user timezone
  const userTimezone = React.useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return 'UTC' }
  }, [])

  if (!nextClass) {
    return (
      <Card className="overflow-hidden border-0 p-0">
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CalendarDays className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">No upcoming classes</h2>
              <p className="mt-1 text-sm text-muted-foreground">Find a verified tutor and book your next session.</p>
            </div>
            <Button
              onClick={() => setView('marketplace')}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Search className="h-4 w-4" />
              Find a Tutor
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  const { day, time } = formatClassDate(nextClass.scheduledAt)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card className="overflow-hidden border-0 p-0 shadow-lg">
        <div className={cn(
          'relative p-6 sm:p-8',
          isClassActive
            ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white'
            : isWithin10Min
              ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
              : 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white'
        )}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

          {/* LIVE badge */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(isClassActive || isWithin10Min) && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-2.5 py-0.5 text-xs font-bold text-white animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" /> LIVE
                </span>
              )}
              <span className="text-sm font-semibold uppercase tracking-wider text-white/80">
                Next Class
              </span>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 text-xs">
              {nextClass.isTrial ? 'Trial Class' : 'Regular Class'}
            </Badge>
          </div>

          {/* Class details */}
          <div className="relative mt-4">
            <div className="flex items-center gap-3">
              <Avatar name={nextClass.tutor.name} src={nextClass.tutor.avatar} country={nextClass.tutor.country} size={52} />
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">
                  {nextClass.tutor.name}
                </h2>
                {nextClass.topic && (
                  <p className="mt-0.5 text-sm text-white/80 line-clamp-1">{nextClass.topic}</p>
                )}
              </div>
            </div>
          </div>

          {/* Time info */}
          <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/90">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {day}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {time} (Local Time)
            </span>
            <span className="flex items-center gap-1.5">
              <Timer className="h-4 w-4" /> {nextClass.durationMins} min
            </span>
          </div>

          {/* Countdown */}
          <div className="relative mt-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {countdown.total > 0 ? (
                <>
                  <span className="text-sm text-white/70">Starts in:</span>
                  <div className="flex items-center gap-1 font-mono text-lg font-bold tabular-nums">
                    {countdown.h > 0 && <>{String(countdown.h).padStart(2, '0')}:</>}
                    <span className={cn('rounded-md bg-white/20 px-2 py-1', isWithin10Min && 'bg-red-500/40 animate-pulse')}>
                      {String(countdown.m).padStart(2, '0')}
                    </span>
                    <span>:</span>
                    <span className={cn('rounded-md bg-white/20 px-2 py-1', isWithin10Min && 'bg-red-500/40 animate-pulse')}>
                      {String(countdown.s).padStart(2, '0')}
                    </span>
                  </div>
                </>
              ) : (
                <span className="flex items-center gap-2 text-lg font-bold">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
                  Class is starting now!
                </span>
              )}
            </div>
          </div>

          {/* ENTER VIRTUAL CLASSROOM Button */}
          <div className="relative mt-5">
            <Button
              size="lg"
              className={cn(
                'w-full text-base font-bold py-6 transition-all',
                isClassActive || isWithin10Min
                  ? 'bg-white text-emerald-700 hover:bg-white/90 shadow-xl animate-pulse'
                  : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
              )}
              onClick={() => {
                setActiveBookingId(nextClass.id)
                setView('classroom')
              }}
            >
              <Video className="h-5 w-5" />
              {isClassActive || isWithin10Min ? 'ENTER VIRTUAL CLASSROOM' : 'Join Classroom'}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================================
// Stat cards (compact for sidebar-free layout)
// ============================================================
function StatCard({
  index,
  icon: Icon,
  label,
  value,
  sub,
  accent = 'primary',
  action,
}: {
  index: number
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
  sub?: string
  accent?: 'primary' | 'accent' | 'gold'
  action?: React.ReactNode
}) {
  const accentBg =
    accent === 'accent'
      ? 'bg-emerald-50 text-emerald-600'
      : accent === 'gold'
        ? 'bg-amber-50 text-amber-600'
        : 'bg-teal-50 text-teal-600'
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <Card className="group h-full gap-0 p-4 transition-shadow hover:shadow-md border-border/60">
        <div className="flex items-start justify-between">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', accentBg)}>
            <Icon className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold tracking-tight text-foreground">{value}</div>
          <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          {sub && <div className="mt-1 text-xs text-muted-foreground/80">{sub}</div>}
          {action && <div className="mt-2">{action}</div>}
        </div>
      </Card>
    </motion.div>
  )
}

function CompletionRing({ pct }: { pct: number }) {
  const r = 18
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c
  return (
    <div className="relative h-10 w-10">
      <svg viewBox="0 0 44 44" className="h-10 w-10 -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#d4edda" strokeWidth="4" />
        <circle
          cx="22" cy="22" r={r}
          fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-700">
        {pct}%
      </span>
    </div>
  )
}

function StatsRow({ stats }: { stats: DashboardData['stats'] }) {
  const setView = useAppStore((s) => s.setView)
  const hasActive = stats.hasActiveSubscription
  const expiryLabel = stats.subscriptionExpiresAt
    ? format(parseISO(stats.subscriptionExpiresAt), 'MMM d, yyyy')
    : null

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        index={0}
        icon={Crown}
        label="Subscription"
        value={
          hasActive ? (
            <span className="block text-sm font-bold leading-snug">
              {stats.subscriptionPlanName ?? 'Active'}
            </span>
          ) : (
            'No plan'
          )
        }
        sub={hasActive ? (expiryLabel ? `Until ${expiryLabel}` : 'Unlimited classes') : 'Subscribe to unlock'}
        accent="accent"
        action={
          !hasActive ? (
            <Button size="sm" className="w-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => setView('plans')}>
              <Crown className="h-3.5 w-3.5" /> Subscribe
            </Button>
          ) : null
        }
      />
      <StatCard
        index={1}
        icon={BookOpen}
        label="Lessons Done"
        value={stats.completedLessons}
        sub={`${stats.completedBookings}/${stats.totalBookings} classes`}
        accent="primary"
      />
      <StatCard
        index={2}
        icon={Moon}
        label="Surahs Memorized"
        value={stats.memorizedSurahs}
        sub="with revision"
        accent="gold"
      />
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="h-full p-4 transition-shadow hover:shadow-md border-border/60">
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <CompletionRing pct={stats.completionRate} />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold tracking-tight text-foreground">{stats.completionRate}%</div>
            <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Completion Rate</div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

// ============================================================
// Upcoming Classes (Schedule)
// ============================================================
function UpcomingClasses({ bookings }: { bookings: Booking[] }) {
  const setActiveBookingId = useAppStore((s) => s.setActiveBookingId)
  const setView = useAppStore((s) => s.setView)
  const updateBooking = useUpdateBooking()

  const now = new Date()
  const upcoming = bookings
    .filter((b) => b.status === 'SCHEDULED' && new Date(b.scheduledAt) > now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const onCancel = (b: Booking) => {
    updateBooking.mutate(
      { id: b.id, status: 'CANCELLED' },
      {
        onSuccess: () => toast.success('Class cancelled', { description: `With ${b.tutor.name}` }),
        onError: (e: unknown) =>
          toast.error('Could not cancel', { description: e instanceof Error ? e.message : 'Try again' }),
      }
    )
  }

  return (
    <Card className="p-5 sm:p-6 border-border/60">
      <SectionHeader eyebrow="Your schedule" title="Upcoming Classes" icon={CalendarDays} />
      {upcoming.length === 0 ? (
        <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-emerald-200 bg-emerald-50/30 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-foreground">No upcoming classes</h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Find a verified tutor and book your next session in just a few clicks.
          </p>
          <Button
            onClick={() => setView('marketplace')}
            className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Search className="h-4 w-4" />
            Find a Tutor
          </Button>
        </div>
      ) : (
        <div className="mt-4 max-h-96 space-y-3 overflow-y-auto scrollbar-quran pr-1">
          {upcoming.map((b) => {
            const { day, time } = formatClassDate(b.scheduledAt)
            return (
              <div
                key={b.id}
                className="group flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 transition-colors hover:border-emerald-300 hover:bg-emerald-50/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={b.tutor.name} src={b.tutor.avatar} country={b.tutor.country} size={44} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold text-foreground">{b.tutor.name}</span>
                      {b.isTrial && (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200">Trial</Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="font-medium text-emerald-600">{day}</span>
                      <span>·</span>
                      <span>{time}</span>
                      <span>·</span>
                      <span>{b.durationMins} min</span>
                    </div>
                    {b.topic && (
                      <div className="mt-1 truncate text-xs text-foreground/70">
                        <span className="text-muted-foreground">Topic:</span> {b.topic}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onCancel(b)}
                    disabled={updateBooking.isPending}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={() => {
                      setActiveBookingId(b.id)
                      setView('classroom')
                    }}
                  >
                    <Video className="h-4 w-4" />
                    Join
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

// ============================================================
// Quick Actions
// ============================================================
function QuickActions() {
  const setView = useAppStore((s) => s.setView)
  return (
    <Card className="p-5 sm:p-6 border-border/60">
      <SectionHeader eyebrow="Shortcuts" title="Quick Actions" icon={Zap} />
      <div className="mt-4 space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 py-5"
          onClick={() => setView('marketplace')}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
            <Search className="h-4 w-4" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold">Find a Quran Tutor</div>
            <div className="text-xs text-emerald-600/70">Browse verified tutors by subject</div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 py-5"
          onClick={() => setView('plans')}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold">View Subscription Plans</div>
            <div className="text-xs text-teal-600/70">Manage or upgrade your plan</div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 py-5"
          onClick={() => setView('library')}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold">Open Quran Library</div>
            <div className="text-xs text-amber-600/70">Read Noorani Qaida & Quran</div>
          </div>
        </Button>
      </div>
    </Card>
  )
}

// ============================================================
// Lesson Progress Tracker
// ============================================================
function LessonProgressTracker({ progress }: { progress: ProgressItem[] }) {
  const grouped = React.useMemo(() => {
    const map = new Map<string, ProgressItem[]>()
    for (const p of progress) {
      const key = p.subject || 'General'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    }
    return Array.from(map.entries()).map(([subject, items]) => {
      const avg = Math.round(items.reduce((s, i) => s + (i.progressPct || 0), 0) / items.length)
      return { subject, items, avg }
    })
  }, [progress])

  return (
    <Card className="p-5 sm:p-6 border-border/60">
      <SectionHeader eyebrow="Keep growing" title="My Progress / Class Logs" icon={Sparkles} />
      {grouped.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-border/70 bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No lessons tracked yet. Once you complete your first class, your progress will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-5">
          {grouped.map((g) => {
            const Icon = subjectIcon(g.subject)
            return (
              <div key={g.subject} className="rounded-xl border border-border/60 bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{g.subject}</div>
                      <div className="text-xs text-muted-foreground">
                        {g.items.length} lesson{g.items.length !== 1 ? 's' : ''} · {g.avg}% avg
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{g.avg}%</span>
                </div>
                <Progress
                  value={g.avg}
                  className="mt-3 h-1.5 bg-emerald-100 [&>[data-slot=progress-indicator]]:bg-emerald-600"
                />
                <ul className="mt-3 max-h-64 space-y-1.5 overflow-y-auto scrollbar-quran pr-1">
                  {g.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/40"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        {item.completed ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500" />
                        ) : (
                          <div className="h-4 w-4 shrink-0 rounded-full border-2 border-emerald-400" />
                        )}
                        <div className="min-w-0">
                          <div className="truncate text-foreground">{item.lessonTitle}</div>
                          {item.surahName && (
                            <div className="truncate text-xs text-muted-foreground">{item.surahName}</div>
                          )}
                        </div>
                      </div>
                      <span className={cn('shrink-0 text-xs font-semibold', item.completed ? 'text-amber-500' : 'text-emerald-600')}>
                        {item.completed ? (
                          <span className="inline-flex items-center gap-1"><Check className="h-3 w-3" /> Done</span>
                        ) : (
                          `${item.progressPct}%`
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

// ============================================================
// Current Plan card
// ============================================================
function CurrentPlan({ subscription }: { subscription: Subscription | null }) {
  const setView = useAppStore((s) => s.setView)

  if (!subscription) {
    return (
      <Card className="overflow-hidden border-0 p-0">
        <div className="relative bg-gradient-to-br from-emerald-700 to-teal-700 p-6 text-white">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="relative">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-300" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">No active plan</span>
            </div>
            <h3 className="mt-2 text-lg font-bold">Start your Quran journey today</h3>
            <p className="mt-1 text-sm text-white/80">Choose a subscription plan and unlock monthly classes with verified tutors.</p>
            <Button onClick={() => setView('plans')} className="mt-4 w-full bg-white text-emerald-700 hover:bg-white/90">
              <Crown className="h-4 w-4" /> Choose a Plan
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  const expires = format(parseISO(subscription.expiresAt), 'MMM d, yyyy')

  return (
    <Card className="overflow-hidden p-0 border-border/60">
      <div className="relative bg-gradient-to-br from-emerald-700 to-teal-700 p-5 text-white">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white/70">Current Plan</div>
            <div className="mt-1 text-xl font-bold">{subscription.plan.name}</div>
            <div className="mt-0.5 text-sm text-white/80">
              {subscription.plan.classesPerMonth} classes/mo · ${subscription.plan.monthlyPrice}/mo
            </div>
          </div>
          <Badge className="bg-amber-400 text-amber-900 border-transparent">Active</Badge>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="text-muted-foreground">Renews on</span>
            <span className="font-semibold text-foreground">{expires}</span>
          </div>
        </div>
        {subscription.plan.features?.length > 0 && (
          <ul className="space-y-1.5">
            {subscription.plan.features.slice(0, 5).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50" onClick={() => setView('plans')}>
            <Crown className="h-4 w-4" /> Upgrade
          </Button>
          <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => setView('marketplace')}>
            <Search className="h-4 w-4" /> Find Tutors
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ============================================================
// Booking History
// ============================================================
function BookingHistory({ bookings }: { bookings: Booking[] }) {
  const past = bookings.filter((b) => b.status === 'COMPLETED').slice(0, 8)

  return (
    <Card className="p-5 sm:p-6 border-border/60">
      <SectionHeader eyebrow="Recently" title="Class History" icon={Clock} />
      {past.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-border/70 bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">No completed classes yet.</p>
        </div>
      ) : (
        <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto scrollbar-quran pr-1">
          {past.map((b) => {
            const d = parseISO(b.scheduledAt)
            return (
              <li key={b.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-2.5 transition-colors hover:bg-muted/40">
                <Avatar name={b.tutor.name} src={b.tutor.avatar} country={b.tutor.country} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{b.tutor.name}</div>
                  <div className="text-xs text-muted-foreground">{format(d, 'MMM d, yyyy')} · {b.durationMins}m</div>
                </div>
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

// ============================================================
// Section header (eyebrow + title)
// ============================================================
function SectionHeader({ eyebrow, title, icon: Icon }: { eyebrow: string; title: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600">{eyebrow}</div>
        <h3 className="text-base font-bold leading-tight text-foreground">{title}</h3>
      </div>
    </div>
  )
}

// ============================================================
// Loading skeleton
// ============================================================
function LoadingState() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading your dashboard...</span>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted/60" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="h-80 animate-pulse rounded-xl bg-muted/60 lg:col-span-2" />
        <div className="h-80 animate-pulse rounded-xl bg-muted/60" />
      </div>
    </div>
  )
}

// ============================================================
// Top bar (compact — for non-sidebar screens)
// ============================================================
function DashboardTopBar({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-border/60 bg-white/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <span className="text-base font-bold text-foreground">NOOR ACADEMY</span>
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

// ============================================================
// Main dashboard
// ============================================================
export function StudentDashboard() {
  const user = useAppStore((s) => s.user)
  const setView = useAppStore((s) => s.setView)
  const { data, isLoading, isError, error } = useStudentDashboard()

  // Auth guard
  if (!user) return <AuthGate />
  if (user.role !== 'STUDENT') return <WrongRole role={user.role} />
  if (isLoading) return <LoadingState />

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold">Could not load your dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'Please try again later.'}
        </p>
      </div>
    )
  }

  const dash = data as DashboardData

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'DELETE' })
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
        <Sidebar activeView="student-dashboard" onNavigate={navigateTo} />

        {/* Main content */}
        <main className="flex-1 pb-20 lg:pb-8">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            {/* Welcome Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">
                Assalam-o-Alaikum, <span className="text-emerald-600">{firstName(user.name)}</span> 👋
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                May your journey of learning the Quran be filled with light.
              </p>
            </div>

            {/* LIVE CLASSROOM Hero — top priority */}
            <LiveClassroomHero bookings={dash.bookings} />

            {/* Stats */}
            <div className="mt-6">
              <StatsRow stats={dash.stats} />
            </div>

            {/* Two-column: Quick Actions + Progress side by side */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <QuickActions />
              <LessonProgressTracker progress={dash.progress} />
            </div>

            {/* Two-column: Schedule + Plan/History */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <UpcomingClasses bookings={dash.bookings} />
              </div>
              <div className="space-y-6">
                <CurrentPlan subscription={dash.subscription} />
                <BookingHistory bookings={dash.bookings} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav activeView="student-dashboard" onNavigate={navigateTo} />
    </div>
  )
}

export default StudentDashboard

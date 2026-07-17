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
  LogOut,
  CreditCard,
  Calendar,
  Users,
  Zap,
  ClipboardList,
  FileText,
  Timer,
  Bell,
  ChevronRight,
  Flame,
  BookOpenText,
  Headphones,
  Play,
  Target,
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
import { BismillahHeader, StarMedallion, IslamicPatternBand } from '@/components/brand/patterns'
import { QtuorLogoLockup } from '@/components/brand/logo'

// ─── Brand Color Tokens (Islamic Blue + Teal + Off-white) ─────────────
const C = {
  islamicBlue: '#0F4C81',
  deepNavy: '#0A2F4F',
  brightBlue: '#1E6CB5',
  teal: '#10B981',
  tealDark: '#059669',
  tealLight: '#D1FAE5',
  gold: '#D4AF37',
  offWhite: '#F8FAFC',
  lightGray: '#F1F5F9',
  border: '#E2E8F0',
  textDark: '#0F172A',
  textMuted: '#64748B',
}

// ─── Types ────────────────────────────────────────────────────────────
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
    category: string
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

// ─── Helpers ──────────────────────────────────────────────────────────
function formatClassDate(iso: string) {
  const d = parseISO(iso)
  const day = isToday(d) ? 'Today' : isTomorrow(d) ? 'Tomorrow' : format(d, 'EEE, MMM d')
  return { day, time: format(d, 'h:mm a') }
}
function firstName(full: string) { return full?.trim().split(/\s+/)[0] || 'friend' }

// Detect plan type from subscription category
function getPlanType(sub: Subscription | null): 'qaida' | 'quran' | 'both' {
  if (!sub) return 'both'
  const cat = sub.plan.category
  if (cat === 'Noorani Qaida') return 'qaida'
  if (cat === 'Quran Recitation With Tajweed' || cat === 'Hifz') return 'quran'
  return 'both' // General category
}

// ─── Motion variants ──────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: Math.min(i * 0.05, 0.4), duration: 0.45, ease: 'easeOut' as const },
  }),
}

// ─── Subject icon mapping ─────────────────────────────────────────────
const SUBJECT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, Sparkles, Brain, Languages, ScrollText, Moon,
}
function subjectIcon(key: string) {
  const def = SUBJECTS.find((s) => s.key === key || s.label === key)
  return SUBJECT_ICONS[def?.icon || 'BookOpen'] || BookOpen
}

// ============================================================
// AUTH GATE
// ============================================================
function AuthGate() {
  const openAuth = useAppStore((s) => s.openAuth)
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4 py-12">
      <Card className="w-full overflow-hidden border-0 p-0 shadow-lg">
        <div className="relative h-24" style={{ background: `linear-gradient(135deg, ${C.deepNavy}, ${C.islamicBlue})` }}>
          <div className="pattern-stars absolute inset-0 opacity-30" />
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
              <StarMedallion className="h-8 w-8" style={{ color: C.islamicBlue }} />
            </div>
          </div>
        </div>
        <CardContent className="px-6 pb-6 pt-10 text-center">
          <h2 className="text-xl font-bold" style={{ color: C.islamicBlue }}>Sign in to view your dashboard</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm" style={{ color: C.textMuted }}>
            Track your classes, lesson progress, and subscription — all in one blessed place.
          </p>
          <Button
            onClick={() => openAuth('login')}
            className="mt-5 w-full text-white hover:opacity-90"
            size="lg"
            style={{ backgroundColor: C.islamicBlue }}
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
          Your account is registered as <span className="font-semibold">{role}</span>. Head to your own dashboard to continue.
        </p>
        <Button onClick={() => setView(target as any)} className="mt-4 w-full" variant="outline">
          Go to my dashboard <ArrowRight className="h-4 w-4" />
        </Button>
      </Card>
    </div>
  )
}

// ============================================================
// HEADER (Top Bar)
// Left: Qtuor Logo + Assalamu Alaikum, [Student Name]
// Right: Plan Badge | Notification Bell | Profile Dropdown
// ============================================================
function DashboardHeader({ userName, planType, onLogout }: { userName: string; planType: 'qaida' | 'quran' | 'both'; onLogout: () => void }) {
  const planLabel = planType === 'qaida' ? 'Noorani Qaida Student' : planType === 'quran' ? 'Quran Student' : 'Full Access Student'
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl" style={{ background: 'rgba(248, 250, 252, 0.95)', borderBottom: `1px solid ${C.border}` }}>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <QtuorLogoLockup size="sm" />
          <span className="hidden text-sm font-medium sm:inline" style={{ color: C.textDark }}>
            Assalamu Alaikum, <span className="font-semibold" style={{ color: C.islamicBlue }}>{firstName(userName)}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Badge className="text-white border-transparent text-xs font-semibold" style={{ backgroundColor: C.islamicBlue }}>
            {planLabel}
          </Badge>
          <Button variant="ghost" size="icon" className="relative h-8 w-8" style={{ color: C.textMuted }}>
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogout} className="gap-1.5" style={{ color: C.textMuted }}>
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

// ============================================================
// LIVE CLASS CARD (Hero Widget) — Islamic Blue gradient
// ============================================================
function LiveClassroomHero({ bookings, planType }: { bookings: Booking[]; planType: 'qaida' | 'quran' | 'both' }) {
  const setActiveBookingId = useAppStore((s) => s.setActiveBookingId)
  const setView = useAppStore((s) => s.setView)

  const nextClass = bookings
    .filter((b) => b.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0]

  const [countdown, setCountdown] = React.useState({ h: 0, m: 0, s: 0, total: 0 })
  React.useEffect(() => {
    if (!nextClass) return
    const update = () => {
      const diff = new Date(nextClass.scheduledAt).getTime() - Date.now()
      if (diff <= 0) { setCountdown({ h: 0, m: 0, s: 0, total: 0 }); return }
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

  if (!nextClass) {
    return (
      <Card className="overflow-hidden border-0 p-0 shadow-md">
        <div className="relative p-6 sm:p-8 text-white" style={{ background: `linear-gradient(135deg, ${C.deepNavy}, ${C.islamicBlue})` }}>
          <div className="pattern-stars absolute inset-0 opacity-20" />
          <div className="relative flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <CalendarDays className="h-8 w-8 text-white/80" />
            </div>
            <div>
              <h2 className="text-lg font-bold">No upcoming classes</h2>
              <p className="mt-1 text-sm text-white/70">Find a verified tutor and book your next session.</p>
            </div>
            <Button onClick={() => setView('marketplace')} className="bg-white hover:bg-white/90" style={{ color: C.islamicBlue }}>
              <Search className="h-4 w-4" /> Find a Tutor
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  const { day, time } = formatClassDate(nextClass.scheduledAt)

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="overflow-hidden border-0 p-0 shadow-lg">
        <div className="relative p-6 sm:p-8 text-white" style={{ background: `linear-gradient(135deg, ${C.deepNavy}, ${C.islamicBlue})` }}>
          <div className="pattern-stars absolute inset-0 opacity-20" />
          {/* LIVE badge + Next Class label */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(isClassActive || isWithin10Min) && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-2.5 py-0.5 text-xs font-bold text-white animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" /> LIVE
                </span>
              )}
              <span className="text-sm font-semibold uppercase tracking-wider text-white/70">Next Class</span>
            </div>
            <Badge className="border-transparent text-xs" style={{ backgroundColor: C.teal, color: '#fff' }}>
              {nextClass.isTrial ? 'Trial' : 'Regular'}
            </Badge>
          </div>
          {/* Teacher info */}
          <div className="relative mt-4 flex items-center gap-3">
            <Avatar name={nextClass.tutor.name} src={nextClass.tutor.avatar} country={nextClass.tutor.country} size={52} />
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">{nextClass.tutor.name}</h2>
              {nextClass.topic && <p className="mt-0.5 text-sm text-white/80 line-clamp-1">{nextClass.topic}</p>}
            </div>
          </div>
          {/* Time info */}
          <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/90">
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {day}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {time}</span>
            <span className="flex items-center gap-1.5"><Timer className="h-4 w-4" /> {nextClass.durationMins} min</span>
          </div>
          {/* Countdown */}
          <div className="relative mt-5 flex items-center gap-2">
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
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" /> Class is starting now!
              </span>
            )}
          </div>
          {/* ENTER VIRTUAL CLASSROOM Button */}
          <div className="relative mt-5">
            <Button
              size="lg"
              className={cn(
                'w-full text-base font-bold py-6 transition-all',
                isClassActive || isWithin10Min
                  ? 'shadow-xl animate-pulse text-white hover:opacity-90'
                  : 'bg-white/15 text-white hover:bg-white/25 border border-white/30'
              )}
              style={isClassActive || isWithin10Min ? { backgroundColor: C.teal } : undefined}
              onClick={() => { setActiveBookingId(nextClass.id); setView('classroom') }}
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
// DYNAMIC PLAN SECTION — Switches between Qaida & Quran
// ============================================================
function DynamicPlanSection({ progress, planType }: { progress: ProgressItem[]; planType: 'qaida' | 'quran' | 'both' }) {
  const isQaida = planType === 'qaida' || planType === 'both'
  const isQuran = planType === 'quran' || planType === 'both'

  // Get current lesson info based on plan
  const qaidaProgress = progress.find(p => p.subject === 'Noorani Qaida')
  const quranProgress = progress.find(p => p.subject === 'Quran Recitation With Tajweed' || p.subject === 'Hifz')

  return (
    <Card className="p-5 sm:p-6" style={{ borderColor: C.border }}>
      <SectionHeader
        eyebrow="Your learning track"
        title={planType === 'qaida' ? 'Noorani Qaida' : planType === 'quran' ? 'Quran Recitation' : 'Qaida + Quran'}
        icon={BookOpenText}
      />

      {/* QAIDA SECTION */}
      {isQaida && (
        <div className="mt-4 rounded-xl p-4" style={{ background: C.lightGray, border: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${C.islamicBlue}18`, color: C.islamicBlue }}>
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: C.textDark }}>Noorani Qaida</div>
                <div className="text-xs" style={{ color: C.textMuted }}>
                  {qaidaProgress ? `Current: ${qaidaProgress.lessonTitle}` : 'Starting your Qaida journey'}
                </div>
              </div>
            </div>
            {qaidaProgress && (
              <span className="text-sm font-bold" style={{ color: C.teal }}>{qaidaProgress.progressPct}%</span>
            )}
          </div>
          {qaidaProgress && (
            <Progress
              value={qaidaProgress.progressPct}
              className="mt-3 h-2"
              style={{ '--progress-bg': `${C.islamicBlue}15` } as React.CSSProperties}
            />
          )}
          {/* Practice flashcards teaser */}
          <div className="mt-3 flex items-center gap-2 rounded-lg p-2.5" style={{ backgroundColor: `${C.teal}10` }}>
            <Headphones className="h-4 w-4" style={{ color: C.teal }} />
            <span className="text-xs font-medium" style={{ color: C.tealDark }}>Audio practice & flashcards available</span>
            <ChevronRight className="ml-auto h-3.5 w-3.5" style={{ color: C.teal }} />
          </div>
        </div>
      )}

      {/* QURAN SECTION */}
      {isQuran && (
        <div className={cn('rounded-xl p-4', isQaida && 'mt-3')} style={{ background: C.lightGray, border: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${C.teal}18`, color: C.teal }}>
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: C.textDark }}>Quran Recitation</div>
                <div className="text-xs" style={{ color: C.textMuted }}>
                  {quranProgress ? `Current: ${quranProgress.lessonTitle}` : 'Starting your Quran journey'}
                </div>
              </div>
            </div>
            {quranProgress && (
              <span className="text-sm font-bold" style={{ color: C.teal }}>{quranProgress.progressPct}%</span>
            )}
          </div>
          {quranProgress && (
            <Progress value={quranProgress.progressPct} className="mt-3 h-2" />
          )}
          {/* Sabaq / Sabqi / Manzil tabs */}
          <div className="mt-3 flex gap-1.5">
            {['Sabaq', 'Sabqi', 'Manzil'].map((tab) => (
              <button
                key={tab}
                className="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: tab === 'Sabaq' ? C.islamicBlue : `${C.islamicBlue}10`,
                  color: tab === 'Sabaq' ? '#fff' : C.islamicBlue,
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Teacher's Feed & Homework */}
      <div className="mt-4 rounded-xl p-4" style={{ background: `${C.islamicBlue}06`, border: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: C.islamicBlue }}>
          <FileText className="h-3.5 w-3.5" /> Teacher&apos;s Feedback
        </div>
        <p className="mt-2 text-sm" style={{ color: C.textMuted }}>
          Good progress on Harakat! Practice Damma sounds more — focus on the rounded lip shape. Keep up the great work!
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="outline" className="text-xs" style={{ borderColor: C.teal, color: C.tealDark }}>Homework: Practice Lesson 5</Badge>
        </div>
      </div>
    </Card>
  )
}

// ============================================================
// QUICK PROGRESS RING (Circular)
// ============================================================
function ProgressRing({ pct, label, color }: { pct: number; label: string; color: string }) {
  const r = 28
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-16 w-16">
        <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke={`${color}15`} strokeWidth="5" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={offset} className="transition-[stroke-dashoffset] duration-700" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color }}>
          {pct}%
        </span>
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wide text-center" style={{ color: C.textMuted }}>{label}</span>
    </div>
  )
}

// ============================================================
// WEEKLY ATTENDANCE / STREAK
// ============================================================
function WeeklyStreak({ stats }: { stats: DashboardData['stats'] }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  // Demo streak data — show 5 day streak
  const streakDays = [true, true, true, true, true, false, false]
  const streakCount = 5

  return (
    <Card className="p-5" style={{ borderColor: C.border }}>
      <div className="flex items-center justify-between">
        <SectionHeader eyebrow="Consistency" title="Weekly Streak" icon={Flame} />
        <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ backgroundColor: `${C.teal}12` }}>
          <Flame className="h-3.5 w-3.5" style={{ color: C.teal }} />
          <span className="text-xs font-bold" style={{ color: C.tealDark }}>{streakCount} Days</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-1">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-all',
              streakDays[i] ? 'text-white' : ''
            )} style={{ backgroundColor: streakDays[i] ? C.teal : C.lightGray, color: streakDays[i] ? '#fff' : C.textMuted }}>
              {streakDays[i] ? <Check className="h-4 w-4" /> : d}
            </div>
            <span className="text-[9px] font-medium" style={{ color: C.textMuted }}>{d}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ============================================================
// UPCOMING CLASSES
// ============================================================
function UpcomingClasses({ bookings }: { bookings: Booking[] }) {
  const setActiveBookingId = useAppStore((s) => s.setActiveBookingId)
  const setView = useAppStore((s) => s.setView)
  const updateBooking = useUpdateBooking()

  const upcoming = bookings
    .filter((b) => b.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const onCancel = (b: Booking) => {
    updateBooking.mutate(
      { id: b.id, status: 'CANCELLED' },
      {
        onSuccess: () => toast.success('Class cancelled', { description: `With ${b.tutor.name}` }),
        onError: (e: unknown) => toast.error('Could not cancel', { description: e instanceof Error ? e.message : 'Try again' }),
      }
    )
  }

  return (
    <Card className="p-5 sm:p-6" style={{ borderColor: C.border }}>
      <SectionHeader eyebrow="Your schedule" title="Upcoming Classes" icon={CalendarDays} />
      {upcoming.length === 0 ? (
        <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed p-8 text-center" style={{ borderColor: `${C.islamicBlue}20`, backgroundColor: `${C.islamicBlue}04` }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${C.islamicBlue}12`, color: C.islamicBlue }}>
            <Search className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-base font-semibold" style={{ color: C.textDark }}>No upcoming classes</h3>
          <p className="mt-1 max-w-xs text-sm" style={{ color: C.textMuted }}>Find a verified tutor and book your next session.</p>
          <Button onClick={() => setView('marketplace')} className="mt-4 text-white" style={{ backgroundColor: C.islamicBlue }}>
            <Search className="h-4 w-4" /> Find a Tutor
          </Button>
        </div>
      ) : (
        <div className="mt-4 max-h-96 space-y-3 overflow-y-auto scrollbar-quran pr-1">
          {upcoming.map((b) => {
            const { day, time } = formatClassDate(b.scheduledAt)
            return (
              <div key={b.id} className="group flex flex-col gap-3 rounded-xl p-4 transition-colors hover:border-[#0F4C81]/40 sm:flex-row sm:items-center sm:justify-between" style={{ border: `1px solid ${C.border}`, background: '#fff' }}>
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={b.tutor.name} src={b.tutor.avatar} country={b.tutor.country} size={44} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold" style={{ color: C.textDark }}>{b.tutor.name}</span>
                      {b.isTrial && <Badge style={{ backgroundColor: `${C.teal}18`, color: C.tealDark, borderColor: `${C.teal}40` }}>Trial</Badge>}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs" style={{ color: C.textMuted }}>
                      <span className="font-medium" style={{ color: C.islamicBlue }}>{day}</span>
                      <span>·</span><span>{time}</span><span>·</span><span>{b.durationMins} min</span>
                    </div>
                    {b.topic && (
                      <div className="mt-1 truncate text-xs" style={{ color: C.textMuted }}>
                        <span>Topic:</span> {b.topic}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                  <Button variant="ghost" size="sm" className="hover:bg-destructive/10 hover:text-destructive" style={{ color: C.textMuted }} onClick={() => onCancel(b)} disabled={updateBooking.isPending}>
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                  <Button size="sm" className="text-white" style={{ backgroundColor: C.islamicBlue }} onClick={() => { setActiveBookingId(b.id); setView('classroom') }}>
                    <Video className="h-4 w-4" /> Join
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
// STAT CARD
// ============================================================
function StatCard({ index, icon: Icon, label, value, sub, accent }: {
  index: number; icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode; sub?: string; accent?: 'blue' | 'teal' | 'gold'
}) {
  const accentColor = accent === 'teal' ? C.teal : accent === 'gold' ? C.gold : C.islamicBlue
  return (
    <motion.div custom={index} variants={fadeUp} initial="hidden" animate="visible">
      <Card className="h-full gap-0 p-4 transition-shadow hover:shadow-md" style={{ borderColor: C.border }}>
        <div className="flex items-start justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${accentColor}12`, color: accentColor }}>
            <Icon className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold tracking-tight" style={{ color: C.textDark }}>{value}</div>
          <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide" style={{ color: C.textMuted }}>{label}</div>
          {sub && <div className="mt-1 text-xs" style={{ color: C.textMuted }}>{sub}</div>}
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================================
// STATS ROW
// ============================================================
function StatsRow({ stats }: { stats: DashboardData['stats'] }) {
  const expiryLabel = stats.subscriptionExpiresAt ? format(parseISO(stats.subscriptionExpiresAt), 'MMM d, yyyy') : null
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard index={0} icon={Crown} label="Subscription"
        value={stats.hasActiveSubscription ? <span className="block text-sm font-bold leading-snug">{stats.subscriptionPlanName ?? 'Active'}</span> : 'No plan'}
        sub={stats.hasActiveSubscription ? (expiryLabel ? `Until ${expiryLabel}` : 'Unlimited classes') : 'Subscribe to unlock'}
        accent="blue"
      />
      <StatCard index={1} icon={BookOpen} label="Lessons Done" value={stats.completedLessons}
        sub={`${stats.completedBookings}/${stats.totalBookings} classes`} accent="blue"
      />
      <StatCard index={2} icon={Moon} label="Surahs Memorized" value={stats.memorizedSurahs}
        sub="with revision" accent="teal"
      />
      <StatCard index={3} icon={TrendingUp} label="Completion Rate" value={`${stats.completionRate}%`}
        sub={`${stats.completedBookings} of ${stats.totalBookings} classes`} accent="teal"
      />
    </div>
  )
}

// ============================================================
// SECTION HEADER
// ============================================================
function SectionHeader({ eyebrow, title, icon: Icon }: { eyebrow: string; title: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${C.islamicBlue}12`, color: C.islamicBlue }}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.islamicBlue }}>{eyebrow}</div>
        <h3 className="text-base font-bold leading-tight" style={{ color: C.textDark }}>{title}</h3>
      </div>
    </div>
  )
}

// ============================================================
// LESSON PROGRESS TRACKER
// ============================================================
function LessonProgressTracker({ progress }: { progress: ProgressItem[] }) {
  const grouped = React.useMemo(() => {
    const map = new Map<string, ProgressItem[]>()
    for (const p of progress) {
      const key = p.subject || 'General'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    }
    return Array.from(map.entries()).map(([subject, items]) => ({
      subject, items,
      avg: Math.round(items.reduce((s, i) => s + (i.progressPct || 0), 0) / items.length),
    }))
  }, [progress])

  return (
    <Card className="p-5 sm:p-6" style={{ borderColor: C.border }}>
      <SectionHeader eyebrow="Keep growing" title="My Progress" icon={Sparkles} />
      {grouped.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed p-8 text-center" style={{ borderColor: `${C.border}`, backgroundColor: `${C.lightGray}` }}>
          <p className="text-sm" style={{ color: C.textMuted }}>No lessons tracked yet. Once you complete your first class, your progress will appear here.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {grouped.map((g) => {
            const Icon = subjectIcon(g.subject)
            return (
              <div key={g.subject} className="rounded-xl p-4" style={{ border: `1px solid ${C.border}`, background: '#fff' }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${C.teal}12`, color: C.teal }}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: C.textDark }}>{g.subject}</div>
                      <div className="text-xs" style={{ color: C.textMuted }}>{g.items.length} lesson{g.items.length !== 1 ? 's' : ''} · {g.avg}% avg</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold" style={{ color: C.teal }}>{g.avg}%</span>
                </div>
                <Progress value={g.avg} className="mt-3 h-1.5" />
                <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto scrollbar-quran pr-1">
                  {g.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50">
                      <div className="flex min-w-0 items-center gap-2">
                        {item.completed
                          ? <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: C.teal }} />
                          : <div className="h-4 w-4 shrink-0 rounded-full border-2" style={{ borderColor: `${C.islamicBlue}50` }} />
                        }
                        <div className="min-w-0">
                          <div className="truncate" style={{ color: C.textDark }}>{item.lessonTitle}</div>
                          {item.surahName && <div className="truncate text-xs" style={{ color: C.textMuted }}>{item.surahName}</div>}
                        </div>
                      </div>
                      <span className={cn('shrink-0 text-xs font-semibold')} style={{ color: item.completed ? C.teal : C.islamicBlue }}>
                        {item.completed ? <span className="inline-flex items-center gap-1"><Check className="h-3 w-3" /> Done</span> : `${item.progressPct}%`}
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
// CURRENT PLAN CARD
// ============================================================
function CurrentPlan({ subscription }: { subscription: Subscription | null }) {
  const setView = useAppStore((s) => s.setView)
  if (!subscription) {
    return (
      <Card className="overflow-hidden border-0 p-0">
        <div className="relative p-6 text-white" style={{ background: `linear-gradient(135deg, ${C.deepNavy}, ${C.islamicBlue})` }}>
          <div className="pattern-stars absolute inset-0 opacity-25" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5" style={{ color: C.gold }} />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">No active plan</span>
            </div>
            <h3 className="mt-2 text-lg font-bold">Start your Quran journey today</h3>
            <p className="mt-1 text-sm text-white/80">Choose a subscription plan and unlock monthly classes with verified tutors.</p>
            <Button onClick={() => setView('plans')} className="mt-4 w-full bg-white hover:bg-white/90" style={{ color: C.islamicBlue }}>
              <Crown className="h-4 w-4" /> Choose a Plan
            </Button>
          </div>
        </div>
      </Card>
    )
  }
  const expires = format(parseISO(subscription.expiresAt), 'MMM d, yyyy')
  return (
    <Card className="overflow-hidden p-0" style={{ borderColor: C.border }}>
      <div className="relative p-5 text-white" style={{ background: `linear-gradient(135deg, ${C.deepNavy}, ${C.islamicBlue})` }}>
        <div className="pattern-stars absolute inset-0 opacity-20" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white/70">Current Plan</div>
            <div className="mt-1 text-xl font-bold">{subscription.plan.name}</div>
            <div className="mt-0.5 text-sm text-white/80">{subscription.plan.classesPerMonth} classes/mo · ${subscription.plan.monthlyPrice}/mo</div>
          </div>
          <Badge className="border-transparent" style={{ backgroundColor: C.teal, color: '#fff' }}>Active</Badge>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-2 rounded-lg p-2.5" style={{ border: `1px solid ${C.border}`, background: C.lightGray }}>
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 shrink-0" style={{ color: C.islamicBlue }} />
            <span style={{ color: C.textMuted }}>Renews on</span>
            <span className="font-semibold" style={{ color: C.textDark }}>{expires}</span>
          </div>
        </div>
        {subscription.plan.features?.length > 0 && (
          <ul className="space-y-1.5">
            {subscription.plan.features.slice(0, 5).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: `${C.textDark}CC` }}>
                <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.teal }} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button variant="outline" size="sm" style={{ borderColor: `${C.islamicBlue}30`, color: C.islamicBlue }} onClick={() => setView('plans')}>
            <Crown className="h-4 w-4" /> Upgrade
          </Button>
          <Button size="sm" className="text-white" style={{ backgroundColor: C.islamicBlue }} onClick={() => setView('marketplace')}>
            <Search className="h-4 w-4" /> Find Tutors
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ============================================================
// BOOKING HISTORY
// ============================================================
function BookingHistory({ bookings }: { bookings: Booking[] }) {
  const past = bookings.filter((b) => b.status === 'COMPLETED').slice(0, 8)
  return (
    <Card className="p-5 sm:p-6" style={{ borderColor: C.border }}>
      <SectionHeader eyebrow="Recently" title="Class History" icon={Clock} />
      {past.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed p-6 text-center" style={{ borderColor: C.border, background: C.lightGray }}>
          <p className="text-sm" style={{ color: C.textMuted }}>No completed classes yet.</p>
        </div>
      ) : (
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto scrollbar-quran pr-1">
          {past.map((b) => (
            <li key={b.id} className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-gray-50" style={{ border: `1px solid ${C.border}` }}>
              <Avatar name={b.tutor.name} src={b.tutor.avatar} country={b.tutor.country} size={36} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium" style={{ color: C.textDark }}>{b.tutor.name}</div>
                <div className="text-xs" style={{ color: C.textMuted }}>{format(parseISO(b.scheduledAt), 'MMM d, yyyy')} · {b.durationMins}m</div>
              </div>
              <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: C.teal }} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

// ============================================================
// LOADING SKELETON
// ============================================================
function LoadingState() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3" style={{ color: C.textMuted }}>
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading your dashboard...</span>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl" style={{ background: C.lightGray }} />)}
      </div>
    </div>
  )
}

// ============================================================
// MAIN STUDENT DASHBOARD
// Layout: Header → Live Class Hero → Stats → 2-Col (Left 70% / Right 30%)
// ============================================================
export function StudentDashboard() {
  const user = useAppStore((s) => s.user)
  const setView = useAppStore((s) => s.setView)
  const { data, isLoading, isError, error } = useStudentDashboard()

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
  const planType = getPlanType(dash.subscription)

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'DELETE' })
    useAppStore.getState().logout()
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ background: C.offWhite }}>
      <DashboardHeader userName={user.name} planType={planType} onLogout={handleLogout} />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Welcome */}
          <div className="mb-6">
            <BismillahHeader className="mb-2 justify-start" style={{ color: `${C.islamicBlue}70` }} />
            <h1 className="text-2xl font-bold" style={{ color: C.textDark }}>
              Assalamu alaikum, <span style={{ color: C.islamicBlue }}>{firstName(user.name)}</span> 🌙
            </h1>
            <p className="mt-1 text-sm" style={{ color: C.textMuted }}>
              May your journey of learning the Quran be filled with light. Here&apos;s a snapshot of your progress.
            </p>
          </div>

          {/* LIVE CLASSROOM Hero — full width */}
          <LiveClassroomHero bookings={dash.bookings} planType={planType} />

          {/* Stats */}
          <div className="mt-6">
            <StatsRow stats={dash.stats} />
          </div>

          {/* ═══ MAIN 2-COLUMN LAYOUT (70/30) ═══ */}
          <div className="mt-6 grid gap-6 lg:grid-cols-10">
            {/* LEFT COLUMN (70%) — Core Learning Area */}
            <div className="space-y-6 lg:col-span-7">
              {/* Dynamic Plan Section — switches between Qaida & Quran */}
              <DynamicPlanSection progress={dash.progress} planType={planType} />
              {/* Lesson Progress Tracker */}
              <LessonProgressTracker progress={dash.progress} />
            </div>

            {/* RIGHT COLUMN (30%) — Schedule & Stats */}
            <div className="space-y-6 lg:col-span-3">
              {/* Quick Progress Ring */}
              <Card className="p-5" style={{ borderColor: C.border }}>
                <SectionHeader eyebrow="Progress" title="Completion" icon={Target} />
                <div className="mt-4 flex items-center justify-around">
                  <ProgressRing
                    pct={planType === 'quran' ? 20 : 45}
                    label={planType === 'quran' ? 'Quran' : 'Qaida'}
                    color={planType === 'quran' ? C.teal : C.islamicBlue}
                  />
                  {planType === 'both' && (
                    <ProgressRing pct={20} label="Quran" color={C.teal} />
                  )}
                </div>
              </Card>

              {/* Weekly Streak */}
              <WeeklyStreak stats={dash.stats} />

              {/* Upcoming Classes */}
              <UpcomingClasses bookings={dash.bookings} />

              {/* Current Plan */}
              <CurrentPlan subscription={dash.subscription} />
            </div>
          </div>

          {/* Booking History — full width at bottom */}
          <div className="mt-6">
            <BookingHistory bookings={dash.bookings} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default StudentDashboard

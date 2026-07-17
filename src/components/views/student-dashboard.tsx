'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { toast } from 'sonner'
import {
  Clock, BookOpen, Moon, Star, TrendingUp, Video, X, Check, CheckCircle2,
  ArrowRight, LogIn, Search, Sparkles, Brain, Languages, ScrollText, Crown,
  AlertCircle, CalendarDays, Loader2, ShieldAlert, LogOut, CreditCard, Calendar,
  Users, Zap, ClipboardList, FileText, Timer, Bell, ChevronRight, Flame,
  BookOpenText, Headphones, Play, Target, MessageSquare, Mic, Volume2,
  BookMarked, CircleDot, Trophy, ChevronDown, Sun, Monitor, Settings, Award,
  Home, Menu, MessageCircle, Wallet, LayoutDashboard, Headset, Lock, Unlock,
  MicOff, Send, Pause, Square,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAppStore, type ViewKey } from '@/lib/store'
import { useStudentDashboard, useUpdateBooking, useBookings } from '@/lib/queries'
import { SUBJECTS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar } from '@/components/shared/avatar'
import { BismillahHeader, StarMedallion, IslamicPatternBand } from '@/components/brand/patterns'
import { QtuorLogoLockup } from '@/components/brand/logo'

// ─── Brand Color Tokens (Deep Islamic Blue theme — NO green hovers) ───
const C = {
  islamicBlue: '#0F4C81',
  deepNavy: '#0A2F4F',
  brightBlue: '#1E6CB5',
  teal: '#10B981',
  tealDark: '#0E9F6E',
  tealLight: '#D1FAE5',
  gold: '#D4AF37',
  goldLight: '#FEF3C7',
  offWhite: '#F8FAFC',
  lightGray: '#F1F5F9',
  border: '#E2E8F0',
  textDark: '#0F172A',
  textMuted: '#64748B',
  red: '#EF4444',
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

function getPlanType(sub: Subscription | null, storePlan: string): 'qaida' | 'quran' | 'both' {
  if (storePlan === 'qaida') return 'qaida'
  if (storePlan === 'quran') return 'quran'
  if (!sub) return 'both'
  const cat = sub.plan.category
  if (cat === 'Noorani Qaida') return 'qaida'
  if (cat === 'Quran Recitation With Tajweed' || cat === 'Hifz') return 'quran'
  return 'both'
}

// ─── Motion variants ──────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: Math.min(i * 0.05, 0.4), duration: 0.45, ease: 'easeOut' as const },
  }),
}

// ─── Noorani Qaida Lesson Map ─────────────────────────────────────────
const QAIDA_LESSONS = [
  { id: 1, title: 'Arabic Alphabet', icon: 'ا' },
  { id: 2, title: 'Joined Letters', icon: 'بـ' },
  { id: 3, title: 'Harakat', icon: 'بَ' },
  { id: 4, title: 'Tanween', icon: 'بً' },
  { id: 5, title: 'Haroof Maddah', icon: 'آ' },
  { id: 6, title: 'Sukoon', icon: 'بْ' },
  { id: 7, title: 'Shaddah', icon: 'بّ' },
  { id: 8, title: 'Madd', icon: 'با' },
  { id: 9, title: 'Waqf', icon: '۩' },
  { id: 10, title: 'Recitation Practice', icon: '📖' },
]

// ─── Quran Tabs for Mushaf-style tracker ──────────────────────────────
const QURAN_TABS = [
  { key: 'sabaq', label: 'Sabaq (New)', icon: Sparkles },
  { key: 'sabqi', label: 'Sabqi (Revision)', icon: BookMarked },
  { key: 'manzil', label: 'Manzil (Old)', icon: ScrollText },
] as const
type QuranTab = typeof QURAN_TABS[number]['key']

// ─── Sidebar Nav Items ────────────────────────────────────────────────
const SIDEBAR_NAV = [
  { key: 'overview', label: 'Dashboard Overview', icon: Home },
  { key: 'find-tutor', label: 'Find a Qari / Book Class', icon: Search },
  { key: 'classroom', label: 'My Classroom (Live)', icon: Monitor },
  { key: 'schedule', label: 'Schedule & Reschedule', icon: Calendar },
  { key: 'messages', label: 'Messages (Teacher Chat)', icon: MessageCircle },
  { key: 'credits', label: 'Credits & Billing', icon: Wallet },
] as const
type SidebarKey = typeof SIDEBAR_NAV[number]['key']

// ============================================================
// AUTH GATE
// ============================================================
function AuthGate() {
  const openAuth = useAppStore((s) => s.openAuth)
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4 py-12">
      <Card className="w-full overflow-hidden border-0 p-0 shadow-lg">
        <div className="relative h-28" style={{ background: `linear-gradient(135deg, ${C.deepNavy}, ${C.islamicBlue})` }}>
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

// ============================================================
// SIDEBAR COMPONENT (declared outside render to avoid state reset)
// ============================================================
function StudentSidebar({
  activeNav,
  onNavClick,
  userName,
  userEmail,
  userAvatar,
  onLogout,
}: {
  activeNav: SidebarKey
  onNavClick: (key: SidebarKey) => void
  userName: string
  userEmail: string
  userAvatar?: string | null
  onLogout: () => void
}) {
  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: C.deepNavy }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: C.islamicBlue }}>
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">Qtuor</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {SIDEBAR_NAV.map((item) => {
          const Icon = item.icon
          const isActive = activeNav === item.key
          return (
            <button
              key={item.key}
              onClick={() => onNavClick(item.key)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              )}
              style={isActive ? { backgroundColor: C.islamicBlue } : undefined}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* User profile at bottom */}
      <div className="border-t px-4 py-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <Avatar name={userName} src={userAvatar} size={36} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN STUDENT DASHBOARD
// ============================================================
export function StudentDashboard() {
  const user = useAppStore((s) => s.user)
  const storePlanType = useAppStore((s) => s.planType)
  const setView = useAppStore((s) => s.setView)
  const setActiveBookingId = useAppStore((s) => s.setActiveBookingId)
  const logout = useAppStore((s) => s.logout)
  const setPlanType = useAppStore((s) => s.setPlanType)

  const { data, isLoading } = useStudentDashboard()
  const updateBooking = useUpdateBooking()

  // Sidebar state
  const [activeNav, setActiveNav] = React.useState<SidebarKey>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // Quran tab state
  const [quranTab, setQuranTab] = React.useState<QuranTab>('sabaq')

  // Recording state
  const [isRecording, setIsRecording] = React.useState(false)

  if (!user) return <AuthGate />

  const dashboard = data as DashboardData | undefined
  const planType = getPlanType(dashboard?.subscription ?? null, storePlanType)
  const bookings = dashboard?.bookings ?? []
  const progress = dashboard?.progress ?? []
  const stats = dashboard?.stats
  const subscription = dashboard?.subscription

  // Compute class credits remaining
  const classesUsed = stats?.completedBookings ?? 0
  const classesPerMonth = subscription?.plan.classesPerMonth ?? 12
  const classesLeft = Math.max(0, classesPerMonth - classesUsed)

  // Next upcoming booking
  const upcoming = bookings
    .filter((b) => b.status === 'SCHEDULED' && new Date(b.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0]

  // Completed Qaida lesson IDs
  const completedQaidaLessons = progress
    .filter((p) => p.subject === 'Noorani Qaida' && p.completed)
    .map((p) => {
      const match = p.lessonTitle.match(/Lesson (\d+)/)
      return match ? parseInt(match[1]) : 0
    })

  // Current Qaida lesson
  const currentQaidaLesson = progress
    .filter((p) => p.subject === 'Noorani Qaida' && !p.completed)
    .sort((a, b) => a.progressPct - b.progressPct)[0]

  // Quran progress data
  const quranProgress = progress.filter((p) =>
    p.subject === 'Quran Recitation With Tajweed' || p.subject === 'Hifz'
  )

  // Sabaq items (new memorization)
  const sabaqItems = quranProgress.filter((p) => !p.completed && p.progressPct < 60)
  // Sabqi items (recent revision)
  const sabqiItems = quranProgress.filter((p) => !p.completed && p.progressPct >= 60)
  // Manzil items (old review)
  const manzilItems = quranProgress.filter((p) => p.completed)

  // Teacher's last feedback
  const lastFeedback = progress
    .filter((p) => p.notes)
    .sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime())[0]

  // ─── Navigation handler ────────────────────────────────────────
  const handleNavClick = (key: SidebarKey) => {
    setActiveNav(key)
    setMobileMenuOpen(false)
    if (key === 'classroom') {
      setView('classroom')
    } else if (key === 'find-tutor') {
      setView('marketplace')
    }
  }

  // ─── Enter classroom ───────────────────────────────────────────
  const enterClassroom = (booking: Booking) => {
    setActiveBookingId(booking.id)
    setView('classroom')
  }

  // ─── Booking actions ───────────────────────────────────────────
  const handleCancelBooking = async (bookingId: string) => {
    try {
      await updateBooking.mutateAsync({ id: bookingId, status: 'CANCELLED' })
      toast.success('Class cancelled')
    } catch {
      toast.error('Failed to cancel')
    }
  }



  // ─── MAIN RENDER ───────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: C.offWhite }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col">
        <StudentSidebar
          activeNav={activeNav}
          onNavClick={handleNavClick}
          userName={user.name}
          userEmail={user.email}
          userAvatar={user.avatar}
          onLogout={logout}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              <StudentSidebar
          activeNav={activeNav}
          onNavClick={handleNavClick}
          userName={user.name}
          userEmail={user.email}
          userAvatar={user.avatar}
          onLogout={logout}
        />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar (mobile) */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden border-b"
          style={{ backgroundColor: 'white', borderColor: C.border }}>
          <button onClick={() => setMobileMenuOpen(true)} className="rounded-lg p-2 hover:bg-gray-100">
            <Menu className="h-5 w-5" style={{ color: C.textDark }} />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" style={{ color: C.islamicBlue }} />
            <span className="font-bold" style={{ color: C.islamicBlue }}>Qtuor</span>
          </div>
          <Avatar name={user.name} src={user.avatar} size={32} />
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: C.islamicBlue }} />
            </div>
          ) : (
            <>
              {/* ═══════════════════════════════════════════════════════
                  ROW 1: Welcome & Wallet + Find Active Tutors
                  ═══════════════════════════════════════════════════════ */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Greeting */}
                <Card className="border-0 shadow-sm" style={{ backgroundColor: 'white' }}>
                  <CardContent className="p-5">
                    <p className="text-sm font-medium" style={{ color: C.textMuted }}>Assalamu Alaikum,</p>
                    <h1 className="mt-1 text-2xl font-bold" style={{ color: C.islamicBlue }}>{user.name}</h1>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge
                        className="text-white border-0"
                        style={{ backgroundColor: planType === 'qaida' ? C.islamicBlue : planType === 'quran' ? C.brightBlue : C.gold }}
                      >
                        {planType === 'qaida' ? 'Noorani Qaida Plan' : planType === 'quran' ? 'Quran & Tajweed Plan' : 'Full Access Plan'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Credit Wallet */}
                <Card className="border-0 shadow-sm" style={{ backgroundColor: 'white' }}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium" style={{ color: C.textMuted }}>Classes Left</p>
                        <p className="text-3xl font-bold" style={{ color: C.islamicBlue }}>{classesLeft}</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${C.islamicBlue}15` }}>
                        <CreditCard className="h-6 w-6" style={{ color: C.islamicBlue }} />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: C.textMuted }}>
                      <span>Active Plan: {subscription?.plan.name || 'No active plan'}</span>
                    </div>
                    <Progress
                      value={classesPerMonth > 0 ? (classesLeft / classesPerMonth) * 100 : 0}
                      className="mt-3 h-1.5"
                    />
                  </CardContent>
                </Card>

                {/* Find Active Tutors Now */}
                <Card className="border-0 shadow-sm sm:col-span-2 lg:col-span-1"
                  style={{ background: `linear-gradient(135deg, ${C.islamicBlue}, ${C.deepNavy})` }}>
                  <CardContent className="flex flex-col items-center justify-center p-5 text-center">
                    <Headset className="h-8 w-8 text-white/80 mb-2" />
                    <h3 className="text-lg font-bold text-white">Find Active Tutors Now</h3>
                    <p className="mt-1 text-sm text-white/70">Connect with available teachers for an instant class</p>
                    <Button
                      className="mt-4 w-full text-sm font-semibold text-white border-0 hover:opacity-90"
                      style={{ backgroundColor: C.brightBlue }}
                      onClick={() => setView('marketplace')}
                    >
                      <Search className="h-4 w-4 mr-1.5" />
                      Browse Qaris
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ═══════════════════════════════════════════════════════
                  ROW 2: Dynamic Learning Panel — Plan-based switching
                  ═══════════════════════════════════════════════════════ */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
                <Card className="border-0 shadow-sm overflow-hidden" style={{ backgroundColor: 'white' }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg" style={{ color: C.islamicBlue }}>
                        {planType === 'qaida' ? 'Qaida Learning Grid' : planType === 'quran' ? 'Quran Progress' : 'My Learning'}
                      </CardTitle>
                      {planType === 'both' && (
                        <div className="flex gap-1 rounded-lg p-1" style={{ backgroundColor: C.lightGray }}>
                          <button
                            onClick={() => setPlanType('qaida')}
                            className={cn(
                              'rounded-md px-3 py-1 text-xs font-medium transition-all',
                              storePlanType === 'qaida' ? 'text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            )}
                            style={storePlanType === 'qaida' ? { backgroundColor: C.islamicBlue } : undefined}
                          >
                            Noorani Qaida
                          </button>
                          <button
                            onClick={() => setPlanType('quran')}
                            className={cn(
                              'rounded-md px-3 py-1 text-xs font-medium transition-all',
                              storePlanType === 'quran' ? 'text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            )}
                            style={storePlanType === 'quran' ? { backgroundColor: C.islamicBlue } : undefined}
                          >
                            Quran
                          </button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* ─── QAIDA VIEW ─── */}
                    {(planType === 'qaida' || (planType === 'both' && storePlanType === 'qaida')) && (
                      <div className="space-y-4">
                        {/* Current lesson highlight */}
                        {currentQaidaLesson && (
                          <div className="rounded-xl p-4 border-2" style={{ borderColor: C.islamicBlue, backgroundColor: `${C.islamicBlue}08` }}>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold"
                                style={{ backgroundColor: C.islamicBlue }}>
                                {QAIDA_LESSONS.find(l => l.title === currentQaidaLesson.lessonTitle.replace(/Lesson \d+: /, ''))?.icon || '📖'}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-medium" style={{ color: C.textMuted }}>Currently Learning</p>
                                <p className="text-sm font-bold" style={{ color: C.islamicBlue }}>{currentQaidaLesson.lessonTitle}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold" style={{ color: C.islamicBlue }}>{currentQaidaLesson.progressPct}%</p>
                              </div>
                            </div>
                            <Progress value={currentQaidaLesson.progressPct} className="mt-3 h-2" />
                          </div>
                        )}

                        {/* Lesson grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                          {QAIDA_LESSONS.map((lesson) => {
                            const isCompleted = completedQaidaLessons.includes(lesson.id)
                            const isCurrent = currentQaidaLesson?.lessonTitle.includes(`Lesson ${lesson.id}`)
                            const isLocked = !isCompleted && !isCurrent && lesson.id > (currentQaidaLesson
                              ? parseInt(currentQaidaLesson.lessonTitle.match(/Lesson (\d+)/)?.[1] || '1')
                              : completedQaidaLessons.length + 1)

                            return (
                              <motion.button
                                key={lesson.id}
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                custom={lesson.id}
                                disabled={isLocked}
                                className={cn(
                                  'relative flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all',
                                  isCurrent ? 'ring-2 shadow-md' : isCompleted ? 'shadow-sm' : isLocked ? 'opacity-50' : 'shadow-sm hover:shadow-md'
                                )}
                                style={{
                                  backgroundColor: isCurrent ? `${C.islamicBlue}12` : isCompleted ? `${C.islamicBlue}08` : C.lightGray,
                                  ringColor: isCurrent ? C.islamicBlue : undefined,
                                  cursor: isLocked ? 'not-allowed' : 'pointer',
                                }}
                              >
                                <span className="text-2xl">{lesson.icon}</span>
                                <span className={cn(
                                  'text-xs font-medium',
                                  isCurrent ? '' : isCompleted ? '' : 'text-slate-500'
                                )} style={{ color: isCurrent ? C.islamicBlue : isCompleted ? C.teal : undefined }}>
                                  L{lesson.id}
                                </span>
                                <span className="text-[10px] leading-tight" style={{ color: C.textMuted }}>
                                  {lesson.title}
                                </span>
                                {isCompleted && (
                                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-white"
                                    style={{ backgroundColor: C.islamicBlue }}>
                                    <Check className="h-3 w-3" />
                                  </div>
                                )}
                                {isCurrent && (
                                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-white"
                                    style={{ backgroundColor: C.brightBlue }}>
                                    <Play className="h-3 w-3" />
                                  </div>
                                )}
                                {isLocked && <Lock className="absolute top-1.5 right-1.5 h-3 w-3 text-slate-400" />}
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* ─── QURAN VIEW ─── */}
                    {(planType === 'quran' || (planType === 'both' && storePlanType === 'quran')) && (
                      <div className="space-y-4">
                        {/* Quran tabs: Sabaq / Sabqi / Manzil */}
                        <div className="flex gap-1 rounded-xl p-1" style={{ backgroundColor: C.lightGray }}>
                          {QURAN_TABS.map((tab) => {
                            const Icon = tab.icon
                            const isActive = quranTab === tab.key
                            return (
                              <button
                                key={tab.key}
                                onClick={() => setQuranTab(tab.key)}
                                className={cn(
                                  'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                                  isActive ? 'text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                )}
                                style={isActive ? { backgroundColor: C.islamicBlue } : undefined}
                              >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                              </button>
                            )
                          })}
                        </div>

                        {/* Tab content */}
                        <div className="space-y-3">
                          {quranTab === 'sabaq' && (
                            sabaqItems.length > 0 ? sabaqItems.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 rounded-xl p-4 border"
                                style={{ borderColor: C.border, backgroundColor: `${C.islamicBlue}05` }}>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg"
                                  style={{ backgroundColor: `${C.islamicBlue}15` }}>
                                  <Sparkles className="h-5 w-5" style={{ color: C.islamicBlue }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold" style={{ color: C.textDark }}>{item.lessonTitle}</p>
                                  {item.surahName && (
                                    <p className="text-xs" style={{ color: C.textMuted }}>Surah {item.surahName}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold" style={{ color: C.islamicBlue }}>{item.progressPct}%</p>
                                  <Progress value={item.progressPct} className="mt-1 h-1.5 w-20" />
                                </div>
                              </div>
                            )) : (
                              <div className="py-8 text-center">
                                <BookOpen className="h-10 w-10 mx-auto mb-2" style={{ color: C.border }} />
                                <p className="text-sm" style={{ color: C.textMuted }}>No new sabaq assigned yet</p>
                              </div>
                            )
                          )}

                          {quranTab === 'sabqi' && (
                            sabqiItems.length > 0 ? sabqiItems.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 rounded-xl p-4 border"
                                style={{ borderColor: C.border, backgroundColor: `${C.brightBlue}08` }}>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg"
                                  style={{ backgroundColor: `${C.brightBlue}15` }}>
                                  <BookMarked className="h-5 w-5" style={{ color: C.brightBlue }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold" style={{ color: C.textDark }}>{item.lessonTitle}</p>
                                  {item.surahName && (
                                    <p className="text-xs" style={{ color: C.textMuted }}>Surah {item.surahName}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold" style={{ color: C.brightBlue }}>{item.progressPct}%</p>
                                  <Progress value={item.progressPct} className="mt-1 h-1.5 w-20" />
                                </div>
                              </div>
                            )) : (
                              <div className="py-8 text-center">
                                <BookMarked className="h-10 w-10 mx-auto mb-2" style={{ color: C.border }} />
                                <p className="text-sm" style={{ color: C.textMuted }}>No revision items</p>
                              </div>
                            )
                          )}

                          {quranTab === 'manzil' && (
                            manzilItems.length > 0 ? manzilItems.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 rounded-xl p-4 border"
                                style={{ borderColor: C.border }}>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg"
                                  style={{ backgroundColor: `${C.teal}15` }}>
                                  <CheckCircle2 className="h-5 w-5" style={{ color: C.teal }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold" style={{ color: C.textDark }}>{item.lessonTitle}</p>
                                  {item.surahName && (
                                    <p className="text-xs" style={{ color: C.textMuted }}>Surah {item.surahName}</p>
                                  )}
                                </div>
                                <Badge className="text-white border-0" style={{ backgroundColor: C.islamicBlue }}>
                                  Completed
                                </Badge>
                              </div>
                            )) : (
                              <div className="py-8 text-center">
                                <CheckCircle2 className="h-10 w-10 mx-auto mb-2" style={{ color: C.border }} />
                                <p className="text-sm" style={{ color: C.textMuted }}>No completed manzil yet</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* ═══════════════════════════════════════════════════════
                  ROW 3: Quick Tools & Feedback (50/50 split)
                  ═══════════════════════════════════════════════════════ */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}
                className="grid gap-4 sm:grid-cols-2">
                {/* Left: Teacher's Last Note */}
                <Card className="border-0 shadow-sm" style={{ backgroundColor: 'white' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2" style={{ color: C.islamicBlue }}>
                      <MessageSquare className="h-4 w-4" />
                      Teacher&apos;s Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lastFeedback ? (
                      <div className="space-y-3">
                        <div className="rounded-lg p-3" style={{ backgroundColor: C.lightGray }}>
                          <p className="text-sm" style={{ color: C.textDark }}>
                            {lastFeedback.notes}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs" style={{ color: C.textMuted }}>
                          <span>Subject: {lastFeedback.subject}</span>
                          <span>•</span>
                          <span>{lastFeedback.lessonTitle}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2" style={{ color: C.border }} />
                        <p className="text-sm" style={{ color: C.textMuted }}>No feedback from teacher yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Right: Recording Studio */}
                <Card className="border-0 shadow-sm" style={{ backgroundColor: 'white' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2" style={{ color: C.islamicBlue }}>
                      <Mic className="h-4 w-4" />
                      Practice Recording
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm" style={{ color: C.textMuted }}>
                        Record your sabaq and send it to your teacher for feedback.
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsRecording(!isRecording)}
                          className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-full transition-all',
                            isRecording ? 'animate-pulse' : 'hover:scale-105'
                          )}
                          style={{ backgroundColor: isRecording ? C.red : C.islamicBlue }}
                        >
                          {isRecording ? <Square className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5 text-white" />}
                        </button>
                        <div className="flex-1">
                          {isRecording ? (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: C.red }} />
                              <span className="text-sm font-medium" style={{ color: C.red }}>Recording...</span>
                            </div>
                          ) : (
                            <span className="text-sm" style={{ color: C.textMuted }}>Tap to start recording</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5"
                        style={{ borderColor: C.islamicBlue, color: C.islamicBlue }}
                        disabled={!isRecording}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Send to Teacher
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ═══════════════════════════════════════════════════════
                  ROW 4: Upcoming Classes Schedule
                  ═══════════════════════════════════════════════════════ */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
                <Card className="border-0 shadow-sm" style={{ backgroundColor: 'white' }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2" style={{ color: C.islamicBlue }}>
                        <Calendar className="h-5 w-5" />
                        Upcoming Classes
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        style={{ borderColor: C.islamicBlue, color: C.islamicBlue }}
                        onClick={() => setView('marketplace')}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Book Class
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {bookings.filter(b => b.status === 'SCHEDULED').length === 0 ? (
                      <div className="py-8 text-center">
                        <Calendar className="h-10 w-10 mx-auto mb-2" style={{ color: C.border }} />
                        <p className="text-sm" style={{ color: C.textMuted }}>No upcoming classes</p>
                        <Button
                          className="mt-3 text-white hover:opacity-90"
                          style={{ backgroundColor: C.islamicBlue }}
                          onClick={() => setView('marketplace')}
                        >
                          <Search className="h-4 w-4 mr-1.5" />
                          Find a Qari
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bookings
                          .filter(b => b.status === 'SCHEDULED' && new Date(b.scheduledAt) > new Date())
                          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                          .slice(0, 5)
                          .map((booking) => {
                            const { day, time } = formatClassDate(booking.scheduledAt)
                            const isImminent = new Date(booking.scheduledAt).getTime() - Date.now() < 30 * 60 * 1000
                            return (
                              <div key={booking.id} className="flex items-center gap-4 rounded-xl p-4 border transition-all hover:shadow-sm"
                                style={{ borderColor: C.border }}>
                                <div className="text-center min-w-[56px]">
                                  <p className="text-xs font-medium" style={{ color: C.textMuted }}>{day}</p>
                                  <p className="text-sm font-bold" style={{ color: C.islamicBlue }}>{time}</p>
                                </div>
                                <div className="h-8 w-px" style={{ backgroundColor: C.border }} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate" style={{ color: C.textDark }}>
                                    {booking.topic || 'Quran Class'}
                                  </p>
                                  <p className="text-xs" style={{ color: C.textMuted }}>
                                    with {booking.tutor.name} • {booking.durationMins} min
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isImminent && (
                                    <Button
                                      className="text-white hover:opacity-90"
                                      size="sm"
                                      style={{ backgroundColor: C.islamicBlue }}
                                      onClick={() => enterClassroom(booking)}
                                    >
                                      <Video className="h-3.5 w-3.5 mr-1" />
                                      Join
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleCancelBooking(booking.id)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* ═══════════════════════════════════════════════════════
                  ROW 5: Stats Overview
                  ═══════════════════════════════════════════════════════ */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
                className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: CheckCircle2, label: 'Lessons Done', value: stats?.completedLessons ?? 0, color: C.islamicBlue },
                  { icon: BookOpen, label: 'Surahs Memorized', value: stats?.memorizedSurahs ?? 0, color: C.brightBlue },
                  { icon: CalendarDays, label: 'Total Classes', value: stats?.totalBookings ?? 0, color: C.gold },
                  { icon: Trophy, label: 'Completion Rate', value: `${stats?.completionRate ?? 0}%`, color: C.islamicBlue },
                ].map((stat) => {
                  const Icon = stat.icon
                  return (
                    <Card key={stat.label} className="border-0 shadow-sm" style={{ backgroundColor: 'white' }}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${stat.color}15` }}>
                            <Icon className="h-4.5 w-4.5" style={{ color: stat.color }} />
                          </div>
                          <div>
                            <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                            <p className="text-xs" style={{ color: C.textMuted }}>{stat.label}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

// ─── Plus icon component (small helper) ─────────────────────────────
function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

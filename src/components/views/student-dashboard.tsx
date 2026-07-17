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
  MicOff, Send, Pause, Square, BellRing, Bookmark, RotateCcw, FastForward,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAppStore, type ViewKey } from '@/lib/store'
import { useStudentDashboard, useUpdateBooking, useBookings, useMyBookmark } from '@/lib/queries'
import { SUBJECTS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar } from '@/components/shared/avatar'
import { BismillahHeader, StarMedallion, IslamicPatternBand } from '@/components/brand/patterns'
import { QtuorLogo, QtuorLogoLockup } from '@/components/brand/logo'

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
  { key: 'overview', label: 'Dashboard', icon: Home },
  { key: 'find-tutor', label: 'Find Qari', icon: Search },
  { key: 'classroom', label: 'My Classroom', icon: Monitor },
  { key: 'schedule', label: 'Schedule', icon: Calendar },
  { key: 'messages', label: 'Messages', icon: MessageCircle },
  { key: 'credits', label: 'Credits & Billing', icon: Wallet },
  { key: 'settings', label: 'Settings', icon: Settings },
] as const
type SidebarKey = typeof SIDEBAR_NAV[number]['key']

// ─── Weekly streak data ───────────────────────────────────────────────
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ============================================================
// AUTH GATE
// ============================================================
function AuthGate() {
  const openAuth = useAppStore((s) => s.openAuth)
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4 py-12">
      <Card className="w-full overflow-hidden border-0 shadow-lg" style={{ borderRadius: 20 }}>
        <div className="relative h-32" style={{ background: `linear-gradient(135deg, ${C.deepNavy}, ${C.islamicBlue})` }}>
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
            style={{ backgroundColor: C.islamicBlue, borderRadius: 12 }}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Log in / Sign up
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// TOP BAR (Full width — always visible)
// ============================================================
function TopBar({
  userName,
  planType,
  onLogout,
}: {
  userName: string
  planType: 'qaida' | 'quran' | 'both'
  onLogout: () => void
}) {
  const setView = useAppStore((s) => s.setView)
  const planLabel = planType === 'qaida' ? 'Qaida' : planType === 'quran' ? 'Quran' : 'Full Access'
  const planColor = planType === 'qaida' ? C.islamicBlue : planType === 'quran' ? C.brightBlue : C.gold

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 h-16 border-b"
      style={{ backgroundColor: 'white', borderColor: C.border }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <QtuorLogo className="h-8" />
      </div>

      {/* Search bar (desktop) */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: C.textMuted }} />
          <input
            type="text"
            placeholder="Search Tutors..."
            className="w-full rounded-xl border py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: C.border, borderRadius: 12, focusRingColor: C.islamicBlue }}
            onFocus={() => setView('marketplace')}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="relative rounded-xl p-2 transition-colors hover:bg-gray-100" style={{ borderRadius: 12 }}>
          <Bell className="h-5 w-5" style={{ color: C.textMuted }} />
          <div className="absolute top-1 right-1 h-2 w-2 rounded-full" style={{ backgroundColor: C.red }} />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: C.border }}>
          <Avatar name={userName} size={32} />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight" style={{ color: C.textDark }}>{userName}</p>
            <Badge className="text-[10px] text-white border-0 px-1.5 py-0" style={{ backgroundColor: planColor }}>
              {planLabel}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  )
}

// ============================================================
// SIDEBAR (Desktop — Left column)
// ============================================================
function StudentSidebar({
  activeNav,
  onNavClick,
  userName,
  userEmail,
  userAvatar,
  onLogout,
  planType,
}: {
  activeNav: SidebarKey
  onNavClick: (key: SidebarKey) => void
  userName: string
  userEmail: string
  userAvatar?: string | null
  onLogout: () => void
  planType: 'qaida' | 'quran' | 'both'
}) {
  const planLabel = planType === 'qaida' ? 'Noorani Qaida' : planType === 'quran' ? 'Quran & Tajweed' : 'Full Access'
  const planColor = planType === 'qaida' ? C.islamicBlue : planType === 'quran' ? C.brightBlue : C.gold

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: C.deepNavy }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <QtuorLogo className="h-8" onDark />
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
                'flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              )}
              style={isActive ? { backgroundColor: C.islamicBlue, borderRadius: 12 } : { borderRadius: 12 }}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Plan badge */}
      <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="rounded-xl px-3 py-2.5 text-center" style={{ backgroundColor: `${planColor}20` }}>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Active Plan</p>
          <p className="text-sm font-bold text-white mt-0.5">{planLabel}</p>
        </div>
      </div>

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
  const { data: bookmarkData } = useMyBookmark()
  const updateBooking = useUpdateBooking()

  // Sidebar state
  const [activeNav, setActiveNav] = React.useState<SidebarKey>('overview')

  // Quran tab state
  const [quranTab, setQuranTab] = React.useState<QuranTab>('sabaq')

  // Recording state
  const [isRecording, setIsRecording] = React.useState(false)

  // Mobile sidebar
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  if (!user) return <AuthGate />

  const dashboard = data as DashboardData | undefined
  const planType = getPlanType(dashboard?.subscription ?? null, storePlanType)
  const bookings = dashboard?.bookings ?? []
  const progress = dashboard?.progress ?? []
  const stats = dashboard?.stats
  const subscription = dashboard?.subscription

  // ─── Bookmark / Resume data ──────────────────────────────────
  const bookmark = bookmarkData?.bookmark as {
    id?: string
    bookType?: string
    pageLabel?: string
    lastLineIndex?: number
    surahName?: string | null
    lastAyah?: number | null
    revisionRange?: string | null
    status?: string
  } | null
  const hasResumePoint = !!bookmark?.pageLabel

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
    .filter((p) => (p as any).notes)
    .sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime())[0]

  // Weekly streak — simulated based on completed lessons
  const streakDays = [true, true, true, false, false, false, false] // Mon-Thu done
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

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

  // ─── Start instant class ───────────────────────────────────────
  const startInstantClass = () => {
    setView('marketplace')
  }

  // ─── MAIN RENDER ───────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col" style={{ backgroundColor: C.offWhite }}>
      {/* ═══ TOP BAR ═══ */}
      <TopBar userName={user.name} planType={planType} onLogout={logout} />

      <div className="flex flex-1 overflow-hidden">
        {/* ═══ DESKTOP SIDEBAR ═══ */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col">
          <StudentSidebar
            activeNav={activeNav}
            onNavClick={handleNavClick}
            userName={user.name}
            userEmail={user.email}
            userAvatar={user.avatar}
            onLogout={logout}
            planType={planType}
          />
        </aside>

        {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
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
                  planType={planType}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ═══ MAIN CONTENT AREA ═══ */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile header */}
          <div className="flex items-center justify-between px-4 py-2 lg:hidden border-b" style={{ borderColor: C.border }}>
            <button onClick={() => setMobileMenuOpen(true)} className="rounded-xl p-2 hover:bg-gray-100">
              <Menu className="h-5 w-5" style={{ color: C.textDark }} />
            </button>
            <Badge className="text-white border-0 text-xs" style={{ backgroundColor: planType === 'qaida' ? C.islamicBlue : planType === 'quran' ? C.brightBlue : C.gold }}>
              {planType === 'qaida' ? 'Qaida Plan' : planType === 'quran' ? 'Quran Plan' : 'Full Access'}
            </Badge>
            <Avatar name={user.name} src={user.avatar} size={32} />
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: C.islamicBlue }} />
              </div>
            ) : (
              <>
                {/* ═══════════════════════════════════════════════════════
                    ROW 1: Islamic Greeting
                    ═══════════════════════════════════════════════════════ */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                  <div className="rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${C.deepNavy}, ${C.islamicBlue})`, borderRadius: 20 }}>
                    {/* Decorative pattern */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
                    <div className="relative">
                      <p className="text-white/60 text-sm font-medium">Assalamu Alaikum</p>
                      <h1 className="mt-1 text-2xl sm:text-3xl font-bold">{firstName(user.name)}! ✨</h1>
                      <p className="mt-2 text-white/70 text-sm max-w-lg">
                        May your journey of learning the Quran be filled with light.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════════
                    ROW 1.5: RESUME LEARNING — Auto-Bookmark Card
                    ═══════════════════════════════════════════════════════ */}
                {hasResumePoint && (
                  <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.5}>
                    <Card
                      className="border-0 shadow-md cursor-pointer transition-all hover:shadow-lg overflow-hidden"
                      style={{ borderRadius: 20, background: `linear-gradient(135deg, ${C.islamicBlue}, ${C.deepNavy})` }}
                      onClick={() => {
                        // Navigate to classroom where auto-resume happens
                        if (upcoming) {
                          setActiveBookingId(upcoming.id)
                          setView('classroom')
                        } else {
                          setView('marketplace')
                        }
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-5">
                          {/* Big action icon */}
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shrink-0">
                            <RotateCcw className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Automatic Resume</p>
                            <h2 className="text-xl font-bold text-white mt-1">Resume from where you left off</h2>
                            <div className="mt-3 flex items-center gap-3 flex-wrap">
                              <Badge className="text-white border-0 gap-1" style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 }}>
                                <Bookmark className="h-3 w-3" />
                                {bookmark?.pageLabel}
                              </Badge>
                              {bookmark?.bookType === 'quran' && bookmark?.surahName && (
                                <Badge className="text-white border-0 gap-1" style={{ backgroundColor: C.brightBlue, borderRadius: 10 }}>
                                  <BookOpen className="h-3 w-3" />
                                  Next: Surah {bookmark.surahName}, Ayah {(bookmark.lastAyah ?? 0) + 1}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center gap-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                              <FastForward className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Revision Splitting Widget */}
                        {bookmark?.bookType === 'quran' && bookmark?.revisionRange && (
                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {/* Current Sabaq */}
                            <div className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16 }}>
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-white" />
                                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Current Sabaq (New)</span>
                              </div>
                              <p className="text-sm font-bold text-white">
                                {bookmark.surahName ? `Surah ${bookmark.surahName}, Ayah ${(bookmark.lastAyah ?? 0) + 1}` : bookmark.pageLabel}
                              </p>
                              <p className="text-xs text-white/50 mt-1">Starts from where you stopped</p>
                            </div>
                            {/* Sabqi (Revision) */}
                            <div className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16 }}>
                              <div className="flex items-center gap-2 mb-2">
                                <BookMarked className="h-4 w-4 text-white/70" />
                                <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Sabqi (Revision)</span>
                              </div>
                              <p className="text-sm font-semibold text-white/90">
                                {bookmark.revisionRange}
                              </p>
                              <p className="text-xs text-white/40 mt-1">Auto-loaded for today's revision</p>
                            </div>
                          </div>
                        )}

                        {bookmark?.bookType === 'qaida' && (
                          <div className="mt-5 rounded-2xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16 }}>
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="h-4 w-4 text-white" />
                              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Current Lesson</span>
                            </div>
                            <p className="text-sm font-bold text-white">{bookmark.pageLabel}</p>
                            <p className="text-xs text-white/50 mt-1">Continue from where you stopped last time</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    ROW 2: Wallet Balance + Instant Class
                    ═══════════════════════════════════════════════════════ */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}
                  className="grid gap-4 sm:grid-cols-2">
                  {/* Credit Wallet */}
                  <Card className="border-0 shadow-sm" style={{ borderRadius: 20, backgroundColor: 'white' }}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl"
                          style={{ backgroundColor: `${C.islamicBlue}12` }}>
                          <CreditCard className="h-6 w-6" style={{ color: C.islamicBlue }} />
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: C.textMuted }}>Wallet Balance</p>
                          <p className="text-2xl font-bold" style={{ color: C.islamicBlue }}>{classesLeft} Class Credits</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Progress
                          value={classesPerMonth > 0 ? (classesLeft / classesPerMonth) * 100 : 0}
                          className="h-2 flex-1"
                        />
                        <span className="text-xs font-medium" style={{ color: C.textMuted }}>
                          {classesLeft}/{classesPerMonth}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Start Instant Class */}
                  <Card className="border-0 shadow-sm cursor-pointer transition-all hover:shadow-md"
                    style={{ borderRadius: 20, background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})` }}
                    onClick={startInstantClass}>
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                        <Headset className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-bold text-white">Start Instant Class</p>
                        <p className="text-sm text-white/70">Click to start class with an available Qari</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-white/60" />
                    </CardContent>
                  </Card>
                </motion.div>

                {/* ═══════════════════════════════════════════════════════
                    ROW 3: Dynamic Learning Workspace — Plan-based switching
                    ═══════════════════════════════════════════════════════ */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
                  <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: 20, backgroundColor: 'white' }}>
                    <CardHeader className="pb-3 px-6 pt-5">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2" style={{ color: C.islamicBlue }}>
                          <BookOpen className="h-5 w-5" />
                          My Active Learning Workspace
                        </CardTitle>
                        <Badge className="text-[10px] text-white border-0" style={{ backgroundColor: C.textMuted }}>
                          Auto-detects your plan
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      {/* ─── QAIDA VIEW ─── */}
                      {(planType === 'qaida' || (planType === 'both' && storePlanType === 'qaida')) && (
                        <div className="space-y-5">
                          {planType === 'both' && (
                            <div className="flex gap-1 rounded-xl p-1" style={{ backgroundColor: C.lightGray }}>
                              <button
                                onClick={() => setPlanType('qaida')}
                                className={cn('flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all text-white shadow-sm')}
                                style={{ backgroundColor: C.islamicBlue }}
                              >
                                Noorani Qaida
                              </button>
                              <button
                                onClick={() => setPlanType('quran')}
                                className={cn('flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all text-slate-500 hover:text-slate-700')}
                              >
                                Quran
                              </button>
                            </div>
                          )}

                          {/* Current lesson highlight */}
                          {currentQaidaLesson && (
                            <div className="rounded-2xl p-5 border-2" style={{ borderColor: C.islamicBlue, backgroundColor: `${C.islamicBlue}06`, borderRadius: 16 }}>
                              <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white font-bold text-lg"
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
                                    'relative flex flex-col items-center gap-2 p-4 text-center transition-all',
                                    isCurrent ? 'ring-2 shadow-md' : isCompleted ? 'shadow-sm' : isLocked ? 'opacity-50' : 'shadow-sm hover:shadow-md'
                                  )}
                                  style={{
                                    backgroundColor: isCurrent ? `${C.islamicBlue}10` : isCompleted ? `${C.teal}08` : C.lightGray,
                                    ringColor: isCurrent ? C.islamicBlue : undefined,
                                    cursor: isLocked ? 'not-allowed' : 'pointer',
                                    borderRadius: 16,
                                  }}
                                >
                                  <span className="text-2xl">{lesson.icon}</span>
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-4 w-4" style={{ color: C.teal }} />
                                  ) : isCurrent ? (
                                    <Play className="h-4 w-4" style={{ color: C.brightBlue }} />
                                  ) : isLocked ? (
                                    <Lock className="h-4 w-4 text-slate-400" />
                                  ) : null}
                                  <span className={cn('text-[11px] font-semibold leading-tight text-center',
                                    isCurrent ? '' : isCompleted ? '' : 'text-slate-500'
                                  )} style={{ color: isCurrent ? C.islamicBlue : isCompleted ? C.teal : undefined }}>
                                    L{lesson.id}: {lesson.title}
                                  </span>
                                  {isCompleted && (
                                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-white"
                                      style={{ backgroundColor: C.teal, borderRadius: '50%' }}>
                                      <Check className="h-3 w-3" />
                                    </div>
                                  )}
                                </motion.button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* ─── QURAN VIEW ─── */}
                      {(planType === 'quran' || (planType === 'both' && storePlanType === 'quran')) && (
                        <div className="space-y-5">
                          {planType === 'both' && (
                            <div className="flex gap-1 rounded-xl p-1" style={{ backgroundColor: C.lightGray }}>
                              <button
                                onClick={() => setPlanType('qaida')}
                                className={cn('flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all text-slate-500 hover:text-slate-700')}
                              >
                                Noorani Qaida
                              </button>
                              <button
                                onClick={() => setPlanType('quran')}
                                className={cn('flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all text-white shadow-sm')}
                                style={{ backgroundColor: C.islamicBlue }}
                              >
                                Quran
                              </button>
                            </div>
                          )}

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
                                    'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
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

                          {/* Current target */}
                          {sabaqItems.length > 0 && quranTab === 'sabaq' && (
                            <div className="rounded-2xl p-4 border" style={{ borderColor: C.islamicBlue, backgroundColor: `${C.islamicBlue}05`, borderRadius: 16 }}>
                              <div className="flex items-center gap-3">
                                <Target className="h-5 w-5" style={{ color: C.islamicBlue }} />
                                <div>
                                  <p className="text-xs" style={{ color: C.textMuted }}>Current Target</p>
                                  <p className="text-sm font-bold" style={{ color: C.islamicBlue }}>
                                    {sabaqItems[0].lessonTitle}
                                    {sabaqItems[0].surahName && ` (Surah ${sabaqItems[0].surahName})`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Tab content */}
                          <div className="space-y-3">
                            {quranTab === 'sabaq' && (
                              sabaqItems.length > 0 ? sabaqItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 rounded-2xl p-4 border"
                                  style={{ borderColor: C.border, backgroundColor: `${C.islamicBlue}04`, borderRadius: 16 }}>
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                                    style={{ backgroundColor: `${C.islamicBlue}12` }}>
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
                                <div key={item.id} className="flex items-center gap-4 rounded-2xl p-4 border"
                                  style={{ borderColor: C.border, backgroundColor: `${C.brightBlue}04`, borderRadius: 16 }}>
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                                    style={{ backgroundColor: `${C.brightBlue}12` }}>
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
                                <div key={item.id} className="flex items-center gap-4 rounded-2xl p-4 border"
                                  style={{ borderColor: C.border, borderRadius: 16 }}>
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                                    style={{ backgroundColor: `${C.teal}12` }}>
                                    <CheckCircle2 className="h-5 w-5" style={{ color: C.teal }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold" style={{ color: C.textDark }}>{item.lessonTitle}</p>
                                    {item.surahName && (
                                      <p className="text-xs" style={{ color: C.textMuted }}>Surah {item.surahName}</p>
                                    )}
                                  </div>
                                  <Badge className="text-white border-0" style={{ backgroundColor: C.teal }}>
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
                    ROW 4: Weekly Streak + Recording Studio (side by side)
                    ═══════════════════════════════════════════════════════ */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
                  className="grid gap-4 sm:grid-cols-2">
                  {/* Left: Weekly Consistency Streak */}
                  <Card className="border-0 shadow-sm" style={{ borderRadius: 20, backgroundColor: 'white' }}>
                    <CardHeader className="pb-3 px-5 pt-5">
                      <CardTitle className="text-base flex items-center gap-2" style={{ color: C.islamicBlue }}>
                        <Flame className="h-4 w-4" style={{ color: '#F97316' }} />
                        Weekly Consistency Streak
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                      <div className="flex items-center justify-between gap-2">
                        {WEEK_DAYS.map((day, i) => {
                          const isDone = i <= todayIndex && streakDays[i]
                          const isToday = i === todayIndex
                          const isFuture = i > todayIndex
                          return (
                            <div key={day} className="flex flex-col items-center gap-2">
                              <div className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all',
                              )} style={{
                                backgroundColor: isDone ? C.islamicBlue : isToday ? `${C.islamicBlue}20` : isFuture ? C.lightGray : `${C.red}15`,
                                color: isDone ? 'white' : isToday ? C.islamicBlue : isFuture ? C.textMuted : C.red,
                                borderRadius: 12,
                                border: isToday ? `2px solid ${C.islamicBlue}` : 'none',
                              }}>
                                {isDone ? <Check className="h-4 w-4" /> : isToday ? <Play className="h-4 w-4" /> : null}
                              </div>
                              <span className={cn('text-[10px] font-medium', isToday ? '' : '')}
                                style={{ color: isToday ? C.islamicBlue : C.textMuted }}>
                                {day}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                      <div className="mt-4 flex items-center gap-2 rounded-xl p-3" style={{ backgroundColor: `${C.goldLight}` }}>
                        <Trophy className="h-4 w-4" style={{ color: C.gold }} />
                        <span className="text-xs font-medium" style={{ color: C.textDark }}>
                          {streakDays.filter(Boolean).length} day streak! Keep going!
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right: Recording Studio */}
                  <Card className="border-0 shadow-sm" style={{ borderRadius: 20, backgroundColor: 'white' }}>
                    <CardHeader className="pb-3 px-5 pt-5">
                      <CardTitle className="text-base flex items-center gap-2" style={{ color: C.islamicBlue }}>
                        <Mic className="h-4 w-4" />
                        Recording Studio
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                      <div className="space-y-4">
                        <p className="text-sm" style={{ color: C.textMuted }}>
                          Record your sabaq practice and send it to your teacher for feedback.
                        </p>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setIsRecording(!isRecording)}
                            className={cn(
                              'flex h-14 w-14 items-center justify-center rounded-2xl transition-all shadow-md',
                              isRecording ? 'animate-pulse' : 'hover:scale-105'
                            )}
                            style={{ backgroundColor: isRecording ? C.red : C.islamicBlue, borderRadius: 16 }}
                          >
                            {isRecording ? <Square className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6 text-white" />}
                          </button>
                          <div className="flex-1">
                            {isRecording ? (
                              <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ backgroundColor: C.red }} />
                                <span className="text-sm font-semibold" style={{ color: C.red }}>Recording...</span>
                              </div>
                            ) : (
                              <span className="text-sm" style={{ color: C.textMuted }}>Tap to record audio practice</span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1.5"
                          style={{ borderColor: C.islamicBlue, color: C.islamicBlue, borderRadius: 12 }}
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
                    ROW 5: Upcoming Classes Schedule
                    ═══════════════════════════════════════════════════════ */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
                  <Card className="border-0 shadow-sm" style={{ borderRadius: 20, backgroundColor: 'white' }}>
                    <CardHeader className="pb-3 px-6 pt-5">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2" style={{ color: C.islamicBlue }}>
                          <Calendar className="h-5 w-5" />
                          Upcoming Classes
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          style={{ borderColor: C.islamicBlue, color: C.islamicBlue, borderRadius: 12 }}
                          onClick={() => setView('marketplace')}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Book Class
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      {bookings.filter(b => b.status === 'SCHEDULED').length === 0 ? (
                        <div className="py-8 text-center">
                          <Calendar className="h-10 w-10 mx-auto mb-2" style={{ color: C.border }} />
                          <p className="text-sm" style={{ color: C.textMuted }}>No upcoming classes</p>
                          <Button
                            className="mt-3 text-white hover:opacity-90"
                            style={{ backgroundColor: C.islamicBlue, borderRadius: 12 }}
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
                                <div key={booking.id} className="flex items-center gap-4 rounded-2xl p-4 border transition-all hover:shadow-sm"
                                  style={{ borderColor: isImminent ? C.islamicBlue : C.border, backgroundColor: isImminent ? `${C.islamicBlue}04` : 'transparent', borderRadius: 16 }}>
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
                                      with {booking.tutor.name} &bull; {booking.durationMins} min
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isImminent && (
                                      <Button
                                        className="text-white hover:opacity-90"
                                        size="sm"
                                        style={{ backgroundColor: C.islamicBlue, borderRadius: 12 }}
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
                                      style={{ borderRadius: 12 }}
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
                    ROW 6: Stats Overview
                    ═══════════════════════════════════════════════════════ */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}
                  className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                  {[
                    { icon: CheckCircle2, label: 'Lessons Done', value: stats?.completedLessons ?? 0, color: C.islamicBlue },
                    { icon: BookOpen, label: 'Surahs Memorized', value: stats?.memorizedSurahs ?? 0, color: C.brightBlue },
                    { icon: CalendarDays, label: 'Total Classes', value: stats?.totalBookings ?? 0, color: C.gold },
                    { icon: Trophy, label: 'Completion Rate', value: `${stats?.completionRate ?? 0}%`, color: C.islamicBlue },
                  ].map((stat) => {
                    const Icon = stat.icon
                    return (
                      <Card key={stat.label} className="border-0 shadow-sm" style={{ borderRadius: 16, backgroundColor: 'white' }}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                              style={{ backgroundColor: `${stat.color}12` }}>
                              <Icon className="h-5 w-5" style={{ color: stat.color }} />
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

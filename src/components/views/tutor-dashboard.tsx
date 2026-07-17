'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { format, parseISO, isToday, isTomorrow } from 'date-fns'
import {
  Wallet, TrendingUp, Users, Star, Calendar, Clock, Video, CheckCircle2,
  GraduationCap, Loader2, AlertCircle, LogOut, BookOpen, Menu, X,
  ChevronRight, MessageSquare, BarChart3, Settings, Play, BookOpenCheck,
  Award, CreditCard, Banknote, Sparkles, FileText, Send,
  Home, Bell, Crown, Zap, Bookmark, Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, type ViewKey } from '@/lib/store'
import {
  useTutorDashboard,
  useSaveAvailability,
  useUpdateBooking,
  useRequestWithdrawal,
  useTutorWalletLedger,
  useSaveBookmark,
} from '@/lib/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Avatar } from '@/components/shared/avatar'
import { StarMedallion } from '@/components/brand/patterns'
import { QtuorLogo, QtuorLogoLockup } from '@/components/brand/logo'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

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
  status: string
  experienceYears: number
}

interface StudentInfo {
  id: string
  name: string
  avatar?: string | null
  country?: string | null
}

interface BookingItem {
  id: string
  studentId: string
  tutorId: string
  scheduledAt: string
  durationMins: number
  status: string
  isTrial: boolean
  topic?: string | null
  meetingId?: string | null
  student: StudentInfo
}

interface WalletData {
  balance: number
  totalEarned: number
  escrowHeld: number
  platformRevenue: number
  pendingPayout: number
}

interface TutorStats {
  totalLessons: number
  upcomingLessons: number
  uniqueStudents: number
  rating: number
  reviewCount: number
  balance: number
  totalEarned: number
}

// ─── Sidebar Nav Items ────────────────────────────────────────────────
const SIDEBAR_NAV = [
  { key: 'overview', label: 'Home', icon: Home },
  { key: 'students', label: 'Students', icon: Users },
  { key: 'availability', label: 'Calendar', icon: Calendar },
  { key: 'earnings', label: 'Earnings', icon: Banknote },
  { key: 'messages', label: 'Chat Box', icon: MessageSquare },
  { key: 'settings', label: 'Settings', icon: Settings },
] as const
type SidebarKey = typeof SIDEBAR_NAV[number]['key']

// ─── Helpers ──────────────────────────────────────────────────────────
function formatClassDate(iso: string) {
  const d = parseISO(iso)
  const day = isToday(d) ? 'Today' : isTomorrow(d) ? 'Tomorrow' : format(d, 'EEE, MMM d')
  return { day, time: format(d, 'h:mm a') }
}

function getPlanTag(topic?: string | null): string {
  if (!topic) return 'General'
  if (topic.toLowerCase().includes('noorani') || topic.toLowerCase().includes('qaida')) return 'Noorani Qaida'
  if (topic.toLowerCase().includes('quran') || topic.toLowerCase().includes('hifz') || topic.toLowerCase().includes('surah')) return 'Quran Hifz'
  return 'General'
}

// ─── Motion ───────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: Math.min(i * 0.05, 0.4), duration: 0.45, ease: 'easeOut' as const },
  }),
}

// ─── QAIDA Lessons (for assignment dropdown) ──────────────────────────
const QAIDA_HOMEWORK_OPTIONS = [
  'Lesson 1: Arabic Alphabet',
  'Lesson 2: Joined Letters',
  'Lesson 3: Harakat',
  'Lesson 4: Tanween',
  'Lesson 5: Haroof Maddah',
  'Lesson 6: Sukoon',
  'Lesson 7: Shaddah',
  'Lesson 8: Madd',
  'Lesson 9: Waqf',
  'Lesson 10: Recitation Practice',
]

// ============================================================
// TOP BAR (Full width — always visible)
// ============================================================
function TutorTopBar({
  userName,
  rating,
  isOnline,
  onToggleOnline,
  onLogout,
}: {
  userName: string
  rating: number
  isOnline: boolean
  onToggleOnline: () => void
  onLogout: () => void
}) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 h-16 border-b"
      style={{ backgroundColor: 'white', borderColor: C.border }}
    >
      {/* Logo + Status */}
      <div className="flex items-center gap-4">
        <QtuorLogo className="h-8" />
        <Badge className="text-[10px] text-white border-0 ml-1" style={{ backgroundColor: C.brightBlue }}>
          LIVE
        </Badge>

        {/* Online/Offline toggle */}
        <button
          onClick={onToggleOnline}
          className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-all border"
          style={{ borderColor: isOnline ? C.teal : C.border, backgroundColor: isOnline ? `${C.teal}10` : 'transparent', borderRadius: 12 }}
        >
          <Zap className="h-3.5 w-3.5" style={{ color: isOnline ? C.teal : C.textMuted }} />
          <span style={{ color: isOnline ? C.teal : C.textMuted }}>
            {isOnline ? 'Available' : 'Offline'}
          </span>
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: isOnline ? C.teal : C.border }} />
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="relative rounded-xl p-2 transition-colors hover:bg-gray-100" style={{ borderRadius: 12 }}>
          <Bell className="h-5 w-5" style={{ color: C.textMuted }} />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: C.border }}>
          <Avatar name={userName} size={32} />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight" style={{ color: C.textDark }}>{userName}</p>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" style={{ color: C.gold }} />
              <span className="text-xs font-medium" style={{ color: C.gold }}>{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

// ============================================================
// SIDEBAR COMPONENT
// ============================================================
function TutorSidebar({
  activeNav,
  onNavClick,
  userName,
  userEmail,
  userAvatar,
  onLogout,
  rating,
}: {
  activeNav: SidebarKey
  onNavClick: (key: SidebarKey) => void
  userName: string
  userEmail: string
  userAvatar?: string | null
  onLogout: () => void
  rating: number
}) {
  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: C.deepNavy }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <QtuorLogo className="h-8" onDark />
        <Badge className="ml-auto text-[10px] text-white border-0" style={{ backgroundColor: C.brightBlue }}>
          Qari
        </Badge>
      </div>

      {/* Rating badge */}
      <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: `${C.gold}20` }}>
          <Crown className="h-4 w-4" style={{ color: C.gold }} />
          <span className="text-sm font-bold" style={{ color: C.gold }}>Top Rated</span>
          <div className="flex items-center gap-0.5 ml-auto">
            <Star className="h-3.5 w-3.5" style={{ color: C.gold }} />
            <span className="text-sm font-bold text-white">{rating.toFixed(1)}</span>
          </div>
        </div>
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
// MAIN TUTOR DASHBOARD
// ============================================================
export function TutorDashboard() {
  const user = useAppStore((s) => s.user)
  const setView = useAppStore((s) => s.setView)
  const setActiveBookingId = useAppStore((s) => s.setActiveBookingId)
  const logout = useAppStore((s) => s.logout)

  const { data, isLoading } = useTutorDashboard()
  const updateBooking = useUpdateBooking()
  const saveBookmark = useSaveBookmark()

  // Sidebar state
  const [activeNav, setActiveNav] = React.useState<SidebarKey>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // Online status
  const [isOnline, setIsOnline] = React.useState(true)

  // Homework assigner state
  const [selectedStudentId, setSelectedStudentId] = React.useState<string>('')
  const [selectedRating, setSelectedRating] = React.useState(5)
  const [homeworkNote, setHomeworkNote] = React.useState('')

  // ─── Save & End Class popup state ─────────────────────────────
  const [endClassPopupOpen, setEndClassPopupOpen] = React.useState(false)
  const [endClassBooking, setEndClassBooking] = React.useState<BookingItem | null>(null)
  const [endClassSurah, setEndClassSurah] = React.useState('')
  const [endClassAyah, setEndClassAyah] = React.useState('')

  // Withdrawal state
  const [withdrawAmount, setWithdrawAmount] = React.useState('')

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: C.offWhite }}>
        <Card className="w-full max-w-md border-0 shadow-lg" style={{ borderRadius: 20 }}>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold" style={{ color: C.islamicBlue }}>Tutor login required</h2>
            <p className="mt-2 text-sm" style={{ color: C.textMuted }}>Please sign in as a tutor to access your dashboard.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const profile = data?.profile as TutorProfile | undefined | null
  const wallet = data?.wallet as WalletData | undefined | null
  const bookings = (data?.bookings ?? []) as BookingItem[]
  const stats = data?.stats as TutorStats | undefined

  // Computed data
  const upcomingBookings = bookings
    .filter(b => b.status === 'SCHEDULED' && new Date(b.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const uniqueStudents = new Map<string, StudentInfo>()
  for (const b of bookings) {
    if (!uniqueStudents.has(b.studentId)) {
      uniqueStudents.set(b.studentId, b.student)
    }
  }

  // ─── Navigation handler ────────────────────────────────────────
  const handleNavClick = (key: SidebarKey) => {
    setActiveNav(key)
    setMobileMenuOpen(false)
  }

  // ─── Enter classroom ───────────────────────────────────────────
  const enterClassroom = (booking: BookingItem) => {
    setActiveBookingId(booking.id)
    setView('classroom')
  }

  // ─── Mark class completed ──────────────────────────────────────
  const markCompleted = async (bookingId: string) => {
    try {
      await updateBooking.mutateAsync({ id: bookingId, status: 'COMPLETED' })
      toast.success('Class marked as completed')
    } catch {
      toast.error('Failed to update class')
    }
  }

  // ─── Send homework ─────────────────────────────────────────────
  const sendHomework = () => {
    if (!selectedStudentId || !homeworkNote.trim()) {
      toast.error('Select a student and enter homework')
      return
    }
    const student = uniqueStudents.get(selectedStudentId)
    toast.success(`Homework assigned to ${student?.name || 'student'}`)
    setHomeworkNote('')
    setSelectedStudentId('')
  }

  // ─── Handle withdrawal ─────────────────────────────────────────
  // ─── Open "Save & End Class" popup ────────────────────────────
  const openEndClassPopup = (booking: BookingItem) => {
    setEndClassBooking(booking)
    setEndClassSurah('')
    setEndClassAyah('')
    setEndClassPopupOpen(true)
  }

  // ─── Save bookmark & end class ────────────────────────────────
  const handleSaveAndEndClass = async () => {
    if (!endClassBooking) return

    const studentId = endClassBooking.studentId
    const tutorId = endClassBooking.tutorId
    const planTag = getPlanTag(endClassBooking.topic)
    const bookType = planTag === 'Noorani Qaida' ? 'qaida' : 'quran'

    let pageLabel = ''
    let surahName: string | null = null
    let lastAyah: number | null = null
    let revisionRange: string | null = null

    if (bookType === 'quran' && endClassSurah) {
      const ayahNum = parseInt(endClassAyah) || 1
      pageLabel = `Surah ${endClassSurah}, Ayah ${ayahNum}`
      surahName = endClassSurah
      lastAyah = ayahNum
      // Auto-generate revision range: everything before this ayah
      if (ayahNum > 1) {
        revisionRange = `Surah ${endClassSurah}, Ayahs 1–${ayahNum}`
      }
    } else if (bookType === 'qaida') {
      pageLabel = endClassSurah || endClassBooking.topic || 'Noorani Qaida'
    } else {
      pageLabel = endClassBooking.topic || 'Quran Class'
    }

    try {
      // Save the bookmark
      await saveBookmark.mutateAsync({
        studentId,
        tutorId,
        bookType,
        pageId: bookType === 'qaida' ? 1 : 2,
        pageLabel,
        lastLineIndex: lastAyah || 0,
        surahName,
        lastAyah,
        revisionRange,
      })

      // Mark booking as completed
      await updateBooking.mutateAsync({ id: endClassBooking.id, status: 'COMPLETED' })

      toast.success('Class saved & ended. Student will resume from here next time!')
      setEndClassPopupOpen(false)
      setEndClassBooking(null)
    } catch {
      toast.error('Failed to save class progress')
    }
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    try {
      toast.success(`Withdrawal of $${amount} requested`)
      setWithdrawAmount('')
    } catch {
      toast.error('Withdrawal failed')
    }
  }

  // ─── MAIN RENDER ───────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col" style={{ backgroundColor: C.offWhite }}>
      {/* ═══ TOP BAR ═══ */}
      <TutorTopBar
        userName={user.name}
        rating={stats?.rating ?? profile?.rating ?? 0}
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(!isOnline)}
        onLogout={logout}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* ═══ DESKTOP SIDEBAR ═══ */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col">
          <TutorSidebar
            activeNav={activeNav}
            onNavClick={handleNavClick}
            userName={user.name}
            userEmail={user.email}
            userAvatar={user.avatar}
            onLogout={logout}
            rating={stats?.rating ?? profile?.rating ?? 0}
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
                <TutorSidebar
                  activeNav={activeNav}
                  onNavClick={handleNavClick}
                  userName={user.name}
                  userEmail={user.email}
                  userAvatar={user.avatar}
                  onLogout={logout}
                  rating={stats?.rating ?? profile?.rating ?? 0}
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
            <button
              onClick={() => setIsOnline(!isOnline)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border"
              style={{ borderColor: isOnline ? C.teal : C.border, color: isOnline ? C.teal : C.textMuted }}
            >
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: isOnline ? C.teal : C.border }} />
              {isOnline ? 'Available' : 'Offline'}
            </button>
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
                    ROW 1: Performance Overview KPI Cards
                    ═══════════════════════════════════════════════════════ */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
                  className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                  {[
                    { icon: Users, label: 'Active Students', value: stats?.uniqueStudents ?? profile?.studentCount ?? 0, color: C.islamicBlue },
                    { icon: Clock, label: 'Hours Taught', value: `${Math.round((stats?.totalLessons ?? profile?.lessonsCount ?? 0) * 0.5)} hrs`, color: C.brightBlue },
                    { icon: Wallet, label: 'Total Earnings', value: `$${stats?.totalEarned ?? wallet?.totalEarned ?? 0}`, color: C.teal },
                    { icon: Crown, label: 'Rank', value: 'Top Rated', isSpecial: true, color: C.gold },
                  ].map((stat) => {
                    const Icon = stat.icon
                    return (
                      <Card key={stat.label} className="border-0 shadow-sm" style={{ borderRadius: 16, backgroundColor: 'white' }}>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl"
                              style={{ backgroundColor: `${stat.color}12` }}>
                              <Icon className="h-5 w-5" style={{ color: stat.color }} />
                            </div>
                            <div>
                              <p className={cn('font-bold', stat.isSpecial ? 'text-base' : 'text-xl')} style={{ color: stat.color }}>
                                {stat.value}
                                {stat.label === 'Rank' && <Star className="inline h-3.5 w-3.5 ml-1" style={{ color: C.gold }} />}
                              </p>
                              <p className="text-xs" style={{ color: C.textMuted }}>{stat.label}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </motion.div>

                {/* ═══════════════════════════════════════════════════════
                    ROW 2: Today's Live Class Timeline
                    ═══════════════════════════════════════════════════════ */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
                  <Card className="border-0 shadow-sm" style={{ borderRadius: 20, backgroundColor: 'white' }}>
                    <CardHeader className="pb-3 px-6 pt-5">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2" style={{ color: C.islamicBlue }}>
                          <Calendar className="h-5 w-5" />
                          Today&apos;s Live Class Timeline
                        </CardTitle>
                        <Badge className="text-white border-0" style={{ backgroundColor: C.islamicBlue }}>
                          {upcomingBookings.length} upcoming
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      {upcomingBookings.length === 0 ? (
                        <div className="py-8 text-center">
                          <Calendar className="h-10 w-10 mx-auto mb-2" style={{ color: C.border }} />
                          <p className="text-sm" style={{ color: C.textMuted }}>No classes scheduled today</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {upcomingBookings.map((booking) => {
                            const { day, time } = formatClassDate(booking.scheduledAt)
                            const planTag = getPlanTag(booking.topic)
                            const isImminent = new Date(booking.scheduledAt).getTime() - Date.now() < 30 * 60 * 1000
                            const tagColor = planTag === 'Noorani Qaida' ? C.islamicBlue : planTag === 'Quran Hifz' ? C.brightBlue : C.gold

                            return (
                              <div key={booking.id} className="flex items-center gap-4 rounded-2xl p-4 border transition-all hover:shadow-sm"
                                style={{ borderColor: isImminent ? C.islamicBlue : C.border, backgroundColor: isImminent ? `${C.islamicBlue}04` : 'transparent', borderRadius: 16 }}>
                                {/* Time */}
                                <div className="text-center min-w-[64px]">
                                  <p className="text-sm font-bold" style={{ color: C.islamicBlue }}>{time}</p>
                                  <p className="text-[10px]" style={{ color: C.textMuted }}>{day}</p>
                                </div>
                                <div className="h-8 w-px" style={{ backgroundColor: C.border }} />
                                {/* Student info */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <Avatar name={booking.student.name} src={booking.student.avatar} size={40} country={booking.student.country} />
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold truncate" style={{ color: C.textDark }}>
                                      {booking.student.name}
                                    </p>
                                    <p className="text-xs truncate" style={{ color: C.textMuted }}>
                                      {booking.topic || 'Quran Class'}
                                    </p>
                                  </div>
                                </div>
                                {/* Plan tag */}
                                <Badge className="text-white border-0 shrink-0" style={{ backgroundColor: tagColor }}>
                                  {planTag}
                                </Badge>
                                {/* Action buttons */}
                                <div className="flex items-center gap-2 shrink-0">
                                  {isImminent ? (
                                    <Button
                                      className="text-white hover:opacity-90"
                                      size="sm"
                                      style={{ backgroundColor: C.teal, borderRadius: 12 }}
                                      onClick={() => enterClassroom(booking)}
                                    >
                                      <Play className="h-3.5 w-3.5 mr-1" />
                                      Launch
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      style={{ borderColor: C.islamicBlue, color: C.islamicBlue, borderRadius: 12 }}
                                      onClick={() => enterClassroom(booking)}
                                    >
                                      <Video className="h-3.5 w-3.5 mr-1" />
                                      Open
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-white border-0"
                                    style={{ backgroundColor: C.islamicBlue, borderRadius: 12 }}
                                    onClick={() => openEndClassPopup(booking)}
                                  >
                                    <Bookmark className="h-3.5 w-3.5 mr-1" />
                                    Save & End
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
                    ROW 3: Quick Performance Marking & Assignments
                    ═══════════════════════════════════════════════════════ */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
                  <Card className="border-0 shadow-sm" style={{ borderRadius: 20, backgroundColor: 'white' }}>
                    <CardHeader className="pb-3 px-6 pt-5">
                      <CardTitle className="text-lg flex items-center gap-2" style={{ color: C.islamicBlue }}>
                        <BookOpenCheck className="h-5 w-5" />
                        Quick Performance Marking & Assignments
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 space-y-5">
                      {/* Student selector */}
                      <div>
                        <Label className="text-sm font-medium" style={{ color: C.textDark }}>Select Student</Label>
                        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                          <SelectTrigger className="mt-1.5 w-full" style={{ borderColor: C.border, borderRadius: 12 }}>
                            <SelectValue placeholder="Choose a student..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(uniqueStudents.entries()).map(([id, student]) => (
                              <SelectItem key={id} value={id}>
                                <div className="flex items-center gap-2">
                                  <Avatar name={student.name} src={student.avatar} size={20} />
                                  {student.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Performance Rating */}
                      <div>
                        <Label className="text-sm font-medium" style={{ color: C.textDark }}>Today&apos;s Performance Rating</Label>
                        <div className="mt-2 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setSelectedRating(star)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className="h-7 w-7"
                                style={{ color: star <= selectedRating ? C.gold : C.border }}
                                fill={star <= selectedRating ? C.gold : 'none'}
                              />
                            </button>
                          ))}
                          <span className="ml-2 text-sm font-medium" style={{ color: C.textDark }}>
                            {selectedRating}/5
                          </span>
                        </div>
                      </div>

                      {/* Next Assignment / Homework */}
                      <div>
                        <Label className="text-sm font-medium" style={{ color: C.textDark }}>Next Assignment / Homework</Label>
                        <Select onValueChange={setHomeworkNote}>
                          <SelectTrigger className="mt-1.5 w-full" style={{ borderColor: C.border, borderRadius: 12 }}>
                            <SelectValue placeholder="Select a Qaida lesson or type custom homework..." />
                          </SelectTrigger>
                          <SelectContent>
                            {QAIDA_HOMEWORK_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {/* Custom homework input */}
                        <textarea
                          className="mt-2 w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 min-h-[80px] resize-none"
                          style={{ borderColor: C.border, focusRingColor: C.islamicBlue, borderRadius: 12 }}
                          placeholder="Or type custom homework / next sabaq here..."
                          value={homeworkNote}
                          onChange={(e) => setHomeworkNote(e.target.value)}
                        />
                      </div>

                      {/* Save button */}
                      <Button
                        className="w-full text-white hover:opacity-90"
                        style={{ backgroundColor: C.islamicBlue, borderRadius: 12 }}
                        onClick={sendHomework}
                        disabled={!selectedStudentId || !homeworkNote.trim()}
                      >
                        <Send className="h-4 w-4 mr-1.5" />
                        Save & Update
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* ═══════════════════════════════════════════════════════
                    ROW 4: Earnings Overview
                    ═══════════════════════════════════════════════════════ */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
                  <Card className="border-0 shadow-sm" style={{ borderRadius: 20, backgroundColor: 'white' }}>
                    <CardHeader className="pb-3 px-6 pt-5">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2" style={{ color: C.islamicBlue }}>
                          <Banknote className="h-5 w-5" />
                          Earnings & Payouts
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl p-5" style={{ backgroundColor: C.lightGray, borderRadius: 16 }}>
                          <p className="text-xs font-medium" style={{ color: C.textMuted }}>Available Balance</p>
                          <p className="mt-1 text-2xl font-bold" style={{ color: C.islamicBlue }}>
                            ${wallet?.balance?.toFixed(2) ?? '0.00'}
                          </p>
                        </div>
                        <div className="rounded-2xl p-5" style={{ backgroundColor: C.lightGray, borderRadius: 16 }}>
                          <p className="text-xs font-medium" style={{ color: C.textMuted }}>Total Earned</p>
                          <p className="mt-1 text-2xl font-bold" style={{ color: C.brightBlue }}>
                            ${wallet?.totalEarned?.toFixed(2) ?? '0.00'}
                          </p>
                        </div>
                        <div className="rounded-2xl p-5" style={{ backgroundColor: C.lightGray, borderRadius: 16 }}>
                          <p className="text-xs font-medium" style={{ color: C.textMuted }}>Escrow (Pending)</p>
                          <p className="mt-1 text-2xl font-bold" style={{ color: C.gold }}>
                            ${wallet?.escrowHeld?.toFixed(2) ?? '0.00'}
                          </p>
                        </div>
                      </div>

                      {/* Request Withdrawal */}
                      <div className="mt-5 flex items-end gap-3">
                        <div className="flex-1">
                          <Label className="text-sm font-medium" style={{ color: C.textDark }}>Request Withdrawal ($)</Label>
                          <Input
                            type="number"
                            min="1"
                            step="0.01"
                            className="mt-1.5"
                            style={{ borderColor: C.border, borderRadius: 12 }}
                            placeholder="Enter amount..."
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                          />
                        </div>
                        <Button
                          className="text-white hover:opacity-90"
                          style={{ backgroundColor: C.islamicBlue, borderRadius: 12 }}
                          onClick={handleWithdraw}
                        >
                          Withdraw
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* ═══════════════════════════════════════════════════════
                    ROW 5: Profile Badges
                    ═══════════════════════════════════════════════════════ */}
                {profile && (
                  <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
                    <Card className="border-0 shadow-sm" style={{ borderRadius: 20, backgroundColor: 'white' }}>
                      <CardHeader className="pb-3 px-6 pt-5">
                        <CardTitle className="text-base flex items-center gap-2" style={{ color: C.islamicBlue }}>
                          <Award className="h-4 w-4" />
                          Your Credentials
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-6 pb-6">
                        <div className="flex flex-wrap gap-2">
                          {profile.verified && (
                            <Badge className="text-white border-0" style={{ backgroundColor: C.islamicBlue, borderRadius: 10 }}>
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Verified Tutor
                            </Badge>
                          )}
                          {profile.hafiz && (
                            <Badge className="text-white border-0" style={{ backgroundColor: C.brightBlue, borderRadius: 10 }}>
                              <BookOpen className="h-3 w-3 mr-1" /> Hafiz
                            </Badge>
                          )}
                          {profile.ijazaCertified && (
                            <Badge className="text-white border-0" style={{ backgroundColor: C.gold, borderRadius: 10 }}>
                              <Award className="h-3 w-3 mr-1" /> Ijaza Certified
                            </Badge>
                          )}
                          {profile.nativeArabic && (
                            <Badge variant="outline" style={{ borderColor: C.islamicBlue, color: C.islamicBlue, borderRadius: 10 }}>
                              Native Arabic Speaker
                            </Badge>
                          )}
                          {profile.specialties && profile.specialties.split(',').map((s) => (
                            <Badge key={s} variant="outline" style={{ borderColor: C.border, color: C.textMuted, borderRadius: 10 }}>
                              {s.trim()}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* ═══ SAVE & END CLASS POPUP ═══ */}
      <AnimatePresence>
        {endClassPopupOpen && endClassBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setEndClassPopupOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-full max-w-lg border-0 shadow-2xl" style={{ borderRadius: 20 }} onClick={(e) => e.stopPropagation()}>
                <CardHeader className="px-6 pt-6 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2" style={{ color: C.islamicBlue }}>
                      <Bookmark className="h-5 w-5" />
                      Where did the student stop today?
                    </CardTitle>
                    <button
                      onClick={() => setEndClassPopupOpen(false)}
                      className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
                    >
                      <X className="h-5 w-5" style={{ color: C.textMuted }} />
                    </button>
                  </div>
                  <p className="text-sm mt-1" style={{ color: C.textMuted }}>
                    Student: <strong style={{ color: C.textDark }}>{endClassBooking.student.name}</strong> &bull; Plan: <strong style={{ color: C.textDark }}>{getPlanTag(endClassBooking.topic)}</strong>
                  </p>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-5">
                  {/* Surah / Lesson selector */}
                  <div>
                    <Label className="text-sm font-medium" style={{ color: C.textDark }}>
                      {getPlanTag(endClassBooking.topic) === 'Noorani Qaida' ? 'Qaida Lesson' : 'Surah Name'}
                    </Label>
                    {getPlanTag(endClassBooking.topic) === 'Noorani Qaida' ? (
                      <Select value={endClassSurah} onValueChange={setEndClassSurah}>
                        <SelectTrigger className="mt-1.5 w-full" style={{ borderColor: C.border, borderRadius: 12 }}>
                          <SelectValue placeholder="Select lesson..." />
                        </SelectTrigger>
                        <SelectContent>
                          {QAIDA_HOMEWORK_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select value={endClassSurah} onValueChange={setEndClassSurah}>
                        <SelectTrigger className="mt-1.5 w-full" style={{ borderColor: C.border, borderRadius: 12 }}>
                          <SelectValue placeholder="Select Surah..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {['Al-Fatihah', 'Al-Baqarah', 'Aal-i-Imran', 'An-Nisa', 'Al-Ma\'idah', 'Al-An\'am', 'Al-A\'raf', 'Al-Anfal', 'At-Tawbah', 'Yunus', 'Hud', 'Yusuf', 'Ar-Ra\'d', 'Ibrahim', 'Al-Hijr', 'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Ta-Ha', 'Al-Anbiya', 'Al-Hajj', 'Al-Mu\'minun', 'An-Nur', 'Al-Furqan', 'Ash-Shu\'ara', 'An-Naml', 'Al-Qasas', 'Al-Ankabut', 'Ar-Rum', 'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba', 'Fatir', 'Ya-Sin', 'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir', 'Fussilat', 'Ash-Shura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiyah', 'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf', 'Adh-Dhariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman', 'Al-Waqi\'ah', 'Al-Hadid', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', 'Al-Ma\'arij', 'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddaththir', 'Al-Qiyamah', 'Al-Insan', 'Al-Mursalat', 'An-Naba', 'An-Nazi\'at', 'Abasa', 'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj', 'At-Tariq', 'Al-A\'la', 'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad', 'Ash-Shams', 'Al-Layl', 'Ad-Duha', 'Ash-Sharh', 'At-Tin', 'Al-Alaq', 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', 'Al-Adiyat', 'Al-Qari\'ah', 'At-Takathur', 'Al-Asr', 'Al-Humazah', 'Al-Fil', 'Quraysh', 'Al-Ma\'un', 'Al-Kawthar', 'Al-Kafirun', 'An-Nasr', 'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'].map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Ayah number (only for Quran) */}
                  {getPlanTag(endClassBooking.topic) !== 'Noorani Qaida' && (
                    <div>
                      <Label className="text-sm font-medium" style={{ color: C.textDark }}>Ayah Number</Label>
                      <Input
                        type="number"
                        min="1"
                        max="286"
                        className="mt-1.5"
                        style={{ borderColor: C.border, borderRadius: 12 }}
                        placeholder="e.g., 152"
                        value={endClassAyah}
                        onChange={(e) => setEndClassAyah(e.target.value)}
                      />
                      {endClassSurah && endClassAyah && (
                        <div className="mt-2 rounded-xl p-3" style={{ backgroundColor: `${C.teal}10`, borderRadius: 12 }}>
                          <p className="text-xs font-medium" style={{ color: C.teal }}>
                            Auto-save: Next class will start from Surah {endClassSurah}, Ayah {parseInt(endClassAyah) + 1}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                            Revision (Sabqi): Surah {endClassSurah}, Ayahs 1–{endClassAyah}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      style={{ borderRadius: 12 }}
                      onClick={() => setEndClassPopupOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 text-white hover:opacity-90"
                      style={{ backgroundColor: C.islamicBlue, borderRadius: 12 }}
                      onClick={handleSaveAndEndClass}
                      disabled={getPlanTag(endClassBooking.topic) !== 'Noorani Qaida' ? !endClassSurah || !endClassAyah : !endClassSurah}
                    >
                      <Save className="h-4 w-4 mr-1.5" />
                      Save & End Class
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

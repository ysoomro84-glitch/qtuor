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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Avatar } from '@/components/shared/avatar'
import { StarMedallion } from '@/components/brand/patterns'
import { QtuorLogoLockup } from '@/components/brand/logo'
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
  { key: 'overview', label: 'Overview / Live Feed', icon: BarChart3 },
  { key: 'students', label: 'My Students (Roster)', icon: Users },
  { key: 'availability', label: 'My Availability / Calendar', icon: Calendar },
  { key: 'earnings', label: 'Earnings & Payouts', icon: Banknote },
  { key: 'messages', label: 'Student Chat Messages', icon: MessageSquare },
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

// ============================================================
// SIDEBAR COMPONENT (declared outside render to avoid state reset)
// ============================================================
function TutorSidebar({
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
        <Badge className="ml-auto text-[10px] text-white border-0" style={{ backgroundColor: C.brightBlue }}>
          Qari
        </Badge>
      </div>

      {/* Online/Offline toggle */}
      <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button className="flex items-center gap-3 w-full">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: C.islamicBlue }} />
          <span className="text-sm font-medium text-white">Online — Accepting Students</span>
        </button>
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
// MAIN TUTOR DASHBOARD
// ============================================================
export function TutorDashboard() {
  const user = useAppStore((s) => s.user)
  const setView = useAppStore((s) => s.setView)
  const setActiveBookingId = useAppStore((s) => s.setActiveBookingId)
  const logout = useAppStore((s) => s.logout)

  const { data, isLoading } = useTutorDashboard()
  const updateBooking = useUpdateBooking()

  // Sidebar state
  const [activeNav, setActiveNav] = React.useState<SidebarKey>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // Homework assigner state
  const [selectedStudentId, setSelectedStudentId] = React.useState<string>('')
  const [homeworkNote, setHomeworkNote] = React.useState('')

  // Withdrawal state
  const [withdrawAmount, setWithdrawAmount] = React.useState('')

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: C.offWhite }}>
        <Card className="w-full max-w-md border-0 shadow-lg">
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
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    try {
      await useRequestWithdrawal
      toast.success(`Withdrawal of $${amount} requested`)
      setWithdrawAmount('')
    } catch {
      toast.error('Withdrawal failed')
    }
  }



  // ─── MAIN RENDER ───────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: C.offWhite }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col">
        <TutorSidebar
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
              <TutorSidebar
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
                  ROW 1: Performance Summary (Top KPI Cards)
                  ═══════════════════════════════════════════════════════ */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
                className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: Users, label: 'Total Students', value: stats?.uniqueStudents ?? profile?.studentCount ?? 0, color: C.islamicBlue },
                  { icon: Clock, label: 'Hours Taught', value: Math.round((stats?.totalLessons ?? profile?.lessonsCount ?? 0) * 0.5), color: C.brightBlue },
                  { icon: Star, label: 'Rating', value: stats?.rating ?? profile?.rating ?? 0, isRating: true, color: C.gold },
                  { icon: Wallet, label: 'Available Balance', value: `$${stats?.balance ?? wallet?.balance ?? 0}`, color: C.islamicBlue },
                ].map((stat) => {
                  const Icon = stat.icon
                  return (
                    <Card key={stat.label} className="border-0 shadow-sm" style={{ backgroundColor: 'white' }}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{ backgroundColor: `${stat.color}15` }}>
                            <Icon className="h-5 w-5" style={{ color: stat.color }} />
                          </div>
                          <div>
                            <p className="text-xl font-bold" style={{ color: stat.color }}>
                              {stat.isRating ? `${stat.value}` : stat.value}
                              {stat.isRating && <Star className="inline h-3.5 w-3.5 ml-0.5" style={{ color: C.gold }} />}
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
                  ROW 2: Today's Live Schedule & Classroom Router
                  ═══════════════════════════════════════════════════════ */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
                <Card className="border-0 shadow-sm" style={{ backgroundColor: 'white' }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2" style={{ color: C.islamicBlue }}>
                        <Calendar className="h-5 w-5" />
                        Today&apos;s Live Schedule
                      </CardTitle>
                      <Badge className="text-white border-0" style={{ backgroundColor: C.islamicBlue }}>
                        {upcomingBookings.length} upcoming
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
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
                            <div key={booking.id} className="flex items-center gap-4 rounded-xl p-4 border transition-all hover:shadow-sm"
                              style={{ borderColor: isImminent ? C.islamicBlue : C.border, backgroundColor: isImminent ? `${C.islamicBlue}05` : 'transparent' }}>
                              {/* Time */}
                              <div className="text-center min-w-[64px]">
                                <p className="text-sm font-bold" style={{ color: C.islamicBlue }}>{time}</p>
                                <p className="text-[10px]" style={{ color: C.textMuted }}>{day}</p>
                              </div>
                              <div className="h-8 w-px" style={{ backgroundColor: C.border }} />
                              {/* Student info */}
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Avatar name={booking.student.name} src={booking.student.avatar} size={36} country={booking.student.country} />
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
                              {/* Start Class button */}
                              {isImminent ? (
                                <Button
                                  className="text-white hover:opacity-90 shrink-0"
                                  size="sm"
                                  style={{ backgroundColor: C.islamicBlue }}
                                  onClick={() => enterClassroom(booking)}
                                >
                                  <Play className="h-3.5 w-3.5 mr-1" />
                                  Start Class
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shrink-0"
                                  style={{ borderColor: C.islamicBlue, color: C.islamicBlue }}
                                  onClick={() => enterClassroom(booking)}
                                >
                                  <Video className="h-3.5 w-3.5 mr-1" />
                                  Open
                                </Button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* ═══════════════════════════════════════════════════════
                  ROW 3: Student Performance Log & Homework Assigner
                  ═══════════════════════════════════════════════════════ */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}
                className="grid gap-4 lg:grid-cols-2">
                {/* Left: Student Performance Log */}
                <Card className="border-0 shadow-sm" style={{ backgroundColor: 'white' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2" style={{ color: C.islamicBlue }}>
                      <GraduationCap className="h-4 w-4" />
                      Student Performance Log
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {Array.from(uniqueStudents.entries()).map(([id, student]) => {
                        const studentBookings = bookings.filter(b => b.studentId === id)
                        const completedCount = studentBookings.filter(b => b.status === 'COMPLETED').length
                        const lastBooking = studentBookings[0]
                        const planTag = getPlanTag(lastBooking?.topic)

                        return (
                          <div key={id} className="flex items-center gap-3 rounded-lg p-3 transition-all hover:shadow-sm"
                            style={{ backgroundColor: C.lightGray }}>
                            <Avatar name={student.name} src={student.avatar} size={32} country={student.country} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate" style={{ color: C.textDark }}>{student.name}</p>
                              <p className="text-xs" style={{ color: C.textMuted }}>
                                {completedCount} classes • {planTag}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs shrink-0"
                              style={{ borderColor: C.islamicBlue, color: C.islamicBlue }}>
                              Active
                            </Badge>
                          </div>
                        )
                      })}
                      {uniqueStudents.size === 0 && (
                        <div className="py-6 text-center">
                          <Users className="h-8 w-8 mx-auto mb-2" style={{ color: C.border }} />
                          <p className="text-sm" style={{ color: C.textMuted }}>No students yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Right: Homework Assigner */}
                <Card className="border-0 shadow-sm" style={{ backgroundColor: 'white' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2" style={{ color: C.islamicBlue }}>
                      <BookOpenCheck className="h-4 w-4" />
                      Homework / Next Sabaq
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Student selector */}
                    <div>
                      <Label className="text-sm font-medium" style={{ color: C.textDark }}>Select Student</Label>
                      <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                        <SelectTrigger className="mt-1.5 w-full" style={{ borderColor: C.border }}>
                          <SelectValue placeholder="Choose a student..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(uniqueStudents.entries()).map(([id, student]) => (
                            <SelectItem key={id} value={id}>{student.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Homework note */}
                    <div>
                      <Label className="text-sm font-medium" style={{ color: C.textDark }}>Assign Next Sabaq / Homework</Label>
                      <textarea
                        className="mt-1.5 w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 min-h-[100px] resize-none"
                        style={{ borderColor: C.border, focusRingColor: C.islamicBlue }}
                        placeholder="e.g., Practice Surah Al-Mulk Ayah 1-10 with tajweed focus on Ikhfa..."
                        value={homeworkNote}
                        onChange={(e) => setHomeworkNote(e.target.value)}
                      />
                    </div>

                    <Button
                      className="w-full text-white hover:opacity-90"
                      style={{ backgroundColor: C.islamicBlue }}
                      onClick={sendHomework}
                      disabled={!selectedStudentId || !homeworkNote.trim()}
                    >
                      <Send className="h-4 w-4 mr-1.5" />
                      Mark Homework / Next Sabaq
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ═══════════════════════════════════════════════════════
                  ROW 4: Earnings Overview
                  ═══════════════════════════════════════════════════════ */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
                <Card className="border-0 shadow-sm" style={{ backgroundColor: 'white' }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2" style={{ color: C.islamicBlue }}>
                        <Banknote className="h-5 w-5" />
                        Earnings & Payouts
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-xl p-4" style={{ backgroundColor: C.lightGray }}>
                        <p className="text-xs font-medium" style={{ color: C.textMuted }}>Available Balance</p>
                        <p className="mt-1 text-2xl font-bold" style={{ color: C.islamicBlue }}>
                          ${wallet?.balance?.toFixed(2) ?? '0.00'}
                        </p>
                      </div>
                      <div className="rounded-xl p-4" style={{ backgroundColor: C.lightGray }}>
                        <p className="text-xs font-medium" style={{ color: C.textMuted }}>Total Earned</p>
                        <p className="mt-1 text-2xl font-bold" style={{ color: C.brightBlue }}>
                          ${wallet?.totalEarned?.toFixed(2) ?? '0.00'}
                        </p>
                      </div>
                      <div className="rounded-xl p-4" style={{ backgroundColor: C.lightGray }}>
                        <p className="text-xs font-medium" style={{ color: C.textMuted }}>Escrow (Pending)</p>
                        <p className="mt-1 text-2xl font-bold" style={{ color: C.gold }}>
                          ${wallet?.escrowHeld?.toFixed(2) ?? '0.00'}
                        </p>
                      </div>
                    </div>

                    {/* Request Withdrawal */}
                    <div className="mt-4 flex items-end gap-3">
                      <div className="flex-1">
                        <Label className="text-sm font-medium" style={{ color: C.textDark }}>Request Withdrawal ($)</Label>
                        <Input
                          type="number"
                          min="1"
                          step="0.01"
                          className="mt-1.5"
                          style={{ borderColor: C.border }}
                          placeholder="Enter amount..."
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                      </div>
                      <Button
                        className="text-white hover:opacity-90"
                        style={{ backgroundColor: C.islamicBlue }}
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
                  <Card className="border-0 shadow-sm" style={{ backgroundColor: 'white' }}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2" style={{ color: C.islamicBlue }}>
                        <Award className="h-4 w-4" />
                        Your Credentials
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.verified && (
                          <Badge className="text-white border-0" style={{ backgroundColor: C.islamicBlue }}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Verified Tutor
                          </Badge>
                        )}
                        {profile.hafiz && (
                          <Badge className="text-white border-0" style={{ backgroundColor: C.brightBlue }}>
                            <BookOpen className="h-3 w-3 mr-1" /> Hafiz
                          </Badge>
                        )}
                        {profile.ijazaCertified && (
                          <Badge className="text-white border-0" style={{ backgroundColor: C.gold }}>
                            <Award className="h-3 w-3 mr-1" /> Ijaza Certified
                          </Badge>
                        )}
                        {profile.nativeArabic && (
                          <Badge variant="outline" style={{ borderColor: C.islamicBlue, color: C.islamicBlue }}>
                            Native Arabic Speaker
                          </Badge>
                        )}
                        {profile.specialties && profile.specialties.split(',').map((s) => (
                          <Badge key={s} variant="outline" style={{ borderColor: C.border, color: C.textMuted }}>
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
  )
}

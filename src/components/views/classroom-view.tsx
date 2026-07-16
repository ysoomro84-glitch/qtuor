'use client'

import * as React from 'react'
import { useAppStore } from '@/lib/store'
import { useClassroomSocket, type Stroke } from '@/components/classroom/use-classroom-socket'
import { QAIDA_PAGES, HIGHLIGHT_COLORS, type LibraryPage } from '@/components/classroom/quran-data'
import { JUZ_LIST, SURAHS, surahsInJuz } from '@/lib/quran-metadata'
import { useSurahText, fetchSurahAsPage } from '@/hooks/use-quran-text'
import { useBookings, useBookmark, useSaveBookmark, useStudentPlan } from '@/lib/queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/shared/avatar'
import {
  Mic, MicOff, Video, VideoOff, Phone, Send, Pen, Eraser, MousePointer2, Undo2, Trash2,
  ChevronLeft, ChevronRight, Circle, Users, Wifi, WifiOff, ShieldAlert, Disc, BookOpenText, Clock3,
  Highlighter, X, Loader2, Layers, ChevronDown, Bookmark, History, Lock,
  AlertCircle, BookOpen, Brain, PenTool, Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format } from 'date-fns'

type Tool = 'pen' | 'eraser' | 'pointer' | 'highlight'
type Tab = 'quran' | 'whiteboard' | 'qaida' | 'uploads'

const QAIDA_ID_MIN = 1001
const QAIDA_ID_MAX = 1017
const SURAH_ID_BASE = 10000
const DEFAULT_PAGE_ID = SURAH_ID_BASE + 1

const NAV_LIST = [
  ...QAIDA_PAGES.map((p) => ({ id: p.id, label: `Lesson ${p.lessonNumber}: ${p.lessonTitle}`, group: 'qaida' as const })),
  ...SURAHS.map((s) => ({ id: SURAH_ID_BASE + s.number, label: `${s.number}. ${s.name}`, group: 'quran' as const })),
]

// Theme colors
const COLORS = {
  deepBlue: '#0A192F',
  lightBlue: '#8EAEC6',
  accentBlue: '#00A8CC',
  gold: '#D4AF37',
  charcoal: '#1F2937',
  border: 'rgba(142, 174, 198, 0.3)',
  red: '#EF4444',
  teal: '#139A8C',
}

export function ClassroomView() {
  const { user, activeBookingId, setView } = useAppStore()
  const isTutor = user?.role === 'TUTOR'
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings(isTutor ? 'tutor' : 'student')
  const allBookings = bookingsData?.bookings || []
  const booking = allBookings.find((b) => b.id === activeBookingId) || allBookings.find((b) => b.status === 'SCHEDULED' && new Date(b.scheduledAt) > new Date()) || null

  const role: 'teacher' | 'student' = booking?.tutorId === user?.id ? 'teacher' : 'student'
  const otherParty = role === 'teacher' ? booking?.student : booking?.tutor
  const studentId = role === 'student' ? user?.id : booking?.studentId
  const tutorId = role === 'teacher' ? user?.id : booking?.tutorId

  const socket = useClassroomSocket(booking?.id || null, user ? { id: user.id, name: user.name, role, avatar: user.avatar } : null)

  // Content lock
  const { data: planData } = useStudentPlan(studentId || null)
  const allowedBooks: ('qaida' | 'quran')[] = planData?.allowedBooks || ['qaida', 'quran']
  const filteredNavList = NAV_LIST.filter((item) => allowedBooks.includes(item.group))

  // Active tab
  const [activeTab, setActiveTab] = React.useState<Tab>(allowedBooks.includes('quran') ? 'quran' : 'qaida')

  // Font settings
  const [fontFamily, setFontFamily] = React.useState<'uthmani' | 'indopak' | 'simple'>('uthmani')
  const [fontSize, setFontSize] = React.useState<'S' | 'M' | 'L' | 'XL'>('M')
  const fontSizeMap = { S: 'text-xl', M: 'text-2xl', L: 'text-3xl', XL: 'text-4xl' }
  const fontFamilyMap = {
    uthmani: "var(--font-amiri-quran), var(--font-amiri), 'Amiri Quran', 'Amiri', serif",
    indopak: "var(--font-noto-naskh), 'Noto Naskh Arabic', serif",
    simple: "var(--font-scheherazade), 'Scheherazade New', serif",
  }

  // Page resolution
  const currentPageId = socket.page || DEFAULT_PAGE_ID
  const isQaidaPage = currentPageId >= QAIDA_ID_MIN && currentPageId <= QAIDA_ID_MAX
  const surahNumber = currentPageId >= SURAH_ID_BASE ? currentPageId - SURAH_ID_BASE : null
  const { data: dynamicSurahPage, isLoading: surahLoading } = useSurahText(surahNumber)

  // Fallback fetch
  const [fallbackPage, setFallbackPage] = React.useState<LibraryPage | null>(null)
  React.useEffect(() => {
    if (isQaidaPage || !surahNumber) { setFallbackPage(null); return }
    if (dynamicSurahPage?.lines?.length) { setFallbackPage(null); return }
    fetchSurahAsPage(surahNumber).then(setFallbackPage).catch(() => {})
  }, [surahNumber, isQaidaPage, dynamicSurahPage])

  const effectivePage = dynamicSurahPage || fallbackPage
  const resolvedPage: LibraryPage = isQaidaPage ? (QAIDA_PAGES.find((p) => p.id === currentPageId) || QAIDA_PAGES[0]) : (effectivePage || QAIDA_PAGES[0])
  const hasSurahData = !isQaidaPage && (effectivePage?.lines?.length ?? 0) > 0
  const showLoading = !isQaidaPage && surahNumber !== null && !hasSurahData && surahLoading

  // Auto-navigate to correct book when plan loads
  const planLoadedRef = React.useRef(false)
  React.useEffect(() => {
    if (planData && !planLoadedRef.current) {
      planLoadedRef.current = true
      const inList = filteredNavList.some((n) => n.id === currentPageId)
      if (!inList && filteredNavList.length > 0) {
        socket.changePage(allowedBooks.includes('quran') ? DEFAULT_PAGE_ID : QAIDA_ID_MIN)
      }
    }
  }, [planData])

  // Bookmark auto-resume
  const { data: bookmarkData } = useBookmark(studentId || null, tutorId || null)
  const bookmark = bookmarkData?.bookmark
  const bookmarkLoadedRef = React.useRef(false)
  React.useEffect(() => {
    if (bookmark && !bookmarkLoadedRef.current && socket.connected) {
      bookmarkLoadedRef.current = true
      socket.changePage(bookmark.pageId)
      toast.info(`Resumed: ${bookmark.pageLabel || 'last lesson'}`)
    }
  }, [bookmark, socket.connected])

  // Revision mode
  const [revisionMode, setRevisionMode] = React.useState(false)
  const saveBookmark = useSaveBookmark()
  const handleEndLesson = () => {
    if (!studentId || !tutorId) return
    const nav = NAV_LIST.find((n) => n.id === currentPageId)
    saveBookmark.mutate({ studentId, tutorId, bookType: isQaidaPage ? 'qaida' : 'quran', pageId: currentPageId, pageLabel: nav?.label || 'Unknown' })
    toast.success('Lesson bookmarked! Next class resumes here.')
  }

  // Tools
  const [tool, setTool] = React.useState<Tool>('highlight')
  const [color, setColor] = React.useState(HIGHLIGHT_COLORS[0])
  const [penColor, setPenColor] = React.useState('#1e3a8a')
  const [penSize, setPenSize] = React.useState(3)

  // Student control toggles (teacher only)
  const [hideStudentView, setHideStudentView] = React.useState(false)
  const [disableStudentControl, setDisableStudentControl] = React.useState(false)

  // ===== Session Countdown Timer =====
  const [timeRemaining, setTimeRemaining] = React.useState<number>(0) // seconds
  const [showWarning, setShowWarning] = React.useState(false)
  const warningShownRef = React.useRef(false)

  React.useEffect(() => {
    if (!booking) return
    const endTime = new Date(booking.scheduledAt).getTime() + booking.durationMins * 60 * 1000
    const updateTimer = () => {
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000))
      setTimeRemaining(remaining)
      // 15-minute warning (900 seconds)
      if (remaining <= 900 && remaining > 0 && !warningShownRef.current) {
        warningShownRef.current = true
        setShowWarning(true)
      }
      // Auto-end at 00:00
      if (remaining <= 0) {
        toast.error('Session time has ended. The classroom will close automatically.')
        setView(role === 'teacher' ? 'tutor-dashboard' : 'student-dashboard')
      }
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [booking])

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h > 0 ? String(h).padStart(2, '0') + ':' : ''}${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // Media
  const [camOn, setCamOn] = React.useState(false)
  const [micOn, setMicOn] = React.useState(false)
  const [recording, setRecording] = React.useState(false)
  const localVideoRef = React.useRef<HTMLVideoElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)

  // Safety snapshot
  const [safetyFlash, setSafetyFlash] = React.useState(false)
  React.useEffect(() => {
    if (!activeBookingId) return
    const trigger = () => { setSafetyFlash(true); setTimeout(() => setSafetyFlash(false), 3000) }
    const t = setTimeout(() => { trigger(); setInterval(trigger, 180000 + Math.random() * 180000) }, 45000 + Math.random() * 45000)
    return () => clearTimeout(t)
  }, [activeBookingId])

  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (localVideoRef.current) localVideoRef.current.srcObject = stream
      setCamOn(true)
    } catch { toast.error('Camera access denied') }
  }
  const disableCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCamOn(false); setMicOn(false)
  }
  const toggleMic = async () => {
    if (!camOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        streamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream
        setCamOn(true); setMicOn(true)
      } catch { toast.error('Microphone access denied') }
      return
    }
    const audioTrack = streamRef.current?.getAudioTracks()[0]
    if (audioTrack) { audioTrack.enabled = !micOn; setMicOn(!micOn) }
  }
  React.useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()) }, [])

  if (!user) return <div className="flex min-h-[60vh] items-center justify-center"><Button onClick={() => setView('landing')}>Go home</Button></div>
  if (bookingsLoading) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-[oklch(0.62_0.14_230)]" />
      <p className="text-muted-foreground">Loading classroom...</p>
    </div>
  )
  if (!booking) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">No active class found.</p>
      <p className="text-sm text-muted-foreground/70">Book a class from the dashboard or find a tutor to get started.</p>
      <Button onClick={() => setView('student-dashboard')} className="bg-[oklch(0.62_0.14_230)] text-white hover:bg-[oklch(0.55_0.14_230)]">
        Back to Dashboard
      </Button>
    </div>
  )

  const leave = () => { disableCamera(); setView(role === 'teacher' ? 'tutor-dashboard' : 'student-dashboard') }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)', overflow: 'hidden', background: COLORS.deepBlue }}>
      {/* ===== TOP NAVBAR HEADER ===== */}
      <div className="flex shrink-0 items-center justify-between px-4 py-2" style={{ background: COLORS.deepBlue, borderBottom: `1px solid ${COLORS.border}` }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-red-500/90 px-2.5 py-0.5 text-xs font-bold text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE
          </div>
          {/* Session Countdown Timer */}
          <div className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums', timeRemaining <= 900 ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white/80')}>
            <Clock3 className="h-3 w-3" /> {formatTime(timeRemaining)}
          </div>
          {revisionMode && <div className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: COLORS.gold }}>REVISION</div>}
          {allowedBooks.length < 2 && <div className="flex items-center gap-1 text-[10px] text-white/60"><Lock className="h-2.5 w-2.5" /> {allowedBooks[0] === 'qaida' ? 'Qaida only' : 'Quran only'}</div>}
          <div className="hidden text-sm text-white/80 sm:block">{booking.topic || 'Quran Class'} · {format(new Date(booking.scheduledAt), 'EEE d MMM · h:mm a')}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs', socket.connected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300')}>
            {socket.connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />} {socket.connected ? 'Connected' : 'Connecting'}
          </span>
          <span className="hidden items-center gap-1 text-xs text-white/60 sm:inline-flex"><Users className="h-3 w-3" /> {socket.members.length}</span>
          <Button size="sm" variant={recording ? 'default' : 'outline'} className={cn('h-7 gap-1 text-xs', recording && 'bg-red-600 text-white')} onClick={() => { setRecording(!recording); toast[recording ? 'info' : 'success'](recording ? 'Recording stopped' : 'Recording started') }}>
            <Disc className={cn('h-3 w-3', recording && 'animate-spin')} /> {recording ? 'Rec' : 'Record'}
          </Button>
          <Button size="sm" className="h-7 gap-1 text-xs" style={{ background: COLORS.red }} onClick={leave}><Phone className="h-3 w-3" /> Leave</Button>
        </div>
      </div>

      {/* 15-minute warning banner */}
      {showWarning && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-pulse rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-2xl" style={{ background: 'linear-gradient(135deg, #00A8CC, #8EAEC6)' }}>
          <Clock3 className="mr-2 inline h-4 w-4" />
          Attention: 15 minutes left before your session automatically ends. Please wrap up your lesson.
          <button onClick={() => setShowWarning(false)} className="ml-3 text-white/80 hover:text-white"><X className="inline h-4 w-4" /></button>
        </div>
      )}

      {/* Safety flash */}
      {safetyFlash && <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-lg" style={{ background: COLORS.gold }}><ShieldAlert className="mr-1.5 inline h-3.5 w-3.5" /> Safety snapshot captured</div>}

      {/* ===== 3-COLUMN BODY ===== */}
      <div className="grid min-h-0 flex-1 overflow-hidden" style={{ gridTemplateColumns: 'minmax(180px, 20%) 1fr minmax(180px, 20%)' }}>

        {/* ===== LEFT COLUMN: Video & Chat (20%) ===== */}
        <div className="flex min-h-0 flex-col overflow-hidden border-r" style={{ background: COLORS.charcoal, borderColor: COLORS.border }}>
          {/* Video tiles */}
          <div className="space-y-2 p-2">
            <VideoTile label={role === 'student' ? 'Teacher' : 'Student'} name={otherParty?.name || 'Waiting'} avatarName={otherParty?.name || 'T'} country={otherParty?.country} isLive={socket.members.length > 1} accentColor={COLORS.lightBlue} />
            <VideoTile label="You" name={user.name} avatarName={user.name} country={user.country} isLive={camOn} videoRef={localVideoRef} accentColor={COLORS.gold} />
          </div>
          {/* Media controls */}
          <div className="flex items-center justify-center gap-2 px-2 pb-2">
            <Button size="sm" variant="outline" className={cn('h-7 gap-1 text-xs', camOn && 'border-[oklch(0.62_0.14_230)] text-[oklch(0.62_0.14_230)]')} style={{ borderColor: camOn ? COLORS.accentBlue : COLORS.border, color: 'white', background: 'transparent' }} onClick={camOn ? disableCamera : enableCamera}>
              {camOn ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />} {camOn ? 'Cam' : 'Cam off'}
            </Button>
            <Button size="sm" variant="outline" className={cn('h-7 gap-1 text-xs', micOn && 'border-[oklch(0.62_0.14_230)] text-[oklch(0.62_0.14_230)]')} style={{ borderColor: micOn ? COLORS.accentBlue : COLORS.border, color: 'white', background: 'transparent' }} onClick={toggleMic}>
              {micOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />} {micOn ? 'Mic' : 'Muted'}
            </Button>
          </div>
          {/* Chat */}
          <ChatPanel className="min-h-0 flex-1" messages={socket.chat} onSend={socket.sendChat} currentUserId={user.id} accentColor={COLORS.lightBlue} />
        </div>

        {/* ===== CENTER COLUMN: Interactive Board (60%) ===== */}
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden" style={{ background: '#F8FAFC' }}>
          {/* Tab bar */}
          <div className="flex shrink-0 items-center gap-1 border-b px-2 py-1" style={{ background: COLORS.charcoal, borderColor: COLORS.border }}>
            {([
              ['quran', 'Quran', BookOpen],
              ['whiteboard', 'White Board', PenTool],
              ['qaida', 'Noorani Qaida', BookOpenText],
              ['uploads', 'Uploads', Upload],
            ] as const).map(([key, label, Icon]) => {
              const isEnabled = key === 'quran' ? allowedBooks.includes('quran') : key === 'qaida' ? allowedBooks.includes('qaida') : true
              if (!isEnabled) return null
              return (
                <button key={key} onClick={() => setActiveTab(key)} className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition', activeTab === key ? 'text-white' : 'text-white/50 hover:text-white/80')}
                  style={activeTab === key ? { background: COLORS.accentBlue } : { background: 'transparent' }}>
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              )
            })}

            {/* Tools in tab bar */}
            <div className="ml-auto flex items-center gap-1">
              <div className="flex items-center gap-0.5 rounded-lg p-0.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <ToolBtn active={tool === 'highlight'} onClick={() => setTool('highlight')} icon={<Highlighter className="h-3.5 w-3.5" />} />
                <ToolBtn active={tool === 'pen'} onClick={() => setTool('pen')} icon={<Pen className="h-3.5 w-3.5" />} />
                <ToolBtn active={tool === 'eraser'} onClick={() => setTool('eraser')} icon={<Eraser className="h-3.5 w-3.5" />} />
                <ToolBtn active={tool === 'pointer'} onClick={() => setTool('pointer')} icon={<MousePointer2 className="h-3.5 w-3.5" />} />
              </div>
              {tool === 'highlight' && (
                <div className="flex items-center gap-1">
                  {HIGHLIGHT_COLORS.map((c) => <button key={c.name} onClick={() => setColor(c)} className={cn('h-5 w-5 rounded-full border-2', color.name === c.name ? 'scale-110' : '')} style={{ background: c.value, borderColor: color.name === c.name ? COLORS.gold : COLORS.border }} />)}
                </div>
              )}
              <Button size="sm" variant="ghost" onClick={socket.undoStroke} className="h-7 text-xs text-white/70 hover:text-white"><Undo2 className="h-3 w-3" /></Button>
              <Button size="sm" variant="ghost" onClick={socket.clearHighlights} className="h-7 text-xs text-white/70 hover:text-white"><Trash2 className="h-3 w-3" /></Button>
            </div>
          </div>

          {/* Main viewport */}
          <div className="relative min-h-0 flex-1 overflow-y-auto scrollbar-quran p-3" style={{ background: '#F8FAFC' }}>
            {activeTab === 'quran' && (allowedBooks.includes('quran') ? (
              <QuranBoard page={resolvedPage} loading={showLoading} highlights={socket.highlights} hoveredWord={socket.hoveredWord} strokes={socket.strokes} tool={tool} color={color} penColor={penColor} penSize={penSize} onWordClick={(id) => socket.highlightWord(id, color.value)} onWordHover={(id) => socket.hoverWord(id)} onStroke={socket.sendStroke} pointer={socket.pointer} onPointerMove={socket.movePointer} accentColor={COLORS.gold} borderColor={COLORS.border} fontFamily={fontFamilyMap[fontFamily]} fontSizeClass={fontSizeMap[fontSize]} />
            ) : <LockedPanel label="Quran is not available in your plan" />)}

            {activeTab === 'qaida' && (allowedBooks.includes('qaida') ? (
              <QuranBoard page={isQaidaPage ? resolvedPage : QAIDA_PAGES[0]} highlights={socket.highlights} hoveredWord={socket.hoveredWord} strokes={socket.strokes} tool={tool} color={color} penColor={penColor} penSize={penSize} onWordClick={(id) => socket.highlightWord(id, color.value)} onWordHover={(id) => socket.hoverWord(id)} onStroke={socket.sendStroke} pointer={socket.pointer} onPointerMove={socket.movePointer} accentColor={COLORS.gold} borderColor={COLORS.border} fontFamily={fontFamilyMap[fontFamily]} fontSizeClass={fontSizeMap[fontSize]} />
            ) : <LockedPanel label="Noorani Qaida is not available in your plan" />)}

            {activeTab === 'whiteboard' && (
              <WhiteBoard strokes={socket.strokes} tool={tool} penColor={penColor} penSize={penSize} onStroke={socket.sendStroke} pointer={socket.pointer} onPointerMove={socket.movePointer} accentColor={COLORS.gold} borderColor={COLORS.border} />
            )}

            {activeTab === 'uploads' && (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Upload PDFs or images for the lesson</p>
                <Button variant="outline" onClick={() => toast.info('Upload feature coming soon')}>Upload File</Button>
              </div>
            )}
          </div>

          {/* Page navigation bar */}
          <div className="flex shrink-0 items-center justify-between border-t px-3 py-1.5" style={{ background: COLORS.charcoal, borderColor: COLORS.border }}>
            <Button size="sm" variant="ghost" onClick={() => { const idx = filteredNavList.findIndex((p) => p.id === currentPageId); if (idx > 0) socket.changePage(filteredNavList[idx - 1].id) }} disabled={filteredNavList.findIndex((p) => p.id === currentPageId) <= 0} className="h-7 text-xs text-white/70 hover:text-white">
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <span className="text-xs text-white/60">
              {filteredNavList.findIndex((p) => p.id === currentPageId) + 1} / {filteredNavList.length}
            </span>
            <Button size="sm" variant="ghost" onClick={() => { const idx = filteredNavList.findIndex((p) => p.id === currentPageId); if (idx < filteredNavList.length - 1) socket.changePage(filteredNavList[idx + 1].id) }} disabled={filteredNavList.findIndex((p) => p.id === currentPageId) >= filteredNavList.length - 1} className="h-7 text-xs text-white/70 hover:text-white">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ===== RIGHT COLUMN: Teacher's Control Panel (20%) ===== */}
        <div className="flex min-h-0 flex-col overflow-y-auto scrollbar-quran border-l p-3" style={{ background: COLORS.charcoal, borderColor: COLORS.border }}>
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-white/60">Navigation</h3>

            {/* Surah selector */}
            {allowedBooks.includes('quran') && (
              <div>
                <Label className="text-[10px] font-semibold uppercase text-white/40">Surah</Label>
                <select onChange={(e) => socket.changePage(SURAH_ID_BASE + parseInt(e.target.value))} value={surahNumber || 1} className="mt-1 w-full rounded-lg border bg-white/5 px-2 py-1.5 text-xs text-white" style={{ borderColor: COLORS.border }}>
                  {SURAHS.map((s) => <option key={s.number} value={s.number} className="bg-gray-800">{s.number}. {s.name}</option>)}
                </select>
              </div>
            )}

            {/* Qaida selector */}
            {allowedBooks.includes('qaida') && (
              <div>
                <Label className="text-[10px] font-semibold uppercase text-white/40">Qaida Lesson</Label>
                <select onChange={(e) => socket.changePage(QAIDA_ID_MIN + parseInt(e.target.value))} value={isQaidaPage ? currentPageId - QAIDA_ID_MIN : 0} className="mt-1 w-full rounded-lg border bg-white/5 px-2 py-1.5 text-xs text-white" style={{ borderColor: COLORS.border }}>
                  {QAIDA_PAGES.map((p, i) => <option key={p.id} value={i} className="bg-gray-800">Lesson {p.lessonNumber}: {p.lessonTitle}</option>)}
                </select>
              </div>
            )}

            {/* Font family */}
            <div>
              <Label className="text-[10px] font-semibold uppercase text-white/40">Font Family</Label>
              <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value as any)} className="mt-1 w-full rounded-lg border bg-white/5 px-2 py-1.5 text-xs text-white" style={{ borderColor: COLORS.border }}>
                <option value="uthmani" className="bg-gray-800">Uthmani Script</option>
                <option value="indopak" className="bg-gray-800">IndoPak Script</option>
                <option value="simple" className="bg-gray-800">Simple Script</option>
              </select>
            </div>

            {/* Font size */}
            <div>
              <Label className="text-[10px] font-semibold uppercase text-white/40">Font Size</Label>
              <div className="mt-1 flex gap-1">
                {(['S', 'M', 'L', 'XL'] as const).map((s) => (
                  <button key={s} onClick={() => setFontSize(s)} className={cn('flex-1 rounded border py-1 text-[10px] transition', fontSize === s ? 'text-white' : 'text-white/70 hover:bg-white/10')} style={{ borderColor: fontSize === s ? COLORS.accentBlue : COLORS.border, background: fontSize === s ? COLORS.accentBlue : 'transparent' }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="my-3 border-t" style={{ borderColor: COLORS.border }} />

            {/* Teacher controls */}
            {role === 'teacher' && (
              <>
                <h3 className="text-xs font-bold uppercase tracking-wide text-white/60">Teacher Controls</h3>

                <Button size="sm" className="w-full gap-1.5 text-xs" style={{ background: COLORS.gold, color: COLORS.deepBlue }} onClick={handleEndLesson}>
                  <Bookmark className="h-3 w-3" /> End Lesson & Bookmark
                </Button>

                <Button size="sm" variant="outline" className={cn('w-full gap-1.5 text-xs', revisionMode && 'bg-amber-500/20')} style={{ borderColor: revisionMode ? COLORS.gold : COLORS.border, color: 'white', background: revisionMode ? 'rgba(212,175,55,0.2)' : 'transparent' }} onClick={() => setRevisionMode(!revisionMode)}>
                  <History className="h-3 w-3" /> {revisionMode ? 'Revision ON' : 'Revision Mode'}
                </Button>

                {revisionMode && bookmark?.pageId && (
                  <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs" style={{ borderColor: COLORS.accentBlue, color: COLORS.accentBlue, background: 'transparent' }} onClick={() => { socket.changePage(bookmark.pageId); setRevisionMode(false); toast.success('Resumed') }}>
                    <Bookmark className="h-3 w-3" /> Resume Lesson
                  </Button>
                )}

                <div className="my-2 border-t" style={{ borderColor: COLORS.border }} />

                <h3 className="text-xs font-bold uppercase tracking-wide text-white/60">Student Interaction</h3>

                <label className="flex items-center justify-between gap-2 text-xs text-white/80">
                  <span>Hide Student's View</span>
                  <button onClick={() => setHideStudentView(!hideStudentView)} className={cn('h-5 w-9 rounded-full transition', hideStudentView ? 'bg-red-500' : 'bg-white/20')}><span className={cn('block h-4 w-4 rounded-full bg-white transition', hideStudentView ? 'translate-x-4' : 'translate-x-0.5')} /></button>
                </label>

                <label className="flex items-center justify-between gap-2 text-xs text-white/80">
                  <span>Disable Student Control</span>
                  <button onClick={() => setDisableStudentControl(!disableStudentControl)} className={cn('h-5 w-9 rounded-full transition', disableStudentControl ? 'bg-red-500' : 'bg-white/20')}><span className={cn('block h-4 w-4 rounded-full bg-white transition', disableStudentControl ? 'translate-x-4' : 'translate-x-0.5')} /></button>
                </label>
              </>
            )}

            {/* Library browser */}
            <div className="my-2 border-t" style={{ borderColor: COLORS.border }} />
            <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs" style={{ borderColor: COLORS.border, color: 'white', background: 'transparent' }} onClick={() => toast.info('Use the Surah/Qaida selectors above to navigate')}>
              <Layers className="h-3 w-3" /> Browse Library
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============ Video Tile ============ */
function VideoTile({ label, name, avatarName, country, isLive, videoRef, accentColor }: {
  label: string; name: string; avatarName: string; country?: string | null; isLive: boolean; videoRef?: React.RefObject<HTMLVideoElement | null>; accentColor: string
}) {
  return (
    <div className="relative flex flex-col items-center rounded-xl p-2" style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${isLive ? accentColor : 'rgba(142,174,198,0.2)'}`, borderRadius: '12px', boxShadow: isLive ? `0 0 8px ${accentColor}40` : 'none' }}>
      <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-[oklch(0.34_0.13_256)] to-[oklch(0.55_0.12_250)] sm:h-20 sm:w-20">
        {videoRef && isLive ? <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Avatar name={avatarName} size={48} /></div>}
        {!isLive && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><VideoOff className="h-5 w-5 text-white/70" /></div>}
      </div>
      <div className="mt-1 text-center">
        <div className="text-xs font-semibold text-white">{label}</div>
        <div className="truncate text-[10px] text-white/50 max-w-[100px]">{name}</div>
      </div>
      <span className={cn('absolute right-2 top-2 h-2 w-2 rounded-full', isLive ? 'bg-green-400' : 'bg-white/30')} />
    </div>
  )
}

/* ============ Chat Panel ============ */
function ChatPanel({ className, messages, onSend, currentUserId, accentColor }: {
  className?: string; messages: any[]; onSend: (c: string) => void; currentUserId: string; accentColor: string
}) {
  const [text, setText] = React.useState('')
  const scrollRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }) }, [messages])
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!text.trim()) return; onSend(text.trim()); setText('') }
  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div className="border-b px-3 py-1.5 text-[10px] font-semibold uppercase text-white/40" style={{ borderColor: 'rgba(142,174,198,0.2)' }}>Chat</div>
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-1.5 overflow-y-auto scrollbar-quran p-2">
        {messages.length === 0 && <p className="text-center text-[10px] text-white/20">No messages yet</p>}
        {messages.map((m) => (
          <div key={m.id} className={cn('flex flex-col', m.type === 'system' ? 'items-center' : m.userId === currentUserId ? 'items-end' : 'items-start')}>
            {m.type === 'system' ? <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] italic text-white/30">{m.content}</span> : (
              <div className={cn('max-w-[80%] rounded-lg px-2 py-1 text-[11px]', m.userId === currentUserId ? 'text-white' : 'bg-white/10 text-white')} style={m.userId === currentUserId ? { background: accentColor } : {}}>
                {m.userId !== currentUserId && <div className="text-[9px] font-semibold opacity-80">{m.name}</div>}
                {m.content}
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="flex gap-1 border-t p-1.5" style={{ borderColor: 'rgba(142,174,198,0.2)' }}>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type..." className="h-7 border-white/15 bg-white/5 text-xs text-white placeholder:text-white/30" />
        <Button type="submit" size="icon" className="h-7 w-7 shrink-0" style={{ background: COLORS.accentBlue }}><Send className="h-3 w-3" /></Button>
      </form>
    </div>
  )
}

/* ============ Tool Button ============ */
function ToolBtn({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return <button onClick={onClick} className={cn('flex h-6 w-6 items-center justify-center rounded-md transition', active ? 'text-white' : 'text-white/40 hover:text-white/70')} style={active ? { background: COLORS.accentBlue } : {}}>{icon}</button>
}

/* ============ Locked Panel ============ */
function LockedPanel({ label }: { label: string }) {
  return <div className="flex h-full flex-col items-center justify-center gap-3 text-center p-8"><Lock className="h-10 w-10 text-muted-foreground" /><p className="text-sm text-muted-foreground">{label}</p></div>
}

/* ============ Quran Board (Center Panel) ============ */
function QuranBoard(props: {
  page: LibraryPage; loading?: boolean
  highlights: Record<string, { color: string; by: string }>
  hoveredWord?: string | null
  strokes: Stroke[]
  tool: Tool; color: typeof HIGHLIGHT_COLORS[0]; penColor: string; penSize: number
  onWordClick: (wordId: string) => void; onWordHover?: (wordId: string) => void
  onStroke: (s: Stroke) => void
  pointer: { userId: string; x: number; y: number } | null
  onPointerMove: (x: number, y: number) => void
  accentColor: string; borderColor: string; whiteboardOnly?: boolean
  fontFamily?: string; fontSizeClass?: string
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const drawingRef = React.useRef(false)
  const currentStrokeRef = React.useRef<Stroke | null>(null)

  React.useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }) }, [props.page.id])

  React.useEffect(() => {
    const canvas = canvasRef.current; const container = containerRef.current
    if (!canvas || !container) return
    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr
    canvas.style.width = rect.width + 'px'; canvas.style.height = rect.height + 'px'
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, rect.width, rect.height)
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    for (const stroke of props.strokes) {
      if (stroke.points.length < 2) continue
      ctx.beginPath(); ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
      ctx.strokeStyle = stroke.color; ctx.lineWidth = stroke.size
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
      for (let i = 1; i < stroke.points.length; i++) ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
      ctx.stroke()
    }
    ctx.globalCompositeOperation = 'source-over'
  }, [props.strokes, props.page.id])

  const getPos = (e: React.PointerEvent) => { const rect = containerRef.current!.getBoundingClientRect(); return { x: e.clientX - rect.left, y: e.clientY - rect.top } }
  const onPointerDown = (e: React.PointerEvent) => {
    if (props.tool === 'highlight') return
    if (props.tool === 'pointer') { const p = getPos(e); props.onPointerMove(p.x, p.y); return }
    drawingRef.current = true
    currentStrokeRef.current = { id: Math.random().toString(36).slice(2), tool: props.tool, color: props.tool === 'eraser' ? '#000' : props.penColor, size: props.tool === 'eraser' ? 20 : props.penSize, points: [getPos(e)] }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (props.tool === 'pointer' && e.buttons === 1) { const p = getPos(e); props.onPointerMove(p.x, p.y); return }
    if (!drawingRef.current || !currentStrokeRef.current) return
    const p = getPos(e); currentStrokeRef.current.points.push(p)
    const ctx = canvasRef.current!.getContext('2d')!; const pts = currentStrokeRef.current.points
    if (pts.length >= 2) {
      ctx.beginPath(); ctx.globalCompositeOperation = currentStrokeRef.current.tool === 'eraser' ? 'destination-out' : 'source-over'
      ctx.strokeStyle = currentStrokeRef.current.color; ctx.lineWidth = currentStrokeRef.current.size; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y); ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y); ctx.stroke()
      ctx.globalCompositeOperation = 'source-over'
    }
  }
  const onPointerUp = () => { if (drawingRef.current && currentStrokeRef.current && (currentStrokeRef.current.points?.length ?? 0) > 1) props.onStroke(currentStrokeRef.current); drawingRef.current = false; currentStrokeRef.current = null }

  const cursorClass = props.tool === 'pen' ? 'cursor-crosshair' : props.tool === 'eraser' ? 'cursor-cell' : props.tool === 'pointer' ? 'cursor-pointer' : 'cursor-text'

  return (
    <div ref={scrollRef} className="relative h-full overflow-y-auto scrollbar-quran p-2 sm:p-4">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl p-1 shadow-xl" style={{ background: 'linear-gradient(to bottom, oklch(0.99 0.01 60), oklch(0.97 0.01 60))' }}>
          {/* Elegant gold/blue border */}
          <div className="rounded-xl p-1" style={{ border: `2px solid ${props.accentColor}66` }}>
            <div className="rounded-lg bg-white" style={{ border: `1px solid ${props.borderColor}` }}>
              {/* Header */}
              {!props.whiteboardOnly && (
                <div className="flex items-center justify-between border-b px-3 py-1.5" style={{ borderColor: props.borderColor }}>
                  {props.page.type === 'qaida' ? (
                    <><span className="font-arabic text-xs" dir="rtl">{props.page.lessonTitleArabic}</span><span className="text-[10px] font-semibold uppercase text-gray-600">Qaida · Lesson {props.page.lessonNumber}</span></>
                  ) : (
                    <><span className="font-arabic text-xs" dir="rtl">{props.page.surahArabic}</span><span className="text-[10px] font-semibold uppercase text-gray-600">{props.page.surah} · Ayah {props.page.ayahRange}{props.page.juz && <span className="text-gray-400"> · Juz {props.page.juz}</span>}</span></>
                  )}
                </div>
              )}

              {/* Content */}
              <div ref={containerRef} className={cn('relative select-none', cursorClass)} style={{ minHeight: '200px' }}>
                {props.loading ? (
                  <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-sm text-muted-foreground">Loading Quran text…</p></div>
                ) : props.whiteboardOnly ? (
                  <div className="flex min-h-[200px] items-center justify-center p-8">
                    <div className="text-center">
                      <PenTool className="mx-auto h-10 w-10 text-gray-400" />
                      <p className="mt-3 text-sm text-gray-500">White Board — use the drawing tools in the toolbar above</p>
                      <p className="mt-1 text-xs text-gray-400">Select Pen or Eraser and draw on this canvas</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative z-10 px-4 py-6" dir="rtl">
                      {props.page.bismillah && <div className="mb-4 text-center text-xl text-gray-800 sm:text-2xl" style={{ fontFamily: props.fontFamily || "'Amiri', serif" }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>}
                      <div className="space-y-3">
                        {props.page.lines.map((line, li) => (
                          <div key={li} className={cn('flex flex-wrap justify-center gap-x-0.5 gap-y-1 leading-loose text-gray-800', props.fontSizeClass || 'text-2xl sm:text-3xl')} style={{ fontFamily: props.fontFamily || "'Amiri', serif" }}>
                            {line.words.map((w) => {
                              const hl = props.highlights[w.id]; const isHovered = props.hoveredWord === w.id; const isAyahMarker = w.id.endsWith('-end')
                              if (isAyahMarker) return <span key={w.id} className="mx-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold align-middle" style={{ border: `1px solid ${props.accentColor}80`, color: props.accentColor }}>{w.text}</span>
                              const tooltip = [w.transliteration, w.translation].filter(Boolean).join(' — ')
                              return (
                                <span key={w.id} id={`word_${w.id}`} title={tooltip || undefined}
                                  onClick={() => props.tool === 'highlight' && props.onWordClick(w.id)}
                                  onMouseEnter={() => { props.onWordHover?.(w.id) }}
                                  className={cn('relative rounded px-0.5 py-0.5 transition', props.tool === 'highlight' && 'cursor-pointer')}
                                  style={{
                                    fontFamily: props.fontFamily || "'Amiri', serif",
                                    background: hl ? hl.color : isHovered ? 'rgba(135, 206, 250, 0.5)' : undefined,
                                  }}
                                >
                                  {w.text}
                                </span>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                    <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ touchAction: 'none', zIndex: 5 }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp} />
                    {props.pointer && <div className="pointer-events-none absolute z-10 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center" style={{ left: props.pointer.x, top: props.pointer.y }}><MousePointer2 className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow" /></div>}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper for Label component (to avoid importing separately)
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={cn('block', className)}>{children}</label>
}

/* ============ White Board (dedicated drawing canvas) ============ */
function WhiteBoard(props: {
  strokes: Stroke[]
  tool: Tool
  penColor: string
  penSize: number
  onStroke: (s: Stroke) => void
  pointer: { userId: string; x: number; y: number } | null
  onPointerMove: (x: number, y: number) => void
  accentColor: string
  borderColor: string
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const drawingRef = React.useRef(false)
  const currentStrokeRef = React.useRef<Stroke | null>(null)

  // Render strokes on canvas
  React.useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const stroke of props.strokes) {
      if (stroke.points.length < 2) continue
      ctx.beginPath()
      ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.size
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
      for (let i = 1; i < stroke.points.length; i++) ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
      ctx.stroke()
    }
    ctx.globalCompositeOperation = 'source-over'
  }, [props.strokes])

  const getPos = (e: React.PointerEvent) => {
    const rect = containerRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (props.tool === 'highlight' || props.tool === 'pointer') return
    drawingRef.current = true
    const p = getPos(e)
    currentStrokeRef.current = {
      id: Math.random().toString(36).slice(2),
      tool: props.tool,
      color: props.tool === 'eraser' ? '#000' : props.penColor,
      size: props.tool === 'eraser' ? 20 : props.penSize,
      points: [p],
    }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (props.tool === 'pointer' && e.buttons === 1) {
      const p = getPos(e)
      props.onPointerMove(p.x, p.y)
      return
    }
    if (!drawingRef.current || !currentStrokeRef.current) return
    const p = getPos(e)
    currentStrokeRef.current.points.push(p)
    // Live draw
    const ctx = canvasRef.current!.getContext('2d')!
    const pts = currentStrokeRef.current.points
    if (pts.length >= 2) {
      ctx.beginPath()
      ctx.globalCompositeOperation = currentStrokeRef.current.tool === 'eraser' ? 'destination-out' : 'source-over'
      ctx.strokeStyle = currentStrokeRef.current.color
      ctx.lineWidth = currentStrokeRef.current.size
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y)
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
      ctx.stroke()
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  const onPointerUp = () => {
    if (drawingRef.current && currentStrokeRef.current && (currentStrokeRef.current.points?.length ?? 0) > 1) {
      props.onStroke(currentStrokeRef.current)
    }
    drawingRef.current = false
    currentStrokeRef.current = null
  }

  const cursorClass = props.tool === 'pen' ? 'cursor-crosshair' : props.tool === 'eraser' ? 'cursor-cell' : 'cursor-default'

  return (
    <div className="h-full overflow-y-auto scrollbar-quran p-2 sm:p-4">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl p-1 shadow-xl" style={{ background: 'linear-gradient(to bottom, oklch(0.99 0.01 60), oklch(0.97 0.01 60))' }}>
          <div className="rounded-xl p-1" style={{ border: `2px solid ${props.accentColor}66` }}>
            <div className="rounded-lg bg-white" style={{ border: `1px solid ${props.borderColor}` }}>
              {/* Header */}
              <div className="flex items-center justify-between border-b px-3 py-1.5" style={{ borderColor: props.borderColor }}>
                <span className="text-[10px] font-semibold uppercase text-gray-600">White Board</span>
                <span className="text-[9px] text-gray-400">
                  {props.tool === 'pen' && 'Pen mode — draw freely'}
                  {props.tool === 'eraser' && 'Eraser mode — erase drawings'}
                  {props.tool === 'pointer' && 'Pointer mode — move cursor'}
                  {props.tool === 'highlight' && 'Switch to Pen tool to draw'}
                </span>
              </div>

              {/* Drawing canvas — takes full available space */}
              <div
                ref={containerRef}
                className={cn('relative w-full', cursorClass)}
                style={{ minHeight: '400px', height: 'calc(100vh - 64px - 48px - 48px - 100px)' }}
              >
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 h-full w-full"
                  style={{ touchAction: 'none' }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerLeave={onPointerUp}
                />

                {/* Empty state hint */}
                {props.strokes.length === 0 && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <PenTool className="h-10 w-10 text-gray-300" />
                    <p className="mt-3 text-sm text-gray-400">Select Pen or Eraser from the toolbar above to start drawing</p>
                  </div>
                )}

                {/* Remote pointer */}
                {props.pointer && (
                  <div
                    className="pointer-events-none absolute z-10 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                    style={{ left: props.pointer.x, top: props.pointer.y }}
                  >
                    <MousePointer2 className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

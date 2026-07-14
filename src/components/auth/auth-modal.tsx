'use client'

import * as React from 'react'
import { useAppStore, type Role } from '@/lib/store'
import { usePlans } from '@/lib/queries'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { QtuorLogoLockup } from '@/components/brand/logo'
import { IslamicPatternBand, StarMedallion } from '@/components/brand/patterns'
import { LegalAgreementGate } from '@/components/auth/legal-agreement-gate'
import {
  GraduationCap, Loader2, User, Check, ChevronLeft, ChevronRight, BookOpen,
  Sparkles, Brain, Languages, ShieldCheck, Award, BookOpenCheck, Phone, Globe,
  CreditCard, Star, Calendar, Target, Video, Clock, Users, Heart, Upload, Lock,
  BookOpenText, X, FileText, IdCard, FileCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Step = 1 | 2 | 3

const SUBJECT_OPTIONS = ['Noorani Qaida', 'Quran Recitation With Tajweed', 'Hifz', 'Arabic Language', 'Tafsir', 'Islamic Studies']
const GOAL_OPTIONS = [
  { key: 'Noorani Qaida', label: 'Noorani Qaida', icon: BookOpen },
  { key: 'Quran Recitation With Tajweed', label: 'Quran Recitation with Tajweed', icon: Sparkles },
  { key: 'Hifz', label: 'Hifz (Memorization)', icon: Brain },
  { key: 'Arabic Language', label: 'Arabic Language', icon: Languages },
]
const TEACHING_STYLES = ['Patient & gentle', 'Structured & methodical', 'Interactive & engaging', 'Traditional one-on-one', 'Child-friendly']

const TIMEZONES = [
  'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6', 'UTC-5', 'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1', 'UTC+0',
  'UTC+1', 'UTC+2', 'UTC+3', 'UTC+3:30', 'UTC+4', 'UTC+5', 'UTC+5:30', 'UTC+5:45', 'UTC+6', 'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12',
]

// Auto-detect timezone
function detectTimezone(): string {
  try {
    const offset = -new Date().getTimezoneOffset()
    const hours = Math.floor(Math.abs(offset) / 60)
    const mins = Math.abs(offset) % 60
    const sign = offset >= 0 ? '+' : '-'
    return `UTC${sign}${hours}${mins ? ':' + String(mins).padStart(2, '0') : ''}`
  } catch {
    return 'UTC+0'
  }
}

const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif)$/i
function isImageUrl(url: string): boolean { return IMAGE_EXT_RE.test(url) }
function fileNameFromUrl(url: string): string {
  try { return decodeURIComponent(url.split('/').pop() || url) } catch { return url }
}

async function uploadTutorDoc(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch('/api/upload/tutor-doc', { method: 'POST', body: fd })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data.url as string
}

export function AuthModal() {
  const { authOpen, authMode, authRoleLock, closeAuth, setUser, setView, setSelectedPlanId, setCheckoutOpen } = useAppStore()
  const [mode, setMode] = React.useState<'login' | 'register'>(authMode)
  const [role, setRole] = React.useState<Role>('STUDENT')
  const [step, setStep] = React.useState<Step>(1)
  const [loading, setLoading] = React.useState(false)
  const [tutorSubmitted, setTutorSubmitted] = React.useState(false)

  // Legal Agreement Gate state (tutor step-3 submit gate)
  const [showLegalGate, setShowLegalGate] = React.useState(false)
  const [legalScrolled, setLegalScrolled] = React.useState(false)
  const [legalAccepted, setLegalAccepted] = React.useState(false)

  // Login form
  const [loginEmail, setLoginEmail] = React.useState('')
  const [loginPw, setLoginPw] = React.useState('')
  const [loginRole, setLoginRole] = React.useState<'STUDENT' | 'TUTOR'>('STUDENT')

  // Register form
  const [reg, setReg] = React.useState({
    name: '', email: '', password: '', phone: '', country: '',
    // Student
    ageBracket: '' as 'kids' | 'adults' | '',
    goals: [] as string[],
    preferredTutorGender: '' as 'any' | 'female' | 'male' | '',
    timezone: detectTimezone(),
    // Tutor
    tutorGender: '' as 'male' | 'female' | '',
    bio: '', specialties: [] as string[], languages: [] as string[],
    perClassRate: 6, experienceYears: 1, nativeArabic: false, hafiz: false,
    ijazaCertified: false, teachingStyle: '', videoUrl: '',
    idDocumentUrl: '', certificateUrls: [] as string[],
  })

  // Upload state — tutor document uploads (step 3)
  const [uploadingId, setUploadingId] = React.useState(false)
  const [uploadingCert, setUploadingCert] = React.useState(false)
  const idFileInputRef = React.useRef<HTMLInputElement>(null)
  const certFileInputRef = React.useRef<HTMLInputElement>(null)

  // Student step 3: plan
  const [chosenPlanId, setChosenPlanId] = React.useState<string | null>(null)
  const { data: plansData } = usePlans()
  const plans = plansData?.plans || []

  React.useEffect(() => {
    if (authOpen) {
      setMode(authMode)
      setTutorSubmitted(false)
      setShowLegalGate(false)
      setLegalScrolled(false)
      setLegalAccepted(false)
      if (authRoleLock) { setRole(authRoleLock); setStep(2) }
      else { setStep(1); setRole('STUDENT') }
      setChosenPlanId(null)
    }
  }, [authOpen, authMode, authRoleLock])

  // Password strength
  const pwStrength = React.useMemo(() => {
    const pw = reg.password
    if (!pw) return { score: 0, label: '', color: '' }
    let score = 0
    if (pw.length >= 6) score++
    if (pw.length >= 10) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
    const colors = ['', '#EF4444', '#F59E0B', '#EAB308', '#22C55E', '#16A34A']
    return { score, label: labels[score], color: colors[score] }
  }, [reg.password])

  // ---- LOGIN ----
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: loginEmail, password: loginPw }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      setUser(data); closeAuth()
      toast.success(`Welcome back, ${data.name.split(' ')[0]}!`)
      if (data.role === 'STUDENT') setView('student-dashboard')
      else if (data.role === 'TUTOR') setView('tutor-dashboard')
      else if (data.role === 'ADMIN') setView('admin')
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  // ---- REGISTER ----
  const handleRegister = async () => {
    setLoading(true)
    try {
      const payload: any = { name: reg.name, email: reg.email, password: reg.password, role, country: reg.country, phone: reg.phone }
      if (role === 'STUDENT') {
        Object.assign(payload, {
          gender: reg.preferredTutorGender === 'female' ? 'female' : reg.preferredTutorGender === 'male' ? 'male' : undefined,
          preferredLanguage: 'English',
          timezone: reg.timezone,
          learningGoals: reg.goals.join(', '),
        })
      } else {
        Object.assign(payload, {
          gender: reg.tutorGender || undefined,
          timezone: reg.timezone,
          bio: reg.bio || 'New tutor on Qtuor.',
          specialties: reg.specialties.length ? reg.specialties.join(',') : 'Noorani Qaida,Quran Recitation With Tajweed',
          languages: reg.languages.length ? reg.languages.join(',') : 'Arabic,English',
          perClassRate: Number(reg.perClassRate), nativeArabic: reg.nativeArabic, hafiz: reg.hafiz,
          ijazaCertified: reg.ijazaCertified, experienceYears: Number(reg.experienceYears),
          teachingStyle: reg.teachingStyle || undefined, videoUrl: reg.videoUrl || undefined,
          idDocumentUrl: reg.idDocumentUrl || undefined,
          certificateUrls: reg.certificateUrls.length ? reg.certificateUrls : undefined,
        })
      }
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      setUser(data); closeAuth()

      if (role === 'TUTOR') {
        // Fire-and-forget: log the legal agreement acceptance now that the
        // session cookie is set (register endpoint calls setSession).
        try {
          await fetch('/api/tutor-legal/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agreementVersion: 'v1.0' }),
          })
        } catch (err) {
          console.warn('Failed to record legal signature:', err)
        }
        setTutorSubmitted(true)
        toast.success('Application submitted! Pending admin approval.')
        setView('tutor-dashboard')
      } else {
        if (chosenPlanId) {
          toast.success(`Welcome to Qtuor, ${data.name.split(' ')[0]}!`)
          setSelectedPlanId(chosenPlanId)
          setTimeout(() => setCheckoutOpen(true), 350)
          setView('plans')
        } else {
          toast.success(`Welcome to Qtuor, ${data.name.split(' ')[0]}!`)
          setView('plans')
        }
      }
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const fillDemo = (kind: 'student' | 'tutor' | 'admin') => {
    const creds = { student: { email: 'student@qtuor.com', pw: 'student123' }, tutor: { email: 'abdullah@qtuor.com', pw: 'tutor123' }, admin: { email: 'admin@qtuor.com', pw: 'admin123' } }[kind]
    setLoginEmail(creds.email); setLoginPw(creds.pw)
    toast.info(`Demo ${kind} credentials filled.`)
  }

  const isLocked = !!authRoleLock
  const displayStep = isLocked ? (step === 1 ? 2 : step) : step
  const totalSteps = isLocked ? 2 : 3

  const toggleArray = (field: 'goals' | 'specialties' | 'languages', value: string) => {
    setReg((prev) => { const arr = prev[field]; return { ...prev, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] } })
  }

  const step2Valid = reg.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(reg.email) && reg.password.length >= 6 && reg.phone.trim().length >= 5

  return (
    <Dialog open={authOpen} onOpenChange={(o) => (o ? null : closeAuth())}>
      <DialogContent className="max-w-5xl overflow-hidden p-0" style={{ height: '90vh', maxHeight: '800px' }}>
        <div className="flex h-full" style={{ minHeight: '600px' }}>
          {/* ===== LEFT PANEL: Form (50%) ===== */}
          <div className="flex w-1/2 flex-col overflow-y-auto scrollbar-quran bg-white">
            {/* Logo + step indicator */}
            <div className="flex flex-col items-center pt-8 pb-2">
              <QtuorLogoLockup size="md" />
              <div className="mt-3 flex items-center gap-2">
                {!tutorSubmitted && [1, 2, 3].slice(0, isLocked ? 2 : 3).map((s) => {
                  const actualStep = isLocked ? s + 1 : s
                  return (
                    <React.Fragment key={s}>
                      <div className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition', step >= actualStep ? 'bg-[oklch(0.34_0.13_256)] text-white' : 'bg-muted text-muted-foreground')}>
                        {step > actualStep ? <Check className="h-4 w-4" /> : isLocked ? s : s}
                      </div>
                      {s < (isLocked ? 2 : 3) && <div className={cn('h-0.5 w-6 rounded', step > actualStep ? 'bg-[oklch(0.34_0.13_256)]' : 'bg-muted')} />}
                    </React.Fragment>
                  )
                })}
              </div>
              <div className="mt-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {mode === 'login' ? 'Sign in' : tutorSubmitted ? 'Application Submitted' : `Step ${displayStep} of ${totalSteps}`}
              </div>
            </div>

            <div className="flex-1 px-8 pb-8">
              {/* ===== LOGIN ===== */}
              {mode === 'login' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-2xl font-extrabold text-[oklch(0.34_0.13_256)]">Welcome back</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Sign in to continue your Quran journey.</p>
                  </div>

                  {/* Login role tabs */}
                  <div className="flex gap-2 rounded-lg border border-border p-1">
                    <button onClick={() => setLoginRole('STUDENT')} className={cn('flex-1 rounded-md py-2 text-sm font-semibold transition', loginRole === 'STUDENT' ? 'bg-[oklch(0.34_0.13_256)] text-white' : 'text-muted-foreground hover:bg-muted')}>
                      <User className="mr-1.5 inline h-4 w-4" /> Student
                    </button>
                    <button onClick={() => setLoginRole('TUTOR')} className={cn('flex-1 rounded-md py-2 text-sm font-semibold transition', loginRole === 'TUTOR' ? 'bg-[oklch(0.34_0.13_256)] text-white' : 'text-muted-foreground hover:bg-muted')}>
                      <GraduationCap className="mr-1.5 inline h-4 w-4" /> Tutor
                    </button>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="le" className="text-xs font-semibold">Email</Label>
                      <Input id="le" type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lp" className="text-xs font-semibold">Password</Label>
                      <Input id="lp" type="password" required value={loginPw} onChange={(e) => setLoginPw(e.target.value)} placeholder="••••••••" />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-[oklch(0.34_0.13_256)] text-white hover:bg-[oklch(0.28_0.13_258)]">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Sign in as {loginRole === 'STUDENT' ? 'Student' : 'Tutor'}
                    </Button>
                  </form>

                  <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3">
                    <p className="text-[10px] font-medium text-muted-foreground">Try a demo:</p>
                    <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => fillDemo('student')} className="text-[10px]">Student</Button>
                      <Button size="sm" variant="outline" onClick={() => fillDemo('tutor')} className="text-[10px]">Tutor</Button>
                      <Button size="sm" variant="outline" onClick={() => fillDemo('admin')} className="text-[10px]">Admin</Button>
                    </div>
                  </div>

                  <p className="text-center text-xs text-muted-foreground">
                    Don't have an account?{' '}
                    <button onClick={() => setMode('register')} className="font-semibold text-[oklch(0.34_0.13_256)] hover:underline">Sign up</button>
                  </p>
                </div>
              )}

              {/* ===== REGISTER ===== */}
              {mode === 'register' && !tutorSubmitted && (
                <form onSubmit={(e) => {
                  e.preventDefault()
                  if (step < 3) { setStep((s) => (s < 3 ? ((s + 1) as Step) : s)); return }
                  // Tutor gate: require the legal agreement screen before the
                  // registration POST is allowed to fire.
                  if (role === 'TUTOR' && !showLegalGate) {
                    setShowLegalGate(true)
                    setLegalScrolled(false)
                    setLegalAccepted(false)
                    return
                  }
                  handleRegister()
                }} className="space-y-4">

                  {/* Step 1: Role selection (skipped if locked) */}
                  {step === 1 && !isLocked && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h2 className="text-2xl font-extrabold text-[oklch(0.34_0.13_256)]">Join Qtuor</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Choose your path to get started.</p>
                      </div>
                      <button type="button" onClick={() => setRole('STUDENT')} className={cn('flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition', role === 'STUDENT' ? 'border-[oklch(0.34_0.13_256)] bg-[oklch(0.62_0.14_230/0.05)]' : 'border-border hover:border-[oklch(0.62_0.14_230/0.4)]')}>
                        <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', role === 'STUDENT' ? 'bg-[oklch(0.34_0.13_256)] text-white' : 'bg-muted text-muted-foreground')}><User className="h-6 w-6" /></span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">I{"'"}m a Student</span>
                            {role === 'STUDENT' && <Check className="h-4 w-4 text-[oklch(0.34_0.13_256)]" />}
                          </div>
                          <p className="text-xs text-muted-foreground">Learn Quran with certified tutors worldwide.</p>
                        </div>
                      </button>
                      <button type="button" onClick={() => setRole('TUTOR')} className={cn('flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition', role === 'TUTOR' ? 'border-[oklch(0.34_0.13_256)] bg-[oklch(0.62_0.14_230/0.05)]' : 'border-border hover:border-[oklch(0.62_0.14_230/0.4)]')}>
                        <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', role === 'TUTOR' ? 'bg-[oklch(0.34_0.13_256)] text-white' : 'bg-muted text-muted-foreground')}><GraduationCap className="h-6 w-6" /></span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">I{"'"}m a Tutor</span>
                            {role === 'TUTOR' && <Check className="h-4 w-4 text-[oklch(0.34_0.13_256)]" />}
                          </div>
                          <p className="text-xs text-muted-foreground">Teach & earn per class. $10 verification fee applies.</p>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Step 2: Account Creation */}
                  {step === 2 && (
                    <div className="space-y-3">
                      <h2 className="text-xl font-extrabold text-[oklch(0.34_0.13_256)]">{role === 'TUTOR' ? 'Tutor Application' : 'Create your account'}</h2>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Full Name <span className="text-destructive">*</span></Label>
                        <Input required value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} placeholder="e.g. Ahmed Khan" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Email <span className="text-destructive">*</span></Label>
                          <Input type="email" required value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} placeholder="you@example.com" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Password <span className="text-destructive">*</span></Label>
                          <Input type="password" required value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} placeholder="Min 6 characters" />
                        </div>
                      </div>
                      {/* Password strength meter */}
                      {reg.password && (
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= pwStrength.score ? pwStrength.color : '#E5E7EB' }} />
                          ))}
                          <span className="text-[10px] font-medium" style={{ color: pwStrength.color }}>{pwStrength.label}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">WhatsApp Number <span className="text-destructive">*</span></Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} placeholder="+92 300 1234567" className="pl-9" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Country</Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input value={reg.country} onChange={(e) => setReg({ ...reg, country: e.target.value })} placeholder="e.g. Pakistan" className="pl-9" />
                          </div>
                        </div>
                      </div>

                      {/* Tutor gender (mandatory for tutors) */}
                      {role === 'TUTOR' && (
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Gender <span className="text-destructive">*</span></Label>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setReg({ ...reg, tutorGender: 'male' })} className={cn('flex-1 rounded-lg border-2 py-2 text-sm font-medium transition', reg.tutorGender === 'male' ? 'border-[oklch(0.34_0.13_256)] bg-[oklch(0.34_0.13_256/0.05)]' : 'border-border')}>
                              Male
                            </button>
                            <button type="button" onClick={() => setReg({ ...reg, tutorGender: 'female' })} className={cn('flex-1 rounded-lg border-2 py-2 text-sm font-medium transition', reg.tutorGender === 'female' ? 'border-[oklch(0.34_0.13_256)] bg-[oklch(0.34_0.13_256/0.05)]' : 'border-border')}>
                              Female
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Timezone */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Timezone <span className="text-[10px] text-muted-foreground">(auto-detected)</span></Label>
                        <select value={reg.timezone} onChange={(e) => setReg({ ...reg, timezone: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                          {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                        </select>
                      </div>

                      {/* Tutor brief bio + teaching style */}
                      {role === 'TUTOR' && (
                        <>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Brief Bio</Label>
                            <Textarea rows={2} value={reg.bio} onChange={(e) => setReg({ ...reg, bio: e.target.value })} placeholder="Tell students about your teaching style..." />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">Teaching Style</Label>
                              <select value={reg.teachingStyle} onChange={(e) => setReg({ ...reg, teachingStyle: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                                <option value="">Select</option>
                                {TEACHING_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">Per-class rate ($)</Label>
                              <Input type="number" value={reg.perClassRate} onChange={(e) => setReg({ ...reg, perClassRate: Number(e.target.value) })} />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Step 3: Student (Learning Profile + Plan) / Tutor (Verification) */}
                  {step === 3 && role === 'STUDENT' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-extrabold text-[oklch(0.34_0.13_256)]">Learning Profile</h2>

                      {/* Age bracket */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Age Bracket</Label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setReg({ ...reg, ageBracket: 'kids' })} className={cn('flex-1 rounded-lg border-2 py-2 text-sm font-medium transition', reg.ageBracket === 'kids' ? 'border-[oklch(0.34_0.13_256)] bg-[oklch(0.34_0.13_256/0.05)]' : 'border-border')}>
                            Kids (under 13)
                          </button>
                          <button type="button" onClick={() => setReg({ ...reg, ageBracket: 'adults' })} className={cn('flex-1 rounded-lg border-2 py-2 text-sm font-medium transition', reg.ageBracket === 'adults' ? 'border-[oklch(0.34_0.13_256)] bg-[oklch(0.34_0.13_256/0.05)]' : 'border-border')}>
                            Adults (13+)
                          </button>
                        </div>
                      </div>

                      {/* Learning goals */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Learning Goals <span className="text-muted-foreground">(select all that apply)</span></Label>
                        <div className="flex flex-wrap gap-1.5">
                          {GOAL_OPTIONS.map((g) => {
                            const active = reg.goals.includes(g.key)
                            const Icon = g.icon
                            return (
                              <button key={g.key} type="button" onClick={() => toggleArray('goals', g.key)} className={cn('inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition', active ? 'border-[oklch(0.34_0.13_256)] bg-[oklch(0.34_0.13_256)] text-white' : 'border-border hover:border-[oklch(0.62_0.14_230/0.5)]')}>
                                <Icon className="h-3 w-3" /> {g.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Preferred tutor gender */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Preferred Tutor Gender</Label>
                        <div className="flex gap-2">
                          {(['any', 'female', 'male'] as const).map((g) => (
                            <button key={g} type="button" onClick={() => setReg({ ...reg, preferredTutorGender: g })} className={cn('flex-1 rounded-lg border-2 py-2 text-sm font-medium transition', reg.preferredTutorGender === g ? 'border-[oklch(0.34_0.13_256)] bg-[oklch(0.34_0.13_256/0.05)]' : 'border-border')}>
                              {g === 'any' ? 'No Preference' : g === 'female' ? 'Female Only' : 'Male Only'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Plan selection */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Choose a Plan <span className="text-muted-foreground">(optional — skip for now)</span></Label>
                        <div className="max-h-40 space-y-1.5 overflow-y-auto scrollbar-quran">
                          {plans.slice(0, 6).map((p) => (
                            <button key={p.id} type="button" onClick={() => setChosenPlanId(chosenPlanId === p.id ? null : p.id)} className={cn('flex w-full items-center gap-2 rounded-lg border-2 p-2 text-left transition', chosenPlanId === p.id ? 'border-[oklch(0.34_0.13_256)] bg-[oklch(0.34_0.13_256/0.03)]' : 'border-border hover:border-[oklch(0.62_0.14_230/0.4)]')}>
                              <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2', chosenPlanId === p.id ? 'border-[oklch(0.34_0.13_256)] bg-[oklch(0.34_0.13_256)]' : 'border-border')}>
                                {chosenPlanId === p.id && <Check className="h-2.5 w-2.5 text-white" />}
                              </span>
                              <span className="flex-1 text-xs font-semibold">{p.category} — {p.name}</span>
                              <span className="text-xs font-bold text-[oklch(0.34_0.13_256)]">${p.monthlyPrice}/mo</span>
                            </button>
                          ))}
                        </div>
                        <button type="button" onClick={() => setChosenPlanId(null)} className={cn('w-full rounded-lg border border-dashed border-border py-1.5 text-xs text-muted-foreground transition hover:bg-muted', chosenPlanId === null && 'border-[oklch(0.34_0.13_256)] text-[oklch(0.34_0.13_256)]')}>
                          Skip for now
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Legal Agreement Gate — replaces the verification form when shown */}
                  {step === 3 && role === 'TUTOR' && showLegalGate && (
                    <LegalAgreementGate
                      legalScrolled={legalScrolled}
                      setLegalScrolled={setLegalScrolled}
                      legalAccepted={legalAccepted}
                      setLegalAccepted={setLegalAccepted}
                      onSubmit={handleRegister}
                      onBack={() => setShowLegalGate(false)}
                      loading={loading}
                    />
                  )}

                  {step === 3 && role === 'TUTOR' && !showLegalGate && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-extrabold text-[oklch(0.34_0.13_256)]">Professional Verification</h2>

                      {/* Specialties */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Specialties <span className="text-destructive">*</span></Label>
                        <div className="flex flex-wrap gap-1.5">
                          {SUBJECT_OPTIONS.map((s) => {
                            const active = reg.specialties.includes(s)
                            return (
                              <button key={s} type="button" onClick={() => toggleArray('specialties', s)} className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition', active ? 'border-[oklch(0.34_0.13_256)] bg-[oklch(0.34_0.13_256)] text-white' : 'border-border')}>
                                {active && <Check className="h-3 w-3" />} {s}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Languages <span className="text-destructive">*</span></Label>
                        <div className="flex flex-wrap gap-1.5">
                          {['Arabic', 'English', 'Urdu', 'Turkish', 'French', 'Malay', 'Hindi', 'Bengali'].map((l) => {
                            const active = reg.languages.includes(l)
                            return (
                              <button key={l} type="button" onClick={() => toggleArray('languages', l)} className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition', active ? 'border-[oklch(0.62_0.14_230)] bg-[oklch(0.62_0.14_230/0.1)] text-[oklch(0.40_0.11_258)]' : 'border-border')}>
                                {active && <Check className="h-3 w-3" />} {l}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Experience (years)</Label>
                          <Input type="number" value={reg.experienceYears} onChange={(e) => setReg({ ...reg, experienceYears: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Video Intro URL <span className="text-muted-foreground">(optional)</span></Label>
                          <div className="relative">
                            <Video className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input value={reg.videoUrl} onChange={(e) => setReg({ ...reg, videoUrl: e.target.value })} placeholder="YouTube link" className="pl-9" />
                          </div>
                        </div>
                      </div>

                      {/* Document uploads */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">Document Uploads <span className="text-muted-foreground">(optional but recommended for faster approval)</span></Label>

                        {/* Hidden file inputs */}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          ref={idFileInputRef}
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            e.target.value = ''
                            if (!file) return
                            setUploadingId(true)
                            try {
                              const url = await uploadTutorDoc(file)
                              setReg((p) => ({ ...p, idDocumentUrl: url }))
                              toast.success('ID document uploaded')
                            } catch (err: any) { toast.error(err.message || 'Upload failed') }
                            finally { setUploadingId(false) }
                          }}
                        />
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          ref={certFileInputRef}
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            e.target.value = ''
                            if (!file) return
                            setUploadingCert(true)
                            try {
                              const url = await uploadTutorDoc(file)
                              setReg((p) => ({ ...p, certificateUrls: [...p.certificateUrls, url] }))
                              toast.success('Certificate uploaded')
                            } catch (err: any) { toast.error(err.message || 'Upload failed') }
                            finally { setUploadingCert(false) }
                          }}
                        />

                        {/* National ID / Passport */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                            <IdCard className="h-3.5 w-3.5" /> National ID / Passport
                          </div>
                          {reg.idDocumentUrl ? (
                            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2">
                              {isImageUrl(reg.idDocumentUrl) ? (
                                <img src={reg.idDocumentUrl} alt="ID document" className="h-10 w-10 rounded object-cover" />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded bg-[oklch(0.58_0.24_27/0.08)]"><FileText className="h-5 w-5 text-[oklch(0.50_0.20_27)]" /></div>
                              )}
                              <span className="flex-1 truncate text-[11px] text-foreground">{fileNameFromUrl(reg.idDocumentUrl)}</span>
                              <button type="button" onClick={() => setReg((p) => ({ ...p, idDocumentUrl: '' }))} className="text-muted-foreground transition hover:text-destructive" aria-label="Remove ID document">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : uploadingId ? (
                            <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-border p-2.5 text-xs text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => idFileInputRef.current?.click()}
                              className="flex w-full items-center gap-2 rounded-lg border-2 border-dashed border-border p-2.5 text-xs text-muted-foreground transition hover:border-[oklch(0.34_0.13_256)]/50 hover:bg-muted/40 hover:text-foreground"
                            >
                              <Upload className="h-4 w-4" /> Click to upload image or PDF (max 10MB)
                            </button>
                          )}
                        </div>

                        {/* Certificates & Degrees (multiple) */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                            <FileCheck className="h-3.5 w-3.5" /> Certificates &amp; Degrees
                          </div>
                          {reg.certificateUrls.length > 0 && (
                            <div className="space-y-1">
                              {reg.certificateUrls.map((url, i) => (
                                <div key={url + i} className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2">
                                  {isImageUrl(url) ? (
                                    <img src={url} alt={`Certificate ${i + 1}`} className="h-10 w-10 rounded object-cover" />
                                  ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded bg-[oklch(0.58_0.24_27/0.08)]"><FileText className="h-5 w-5 text-[oklch(0.50_0.20_27)]" /></div>
                                  )}
                                  <span className="flex-1 truncate text-[11px] text-foreground">{fileNameFromUrl(url)}</span>
                                  <button
                                    type="button"
                                    onClick={() => setReg((p) => ({ ...p, certificateUrls: p.certificateUrls.filter((_, idx) => idx !== i) }))}
                                    className="text-muted-foreground transition hover:text-destructive"
                                    aria-label={`Remove certificate ${i + 1}`}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {uploadingCert ? (
                            <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-border p-2.5 text-xs text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => certFileInputRef.current?.click()}
                              className="flex w-full items-center gap-2 rounded-lg border-2 border-dashed border-border p-2.5 text-xs text-muted-foreground transition hover:border-[oklch(0.34_0.13_256)]/50 hover:bg-muted/40 hover:text-foreground"
                            >
                              <Upload className="h-4 w-4" /> {reg.certificateUrls.length ? 'Add another certificate' : 'Click to upload certificate (image/PDF, max 10MB)'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Qualifications */}
                      <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-xs font-semibold text-[oklch(0.34_0.13_256)]">Qualifications</p>
                        {([['nativeArabic', 'Native Arabic speaker', Languages], ['hafiz', 'Hafiz of the Quran', BookOpenCheck], ['ijazaCertified', 'Ijaza certified', Award]] as const).map(([key, label, Icon]) => (
                          <label key={key} className="flex cursor-pointer items-center gap-2 text-xs">
                            <input type="checkbox" checked={reg[key] as boolean} onChange={(e) => setReg({ ...reg, [key]: e.target.checked })} className="h-4 w-4 rounded border-border" />
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" /> {label}
                          </label>
                        ))}
                      </div>

                      {/* Fee notice */}
                      <div className="flex items-start gap-2 rounded-lg bg-[oklch(0.78_0.15_85/0.08)] p-3 text-xs text-[oklch(0.55_0.13_75)]">
                        <CreditCard className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>After admin approval, you'll receive a WhatsApp notification to pay the <strong>$10 USD</strong> activation fee to launch your profile.</span>
                      </div>
                    </div>
                  )}

                  {/* Navigation buttons — hidden when the legal gate is open */}
                  {!tutorSubmitted && !showLegalGate && (
                    <div className="flex items-center gap-2 pt-2">
                      {step > (isLocked ? 2 : 1) && (
                        <Button type="button" variant="outline" onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))} disabled={loading} className="gap-1">
                          <ChevronLeft className="h-4 w-4" /> Back
                        </Button>
                      )}
                      {step < 3 ? (
                        <Button type="submit" disabled={(step === 2 && !step2Valid) || loading} className="flex-1 gap-1 bg-[oklch(0.34_0.13_256)] text-white hover:bg-[oklch(0.28_0.13_258)]">
                          Continue <ChevronRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button type="submit" disabled={loading} className="flex-1 gap-1.5 bg-[oklch(0.34_0.13_256)] text-white hover:bg-[oklch(0.28_0.13_258)]">
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          {role === 'TUTOR' ? <><ShieldCheck className="h-4 w-4" /> Submit Application</> : chosenPlanId ? <><CreditCard className="h-4 w-4" /> Create & Subscribe</> : <><User className="h-4 w-4" /> Create Account</>}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Switch to login — hidden when the legal gate is open */}
                  {!showLegalGate && (
                    <p className="text-center text-xs text-muted-foreground">
                      Already have an account?{' '}
                      <button type="button" onClick={() => setMode('login')} className="font-semibold text-[oklch(0.34_0.13_256)] hover:underline">Log in</button>
                    </p>
                  )}
                </form>
              )}

              {/* Tutor submitted screen */}
              {mode === 'register' && tutorSubmitted && (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-extrabold text-[oklch(0.34_0.13_256)]">Application Submitted!</h2>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Thank you for your application. Once our team approves your profile, you will receive a WhatsApp notification to pay your <strong>$10 USD</strong> activation fee and launch your profile.
                  </p>
                  <Button onClick={closeAuth} className="bg-[oklch(0.34_0.13_256)] text-white">Go to Dashboard</Button>
                </div>
              )}
            </div>
          </div>

          {/* ===== RIGHT PANEL: Brand Panel (50%) ===== */}
          <div className="relative flex w-1/2 flex-col items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A192F 0%, #0B2545 50%, #133356 100%)' }}>
            {/* Islamic pattern overlay */}
            <IslamicPatternBand opacity={0.06} />

            {/* Decorative elements */}
            <div className="relative z-10 flex flex-col items-center px-8 text-center text-white">
              <StarMedallion className="mb-6 h-16 w-16 text-[oklch(0.85_0.13_85/0.4)]" />

              <span className="font-arabic text-2xl text-white/80" dir="rtl" style={{ fontFamily: "var(--font-amiri), serif" }}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </span>

              <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Learn the Quran<br />with Certified Tutors
              </h2>

              <p className="mt-4 max-w-sm text-sm text-white/60">
                Join thousands of students worldwide learning Noorani Qaida, Tajweed, Hifz, and Arabic in a real-time interactive virtual classroom.
              </p>

              {/* Feature highlights */}
              <div className="mt-8 space-y-3">
                {[
                  { icon: ShieldCheck, text: 'Verified & Ijaza-certified tutors' },
                  { icon: Video, text: 'Interactive virtual classroom with word-by-word sync' },
                  { icon: Star, text: '4.9/5 average rating from 500+ tutors' },
                  { icon: CreditCard, text: 'Affordable monthly plans starting at $15/month' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-left">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                      <f.icon className="h-4 w-4 text-[oklch(0.85_0.13_85)]" />
                    </span>
                    <span className="text-sm text-white/70">{f.text}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { value: '500+', label: 'Tutors' },
                  { value: '60+', label: 'Countries' },
                  { value: '10K+', label: 'Classes' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl font-extrabold text-white">{s.value}</div>
                    <div className="text-[10px] uppercase tracking-wide text-white/40">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 left-0 right-0 text-center text-[10px] text-white/30">
              © {new Date().getFullYear()} Qtuor · Gateway to Tajweed Excellence
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

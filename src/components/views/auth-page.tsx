'use client'

import * as React from 'react'
import { useAppStore, type Role } from '@/lib/store'
import { usePlans } from '@/lib/queries'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { QtuorLogo, QtuorLogoLockup } from '@/components/brand/logo'
import { IslamicPatternBand, StarMedallion } from '@/components/brand/patterns'
import { LegalAgreementGate } from '@/components/auth/legal-agreement-gate'
import {
  GraduationCap, Loader2, User, Check, ChevronLeft, ChevronRight, BookOpen,
  Sparkles, Brain, Languages, ShieldCheck, Award, BookOpenCheck, Phone, Globe,
  CreditCard, Star, Video, Upload, Lock, X, FileText, IdCard, FileCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Step = 1 | 2 | 3

const GOAL_OPTIONS = [
  { key: 'Noorani Qaida', label: 'Noorani Qaida', icon: BookOpen },
  { key: 'Quran Recitation With Tajweed', label: 'Quran Recitation with Tajweed', icon: Sparkles },
  { key: 'Hifz', label: 'Hifz (Memorization)', icon: Brain },
  { key: 'Arabic Language', label: 'Arabic Language', icon: Languages },
]
const SUBJECT_OPTIONS = ['Noorani Qaida', 'Quran Recitation With Tajweed', 'Hifz', 'Arabic Language', 'Tafsir', 'Islamic Studies']
const TEACHING_STYLES = ['Patient & gentle', 'Structured & methodical', 'Interactive & engaging', 'Traditional one-on-one', 'Child-friendly']
const TIMEZONES = ['UTC-12','UTC-11','UTC-10','UTC-9','UTC-8','UTC-7','UTC-6','UTC-5','UTC-4','UTC-3','UTC-2','UTC-1','UTC+0','UTC+1','UTC+2','UTC+3','UTC+3:30','UTC+4','UTC+5','UTC+5:30','UTC+5:45','UTC+6','UTC+7','UTC+8','UTC+9','UTC+10','UTC+11','UTC+12']

function detectTimezone(): string {
  try {
    const offset = -new Date().getTimezoneOffset()
    const hours = Math.floor(Math.abs(offset) / 60)
    const mins = Math.abs(offset) % 60
    const sign = offset >= 0 ? '+' : '-'
    return `UTC${sign}${hours}${mins ? ':' + String(mins).padStart(2, '0') : ''}`
  } catch { return 'UTC+0' }
}

const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif)$/i
function isImageUrl(url: string): boolean { return IMAGE_EXT_RE.test(url) }
function fileNameFromUrl(url: string): string {
  try { return decodeURIComponent(url.split('/').pop() || url) } catch { return url }
}

/** Upload a single file to /api/upload/tutor-doc and return the public URL. */
async function uploadTutorDoc(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch('/api/upload/tutor-doc', { method: 'POST', body: fd })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data.url as string
}

export function AuthPage() {
  const { authMode, authRoleLock, closeAuth, setUser, setView, setSelectedPlanId, setCheckoutOpen } = useAppStore()
  const [mode, setMode] = React.useState<'login' | 'register'>(authMode)
  const [role, setRole] = React.useState<Role>('STUDENT')
  const [step, setStep] = React.useState<Step>(1)
  const [loading, setLoading] = React.useState(false)
  const [tutorSubmitted, setTutorSubmitted] = React.useState(false)

  // Legal Agreement Gate state (tutor step-3 submit gate)
  const [showLegalGate, setShowLegalGate] = React.useState(false)
  const [legalScrolled, setLegalScrolled] = React.useState(false)
  const [legalAccepted, setLegalAccepted] = React.useState(false)

  const [loginEmail, setLoginEmail] = React.useState('')
  const [loginPw, setLoginPw] = React.useState('')
  const [loginRole, setLoginRole] = React.useState<'STUDENT' | 'TUTOR'>('STUDENT')

  const [reg, setReg] = React.useState({
    name: '', email: '', password: '', phone: '', country: '',
    ageBracket: '' as 'kids' | 'adults' | '',
    goals: [] as string[],
    preferredTutorGender: '' as 'any' | 'female' | 'male' | '',
    timezone: detectTimezone(),
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

  const [chosenPlanId, setChosenPlanId] = React.useState<string | null>(null)
  const { data: plansData } = usePlans()
  const plans = plansData?.plans || []

  React.useEffect(() => {
    setMode(authMode)
    setTutorSubmitted(false)
    setShowLegalGate(false)
    setLegalScrolled(false)
    setLegalAccepted(false)
    if (authRoleLock) { setRole(authRoleLock); setStep(2) }
    else { setStep(1); setRole('STUDENT') }
    setChosenPlanId(null)
  }, [authMode, authRoleLock])

  const pwStrength = React.useMemo(() => {
    const pw = reg.password
    if (!pw) return { score: 0, label: '', color: '' }
    let score = 0
    if (pw.length >= 6) score++; if (pw.length >= 10) score++
    if (/[A-Z]/.test(pw)) score++; if (/[0-9]/.test(pw)) score++; if (/[^A-Za-z0-9]/.test(pw)) score++
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
    const colors = ['', '#EF4444', '#F59E0B', '#EAB308', '#22C55E', '#16A34A']
    return { score, label: labels[score], color: colors[score] }
  }, [reg.password])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
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

  const handleRegister = async () => {
    setLoading(true)
    try {
      const payload: any = { name: reg.name, email: reg.email, password: reg.password, role, country: reg.country, phone: reg.phone }
      if (role === 'STUDENT') {
        Object.assign(payload, { timezone: reg.timezone, learningGoals: reg.goals.join(', '), preferredLanguage: 'English' })
      } else {
        Object.assign(payload, {
          gender: reg.tutorGender || undefined, timezone: reg.timezone,
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
      setUser(data)
      if (role === 'TUTOR') {
        // Fire-and-forget: log the legal agreement acceptance now that the
        // session cookie is set (register endpoint calls setSession). The
        // tutor cannot reach this point without scrolling + checking the box.
        try {
          await fetch('/api/tutor-legal/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agreementVersion: 'v1.0' }),
          })
        } catch (err) {
          // Non-blocking — surface a console warning only.
          console.warn('Failed to record legal signature:', err)
        }
        setTutorSubmitted(true)
        toast.success('Application submitted! Pending admin approval.')
      } else {
        closeAuth()
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
  const toggleArray = (field: 'goals' | 'specialties' | 'languages', value: string) => {
    setReg((prev) => { const arr = prev[field]; return { ...prev, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] } })
  }
  const step2Valid = reg.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(reg.email) && reg.password.length >= 6 && reg.phone.trim().length >= 5

  return (
    <div className="flex" style={{ width: '100vw', minHeight: '100vh' }}>

      {/* ===== LEFT PANEL (40%) — Form ===== */}
      <div className="flex w-[40%] flex-col" style={{ background: '#F8FAFC', minHeight: '100vh' }}>

        {/* Top bar: logo + back button */}
        <div className="flex items-center justify-between px-8 pt-6">
          <QtuorLogoLockup />
          <button onClick={() => closeAuth()} className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Back to home
          </button>
        </div>

        {/* Form area — centered */}
        <div className="flex flex-1 items-start justify-center px-8 py-8 overflow-y-auto">
          <div className="w-full max-w-sm">

            {/* ===== LOGIN ===== */}
            {mode === 'login' && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-extrabold" style={{ color: '#0A192F' }}>Welcome back</h1>
                  <p className="mt-1 text-sm text-muted-foreground">Sign in to continue your Quran journey.</p>
                </div>

                {/* Student/Tutor tabs */}
                <div className="flex gap-1 rounded-xl border border-border p-1">
                  <button onClick={() => setLoginRole('STUDENT')} className={cn('flex-1 rounded-lg py-2.5 text-sm font-semibold transition', loginRole === 'STUDENT' ? 'text-white' : 'text-muted-foreground hover:bg-muted')} style={loginRole === 'STUDENT' ? { background: '#0A192F' } : {}}>
                    <User className="mr-1.5 inline h-4 w-4" /> Student
                  </button>
                  <button onClick={() => setLoginRole('TUTOR')} className={cn('flex-1 rounded-lg py-2.5 text-sm font-semibold transition', loginRole === 'TUTOR' ? 'text-white' : 'text-muted-foreground hover:bg-muted')} style={loginRole === 'TUTOR' ? { background: '#0A192F' } : {}}>
                    <GraduationCap className="mr-1.5 inline h-4 w-4" /> Tutor
                  </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Email</Label>
                    <Input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Password</Label>
                    <Input type="password" required value={loginPw} onChange={(e) => setLoginPw(e.target.value)} placeholder="••••••••" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full text-white" style={{ background: '#0A192F' }}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Sign in as {loginRole === 'STUDENT' ? 'Student' : 'Tutor'}
                  </Button>
                </form>

                <p className="text-center text-xs text-muted-foreground">
                  Don{"'"}t have an account?{' '}
                  <button onClick={() => setMode('register')} className="font-semibold hover:underline" style={{ color: '#0A192F' }}>Sign up</button>
                </p>
              </div>
            )}

            {/* ===== REGISTER ===== */}
            {mode === 'register' && !tutorSubmitted && (
              <div className="space-y-5">
                {/* Step indicator — only for register */}
                {(!isLocked || step > 2) && (
                  <div className="flex items-center justify-center gap-2">
                    {(isLocked ? [2, 3] : [1, 2, 3]).map((s) => (
                      <React.Fragment key={s}>
                        <div className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition', step >= s ? 'text-white' : 'bg-muted text-muted-foreground')} style={step >= s ? { background: '#0A192F' } : {}}>
                          {step > s ? <Check className="h-4 w-4" /> : isLocked ? s - 1 : s}
                        </div>
                        {s < 3 && <div className={cn('h-0.5 w-6 rounded', step > s ? '' : 'bg-muted')} style={step > s ? { background: '#0A192F' } : {}} />}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                <form onSubmit={(e) => {
                  e.preventDefault()
                  if (step < 3) { setStep((s) => ((s + 1) as Step)); return }
                  // Tutor gate: require the legal agreement screen before
                  // the registration POST is allowed to fire.
                  if (role === 'TUTOR' && !showLegalGate) {
                    setShowLegalGate(true)
                    setLegalScrolled(false)
                    setLegalAccepted(false)
                    return
                  }
                  handleRegister()
                }} className="space-y-3">

                  {/* Step 1: Role */}
                  {step === 1 && !isLocked && (
                    <div className="space-y-3">
                      <h1 className="text-2xl font-extrabold" style={{ color: '#0A192F' }}>Join Qtuor</h1>
                      <p className="text-sm text-muted-foreground">Choose your path to get started.</p>
                      <button type="button" onClick={() => setRole('STUDENT')} className={cn('flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition', role === 'STUDENT' ? 'bg-[oklch(0.62_0.14_230/0.05)]' : 'border-border hover:border-[oklch(0.62_0.14_230/0.4)]')} style={role === 'STUDENT' ? { borderColor: '#0A192F' } : {}}>
                        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', role === 'STUDENT' ? 'text-white' : 'bg-muted text-muted-foreground')} style={role === 'STUDENT' ? { background: '#0A192F' } : {}}><User className="h-5 w-5" /></span>
                        <div className="flex-1"><div className="text-sm font-bold">I{"'"}m a Student</div><div className="text-xs text-muted-foreground">Learn Quran with certified tutors.</div></div>
                      </button>
                      <button type="button" onClick={() => setRole('TUTOR')} className={cn('flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition', role === 'TUTOR' ? 'bg-[oklch(0.62_0.14_230/0.05)]' : 'border-border hover:border-[oklch(0.62_0.14_230/0.4)]')} style={role === 'TUTOR' ? { borderColor: '#0A192F' } : {}}>
                        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', role === 'TUTOR' ? 'text-white' : 'bg-muted text-muted-foreground')} style={role === 'TUTOR' ? { background: '#0A192F' } : {}}><GraduationCap className="h-5 w-5" /></span>
                        <div className="flex-1"><div className="text-sm font-bold">I{"'"}m a Tutor</div><div className="text-xs text-muted-foreground">Teach & earn. $10 verification fee.</div></div>
                      </button>
                    </div>
                  )}

                  {/* Step 2: Account */}
                  {step === 2 && (
                    <div className="space-y-3">
                      <h1 className="text-xl font-extrabold" style={{ color: '#0A192F' }}>{role === 'TUTOR' ? 'Tutor Application' : 'Create your account'}</h1>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Full Name <span className="text-destructive">*</span></Label>
                        <Input required value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} placeholder="e.g. Ahmed Khan" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5"><Label className="text-xs font-semibold">Email <span className="text-destructive">*</span></Label><Input type="email" required value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} placeholder="you@example.com" /></div>
                        <div className="space-y-1.5"><Label className="text-xs font-semibold">Password <span className="text-destructive">*</span></Label><Input type="password" required value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} placeholder="Min 6 chars" /></div>
                      </div>
                      {reg.password && <div className="flex items-center gap-1">{[1,2,3,4,5].map((i) => <div key={i} className="h-1 flex-1 rounded-full" style={{ background: i <= pwStrength.score ? pwStrength.color : '#E5E7EB' }} />)}<span className="text-[10px]" style={{ color: pwStrength.color }}>{pwStrength.label}</span></div>}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5"><Label className="text-xs font-semibold">WhatsApp <span className="text-destructive">*</span></Label><div className="relative"><Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} placeholder="+92 300..." className="pl-9" /></div></div>
                        <div className="space-y-1.5"><Label className="text-xs font-semibold">Country</Label><div className="relative"><Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={reg.country} onChange={(e) => setReg({ ...reg, country: e.target.value })} placeholder="Pakistan" className="pl-9" /></div></div>
                      </div>
                      {role === 'TUTOR' && (
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Gender <span className="text-destructive">*</span></Label>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setReg({ ...reg, tutorGender: 'male' })} className={cn('flex-1 rounded-lg border-2 py-2 text-sm', reg.tutorGender === 'male' ? 'bg-[oklch(0.34_0.13_256/0.05)]' : 'border-border')} style={reg.tutorGender === 'male' ? { borderColor: '#0A192F' } : {}}>Male</button>
                            <button type="button" onClick={() => setReg({ ...reg, tutorGender: 'female' })} className={cn('flex-1 rounded-lg border-2 py-2 text-sm', reg.tutorGender === 'female' ? 'bg-[oklch(0.34_0.13_256/0.05)]' : 'border-border')} style={reg.tutorGender === 'female' ? { borderColor: '#0A192F' } : {}}>Female</button>
                          </div>
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Timezone <span className="text-[10px] text-muted-foreground">(auto-detected)</span></Label>
                        <select value={reg.timezone} onChange={(e) => setReg({ ...reg, timezone: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                          {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Student profile / Tutor verification */}
                  {step === 3 && role === 'STUDENT' && (
                    <div className="space-y-3">
                      <h1 className="text-xl font-extrabold" style={{ color: '#0A192F' }}>Learning Profile</h1>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Age Bracket</Label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setReg({ ...reg, ageBracket: 'kids' })} className={cn('flex-1 rounded-lg border-2 py-2 text-sm', reg.ageBracket === 'kids' ? 'bg-[oklch(0.34_0.13_256/0.05)]' : 'border-border')} style={reg.ageBracket === 'kids' ? { borderColor: '#0A192F' } : {}}>Kids (under 13)</button>
                          <button type="button" onClick={() => setReg({ ...reg, ageBracket: 'adults' })} className={cn('flex-1 rounded-lg border-2 py-2 text-sm', reg.ageBracket === 'adults' ? 'bg-[oklch(0.34_0.13_256/0.05)]' : 'border-border')} style={reg.ageBracket === 'adults' ? { borderColor: '#0A192F' } : {}}>Adults (13+)</button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Learning Goals</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {GOAL_OPTIONS.map((g) => { const active = reg.goals.includes(g.key); const Icon = g.icon; return (
                            <button key={g.key} type="button" onClick={() => toggleArray('goals', g.key)} className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs', active ? 'border-[oklch(0.34_0.13_256)] bg-[oklch(0.34_0.13_256)] text-white' : 'border-border')}>
                              <Icon className="h-3 w-3" /> {g.label}
                            </button>
                          )})}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Preferred Tutor Gender</Label>
                        <div className="flex gap-2">
                          {(['any', 'female', 'male'] as const).map((g) => (
                            <button key={g} type="button" onClick={() => setReg({ ...reg, preferredTutorGender: g })} className={cn('flex-1 rounded-lg border-2 py-2 text-sm', reg.preferredTutorGender === g ? 'bg-[oklch(0.34_0.13_256/0.05)]' : 'border-border')} style={reg.preferredTutorGender === g ? { borderColor: '#0A192F' } : {}}>
                              {g === 'any' ? 'No Preference' : g === 'female' ? 'Female Only' : 'Male Only'}
                            </button>
                          ))}
                        </div>
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
                    <div className="space-y-3">
                      <h1 className="text-xl font-extrabold" style={{ color: '#0A192F' }}>Professional Verification</h1>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Specialties <span className="text-destructive">*</span></Label>
                        <div className="flex flex-wrap gap-1.5">
                          {SUBJECT_OPTIONS.map((s) => { const active = reg.specialties.includes(s); return (
                            <button key={s} type="button" onClick={() => toggleArray('specialties', s)} className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs', active ? 'border-[oklch(0.34_0.13_256)] bg-[oklch(0.34_0.13_256)] text-white' : 'border-border')}>
                              {active && <Check className="h-3 w-3" />} {s}
                            </button>
                          )})}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Languages <span className="text-destructive">*</span></Label>
                        <div className="flex flex-wrap gap-1.5">
                          {['Arabic','English','Urdu','Turkish','French','Malay','Hindi','Bengali'].map((l) => { const active = reg.languages.includes(l); return (
                            <button key={l} type="button" onClick={() => toggleArray('languages', l)} className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs', active ? 'border-[oklch(0.62_0.14_230)] bg-[oklch(0.62_0.14_230/0.1)] text-[oklch(0.40_0.11_258)]' : 'border-border')}>
                              {active && <Check className="h-3 w-3" />} {l}
                            </button>
                          )})}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5"><Label className="text-xs font-semibold">Experience (yrs)</Label><Input type="number" value={reg.experienceYears} onChange={(e) => setReg({ ...reg, experienceYears: Number(e.target.value) })} /></div>
                        <div className="space-y-1.5"><Label className="text-xs font-semibold">Per-class rate ($)</Label><Input type="number" value={reg.perClassRate} onChange={(e) => setReg({ ...reg, perClassRate: Number(e.target.value) })} /></div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Brief Bio</Label>
                        <Textarea rows={2} value={reg.bio} onChange={(e) => setReg({ ...reg, bio: e.target.value })} placeholder="Teaching style and background..." />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Video Intro URL <span className="text-muted-foreground">(optional)</span></Label>
                        <div className="relative"><Video className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={reg.videoUrl} onChange={(e) => setReg({ ...reg, videoUrl: e.target.value })} placeholder="YouTube link" className="pl-9" /></div>
                      </div>
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
                              className="flex w-full items-center gap-2 rounded-lg border-2 border-dashed border-border p-2.5 text-xs text-muted-foreground transition hover:border-primary/50 hover:bg-muted/40 hover:text-foreground"
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
                              className="flex w-full items-center gap-2 rounded-lg border-2 border-dashed border-border p-2.5 text-xs text-muted-foreground transition hover:border-primary/50 hover:bg-muted/40 hover:text-foreground"
                            >
                              <Upload className="h-4 w-4" /> {reg.certificateUrls.length ? 'Add another certificate' : 'Click to upload certificate (image/PDF, max 10MB)'}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-xs font-semibold" style={{ color: '#0A192F' }}>Qualifications</p>
                        {([['nativeArabic','Native Arabic speaker',Languages],['hafiz','Hafiz of the Quran',BookOpenCheck],['ijazaCertified','Ijaza certified',Award]] as const).map(([key,label,Icon]) => (
                          <label key={key} className="flex cursor-pointer items-center gap-2 text-xs">
                            <input type="checkbox" checked={reg[key] as boolean} onChange={(e) => setReg({ ...reg, [key]: e.target.checked })} className="h-4 w-4 rounded border-border" />
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" /> {label}
                          </label>
                        ))}
                      </div>
                      <div className="flex items-start gap-2 rounded-lg p-3 text-xs" style={{ background: 'rgba(212,175,55,0.08)', color: '#B8941F' }}>
                        <CreditCard className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>After admin approval, you{"'"}ll receive a WhatsApp notification to pay your <strong>$10 USD</strong> activation fee.</span>
                      </div>
                    </div>
                  )}

                  {/* Nav buttons — hidden when the legal gate is open (gate has its own) */}
                  {!showLegalGate && (
                    <>
                      <div className="flex items-center gap-2 pt-1">
                        {step > (isLocked ? 2 : 1) && <Button type="button" variant="outline" onClick={() => setStep((s) => ((s - 1) as Step))} disabled={loading} className="gap-1"><ChevronLeft className="h-4 w-4" /> Back</Button>}
                        {step < 3 ? (
                          <Button type="submit" disabled={(step === 2 && !step2Valid) || loading} className="flex-1 gap-1 text-white" style={{ background: '#0A192F' }}>Continue <ChevronRight className="h-4 w-4" /></Button>
                        ) : (
                          <Button type="submit" disabled={loading} className="flex-1 gap-1.5 text-white" style={{ background: '#0A192F' }}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {role === 'TUTOR' ? <><ShieldCheck className="h-4 w-4" /> Submit Application</> : <><User className="h-4 w-4" /> Create Account</>}
                          </Button>
                        )}
                      </div>
                      <p className="text-center text-xs text-muted-foreground">Already have an account? <button type="button" onClick={() => setMode('login')} className="font-semibold hover:underline" style={{ color: '#0A192F' }}>Log in</button></p>
                    </>
                  )}
                </form>
              </div>
            )}

            {/* Tutor submitted */}
            {mode === 'register' && tutorSubmitted && (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100"><Check className="h-8 w-8 text-blue-600" /></div>
                <h1 className="text-xl font-extrabold" style={{ color: '#0A192F' }}>Application Submitted!</h1>
                <p className="max-w-sm text-sm text-muted-foreground">Thank you for your application. Once our team approves your profile, you will receive a WhatsApp notification to pay your <strong>$10 USD</strong> activation fee and launch your profile.</p>
                <Button onClick={() => { closeAuth(); setView('tutor-dashboard') }} className="text-white" style={{ background: '#0A192F' }}>Go to Dashboard</Button>
              </div>
            )}
          </div>
        </div>

        {/* Demo credentials — bottom of left panel */}
        <div className="px-8 pb-6">
          <div className="rounded-xl border border-border bg-white p-3">
            <p className="mb-2 text-[10px] font-medium text-muted-foreground">Try a demo account:</p>
            <div className="grid grid-cols-3 gap-2">
              <Button size="sm" variant="outline" onClick={() => { setMode('login'); fillDemo('student') }} className="text-[10px]">Student</Button>
              <Button size="sm" variant="outline" onClick={() => { setMode('login'); fillDemo('tutor') }} className="text-[10px]">Tutor</Button>
              <Button size="sm" variant="outline" onClick={() => { setMode('login'); fillDemo('admin') }} className="text-[10px]">Admin</Button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL (60%) — Brand Showcase ===== */}
      <div className="sticky top-0 flex h-screen w-[60%] flex-col items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A192F 0%, #0B2545 50%, #133356 100%)' }}>
        <IslamicPatternBand opacity={0.06} />

        <div className="relative z-10 flex flex-col items-center px-12 text-center text-white">
          {/* Bismillah */}
          <span className="font-arabic text-3xl text-white/80 mb-8" dir="rtl" style={{ fontFamily: "var(--font-amiri), serif" }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </span>

          <StarMedallion className="mb-6 h-12 w-12" style={{ color: 'rgba(212,175,55,0.4)' }} />

          {/* Main headline */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl" style={{ maxWidth: '600px' }}>
            Embark on Your Quranic Journey Today
          </h1>

          {/* Sub-headline */}
          <p className="mt-5 text-lg" style={{ color: '#8EAEC6', maxWidth: '500px' }}>
            Access personalized monthly plans, track learning milestones natively, and interact word-by-word with the world{"'"}s most elite certified Tajweed tutors.
          </p>

          {/* Decorative star divider */}
          <div className="mt-10 flex items-center gap-4">
            <div className="h-px w-20" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.4))' }} />
            <StarMedallion className="h-6 w-6" style={{ color: 'rgba(212,175,55,0.5)' }} />
            <div className="h-px w-20" style={{ background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.4))' }} />
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-8">
            {[
              { value: '500+', label: 'Certified Tutors' },
              { value: '60+', label: 'Countries' },
              { value: '10K+', label: 'Classes Taught' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold text-white">{s.value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-wide" style={{ color: '#8EAEC6' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          © {new Date().getFullYear()} Qtuor · Gateway to Tajweed Excellence
        </div>
      </div>
    </div>
  )
}

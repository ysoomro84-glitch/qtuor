'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { QtuorLogoLockup } from '@/components/brand/logo'
import { StarRating } from '@/components/brand/badges'
import { StarMedallion, IslamicPatternBand } from '@/components/brand/patterns'
import { Avatar, countryFlag } from '@/components/shared/avatar'
import { useAppStore } from '@/lib/store'
import {
  useAdminDashboard,
  useUpdateTutorStatus,
  useCreatePlan,
  useAdminSecurity,
  useUpdateAdminSecurity,
  usePaymentGateways,
  useUpdatePaymentGateway,
  useCreateBankAccount,
  useUpdateBankAccount,
  useDeleteBankAccount,
  useReceivablesLedger,
  usePayablesLedger,
  useReleasePayment,
  useUpdatePaymentStatus,
} from '@/lib/queries'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Users,
  GraduationCap,
  Clock3,
  CalendarCheck,
  DollarSign,
  Banknote,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  Plus,
  Star,
  Sparkles,
  LockKeyhole,
  Lock,
  AlertTriangle,
  MessageCircle,
  Bell,
  Settings,
  CreditCard,
  BookOpen,
  Wallet,
  Eye,
  EyeOff,
  RefreshCw,
  Building2,
  KeyRound,
  Send,
  Landmark,
  QrCode,
  Power,
  ScanLine,
  Loader2,
  Newspaper,
  Pencil,
  Trash2,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  CalendarDays,
  FileText,
  IdCard,
  FileCheck,
  ExternalLink,
  Upload,
  Phone,
  Mail,
  MapPin,
  Video as VideoIcon,
  User,
  FileWarning,
  Languages,
  Award,
  Smartphone,
  Search,
} from 'lucide-react'
import { useNotifications, useWhatsAppSettings, useUpdateWhatsAppSettings, useAdminBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost, useBaileysStatus, useBaileysQR, useDisconnectBaileys, useWhatsAppTemplates, useUpdateWhatsAppTemplate } from '@/lib/queries'

/* ============================================================
 * Brand Color Constants
 * ============================================================ */
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

/* ============================================================
 * Types — mirror shape returned by /api/dashboard/admin
 * ============================================================ */
type TutorStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

interface AdminTutor {
  id: string
  name: string
  email: string
  country: string | null
  phone?: string | null
  gender?: string | null
  createdAt: string
  status: TutorStatus
  verified: boolean
  rating: number
  perClassRate: number
  walletBalance: number
  profile: {
    bio: string | null
    specialties: string[]
    languages: string[]
    nativeArabic: boolean
    hafiz: boolean
    ijazaCertified: boolean
    experienceYears: number
    teachingStyle?: string | null
    videoUrl?: string | null
    idDocumentUrl: string | null
    certificateUrls: string[]
  } | null
}

interface AdminPlan {
  id: string
  name: string
  category?: string
  classesPerMonth: number
  monthlyPrice: number
  description: string | null
  features: string[]
  popular: boolean
  active: boolean
}

interface AdminWithdrawal {
  id: string
  amount: number
  status: string
  method: string | null
  createdAt?: string
  tutor: { id: string; name: string; email: string }
  accountLabel?: string | null
  accountNumber?: string | null
  iban?: string | null
  bankName?: string | null
  mobileNumber?: string | null
}

interface AdminStats {
  totalStudents: number
  totalTutors: number
  approvedTutors: number
  pendingTutors: number
  totalBookings: number
  totalRevenue: number
}

interface AdminDashboardData {
  tutors: AdminTutor[]
  plans: AdminPlan[]
  pendingWithdrawals: AdminWithdrawal[]
  stats: AdminStats
}

/* ============================================================
 * Auth guard
 * ============================================================ */
function AdminAuthGuard() {
  const user = useAppStore((s) => s.user)
  const openAuth = useAppStore((s) => s.openAuth)

  if (!user) {
    return (
      <section className="mx-auto max-w-md px-4 py-20">
        <Card className="relative overflow-hidden p-8 text-center">
          <IslamicPatternBand opacity={0.06} />
          <div className="relative flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0F4C81/0.12] text-[#0F4C81]">
              <LockKeyhole className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Admin sign-in required</h2>
            <p className="text-sm text-muted-foreground">
              Please sign in with an administrator account to access the Control Center.
            </p>
            <Button
              className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => openAuth('login')}
            >
              Sign in to continue
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">
              Demo admin: <span className="font-mono font-semibold text-foreground">admin@qtuor.com / admin123</span>
            </p>
          </div>
        </Card>
      </section>
    )
  }

  if (user.role !== 'ADMIN') {
    return (
      <section className="mx-auto max-w-md px-4 py-20">
        <Card className="relative overflow-hidden p-8 text-center">
          <IslamicPatternBand opacity={0.06} />
          <div className="relative flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37/0.18] text-[#D4AF37]">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Admin access required</h2>
            <p className="text-sm text-muted-foreground">
              You are signed in as <span className="font-semibold text-foreground">{user.email}</span> ({user.role.toLowerCase()}).
              The Control Center is restricted to administrators.
            </p>
            <div className="w-full rounded-lg border border-dashed border-[#0F4C81/0.4] bg-[#0F4C81/0.05] p-3 text-xs text-muted-foreground">
              <div className="mb-1 flex items-center gap-1.5 font-semibold text-[#0F4C81]">
                <Sparkles className="h-3.5 w-3.5" /> Demo admin credentials
              </div>
              <div className="font-mono">
                admin@qtuor.com / admin123
              </div>
            </div>
            <Button
              className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => openAuth('login')}
            >
              Switch to admin account
            </Button>
          </div>
        </Card>
      </section>
    )
  }

  return null
}

/* ============================================================
 * Stat cards
 * ============================================================ */
function StatCard({
  label,
  value,
  sub,
  icon,
  accent = 'primary',
  trend,
}: {
  label: string
  value: React.ReactNode
  sub?: string
  icon: React.ReactNode
  accent?: 'primary' | 'amber' | 'gold' | 'green'
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' }
}) {
  const accents: Record<string, string> = {
    primary: 'bg-[#0F4C81/0.12] text-[#0F4C81]',
    amber: 'bg-[#D97706/0.18] text-[#B45309]',
    gold: 'bg-[#D4AF37/0.18] text-[#D4AF37]',
    green: 'bg-[#10B981/0.18] text-[#059669]',
  }
  const topBorders: Record<string, string> = {
    primary: '#0F4C81',
    amber: '#D97706',
    gold: '#D4AF37',
    green: '#10B981',
  }
  return (
    <Card className="relative overflow-hidden border-[#E2E8F0] bg-white p-4 sm:p-5" style={{ borderTop: `3px solid ${topBorders[accent]}` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-extrabold text-foreground sm:text-[1.6rem]">{value}</p>
          <div className="mt-0.5 flex items-center gap-2">
            {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
            {trend && (
              <span className={cn(
                'inline-flex items-center gap-0.5 text-[10px] font-semibold',
                trend.direction === 'up' ? 'text-[#059669]' : trend.direction === 'down' ? 'text-[#DC2626]' : 'text-muted-foreground'
              )}>
                {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}
              </span>
            )}
          </div>
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', accents[accent])}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

/* ============================================================
 * Status badge
 * ============================================================ */
function StatusBadge({ status }: { status: TutorStatus }) {
  const map: Record<TutorStatus, string> = {
    PENDING: 'bg-[#D97706/0.18] text-[#B45309] border-[#D97706/0.35]',
    APPROVED: 'bg-[#10B981/0.18] text-[#059669] border-[#10B981/0.35]',
    REJECTED: 'bg-[#DC2626/0.12] text-[#DC2626] border-[#DC2626/0.3]',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold', map[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}

/* ============================================================
 * Tutor profile modal — admin document viewer
 * ============================================================ */
const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif)$/i

function isImageUrl(url: string): boolean {
  return IMAGE_EXT_RE.test(url)
}

function fileNameFromUrl(url: string): string {
  try {
    const parts = url.split('/')
    return decodeURIComponent(parts[parts.length - 1] || url)
  } catch {
    return url
  }
}

/** Single document thumbnail: image preview or PDF icon, opens in new tab on click. */
function DocThumb({ url, label }: { url: string; label?: string }) {
  const name = fileNameFromUrl(url)
  const isImage = isImageUrl(url)
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer')
      }}
      title={label ? `${label}: ${name}` : name}
      className="group flex flex-col items-stretch gap-1.5 text-left"
    >
      {isImage ? (
        <div className="relative h-32 w-full overflow-hidden rounded-lg border border-border bg-muted/40 shadow-sm transition group-hover:border-primary/50 group-hover:shadow">
          <img src={url} alt={label || name} className="h-32 w-full object-cover" />
          <span className="absolute right-1 top-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
            <ExternalLink className="mr-0.5 inline h-3 w-3" /> Open
          </span>
        </div>
      ) : (
        <div className="flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2 text-center shadow-sm transition group-hover:border-primary/50 group-hover:shadow">
          <FileText className="h-9 w-9 text-[#DC2626]" />
          <span className="line-clamp-2 max-w-full text-[11px] font-medium text-foreground">{name}</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-[#DC2626/0.1] px-1.5 py-0.5 text-[10px] font-semibold text-[#DC2626]">
            <ExternalLink className="h-3 w-3" /> PDF
          </span>
        </div>
      )}
      {label && <span className="text-[11px] font-medium text-muted-foreground">{label}</span>}
    </button>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
  href?: string
}) {
  const empty = value === null || value === undefined || value === ''
  return (
    <div className="flex items-start gap-2.5 py-2">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/5 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        {empty ? (
          <div className="text-sm text-muted-foreground/60">—</div>
        ) : href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="break-all text-sm font-medium text-primary hover:underline">
            {value}
          </a>
        ) : (
          <div className="break-words text-sm font-medium text-foreground">{value}</div>
        )}
      </div>
    </div>
  )
}

function TutorProfileModal({ tutor, onClose }: { tutor: AdminTutor | null; onClose: () => void }) {
  const updateTutor = useUpdateTutorStatus()
  const handle = (status: TutorStatus, label: string) => {
    if (!tutor) return
    updateTutor.mutate(
      { id: tutor.id, status },
      {
        onSuccess: () => {
          toast.success(`Tutor ${label.toLowerCase()}`)
          onClose()
        },
        onError: (e: Error) => toast.error(e.message || 'Failed to update tutor'),
      }
    )
  }

  return (
    <Dialog open={!!tutor} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto scrollbar-quran sm:max-w-3xl">
        <DialogHeader className="space-y-0">
          <DialogTitle className="text-lg font-extrabold text-foreground">Tutor Profile</DialogTitle>
          <DialogDescription className="sr-only">Full profile and document review</DialogDescription>
        </DialogHeader>

        {tutor && (
          <div className="space-y-5 pt-2">
            {/* Header — avatar, name, verified, status, email, country, close */}
            <div className="flex items-start gap-4 rounded-xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-4">
              <Avatar name={tutor.name} size={56} country={tutor.country} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-extrabold text-foreground">{tutor.name}</h2>
                  {tutor.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#0F4C81/0.12] px-2 py-0.5 text-[11px] font-semibold text-[#0F4C81]">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  )}
                  <StatusBadge status={tutor.status} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {tutor.email}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {countryFlag(tutor.country)} {tutor.country || '—'}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Joined {format(new Date(tutor.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 shrink-0 gap-1 text-muted-foreground" onClick={onClose}>
                <X className="h-4 w-4" /> Close
              </Button>
            </div>

            {/* Personal Information */}
            <section className="rounded-xl border border-border p-4">
              <div className="mb-1 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Personal Information</h3>
              </div>
              <div className="divide-y divide-border">
                <InfoRow icon={User} label="Full Name" value={tutor.name} />
                <InfoRow icon={Mail} label="Email" value={tutor.email} href={`mailto:${tutor.email}`} />
                <InfoRow icon={Phone} label="WhatsApp Phone Number" value={tutor.phone} />
                <InfoRow icon={MapPin} label="Country" value={tutor.country ? `${countryFlag(tutor.country)} ${tutor.country}` : null} />
                <InfoRow icon={User} label="Gender" value={tutor.gender ? (tutor.gender.charAt(0).toUpperCase() + tutor.gender.slice(1)) : null} />
                <InfoRow icon={FileText} label="Bio" value={tutor.profile?.bio} />
              </div>
            </section>

            {/* Academic / Quranic Specialties */}
            <section className="rounded-xl border border-border p-4">
              <div className="mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Academic &amp; Quranic Specialties</h3>
              </div>

              <div className="mb-3">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Specialties</div>
                <div className="flex flex-wrap gap-1.5">
                  {(tutor.profile?.specialties || []).length === 0 ? (
                    <span className="text-xs text-muted-foreground/60">—</span>
                  ) : (
                    (tutor.profile?.specialties || []).map((s) => (
                      <Badge key={s} variant="outline" className="border-[#0F4C81/0.3] bg-[#0F4C81/0.06] text-[#0F4C81]">
                        <BookOpen className="mr-1 h-3 w-3" /> {s}
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div className="mb-3">
                <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Languages className="h-3 w-3" /> Languages
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(tutor.profile?.languages || []).length === 0 ? (
                    <span className="text-xs text-muted-foreground/60">—</span>
                  ) : (
                    (tutor.profile?.languages || []).map((l) => (
                      <span key={l} className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-foreground">
                        {l}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Qualifications grid */}
              <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <QualChip active={tutor.profile?.nativeArabic} label="Native Arabic" icon={Languages} />
                <QualChip active={tutor.profile?.hafiz} label="Hafiz" icon={BookOpen} />
                <QualChip active={tutor.profile?.ijazaCertified} label="Ijaza" icon={Award} />
                <div className="rounded-lg border border-border bg-muted/30 px-2.5 py-2 text-center">
                  <div className="text-base font-extrabold text-foreground">{tutor.profile?.experienceYears ?? 0}+</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Years</div>
                </div>
              </div>

              <InfoRow icon={GraduationCap} label="Teaching Style" value={tutor.profile?.teachingStyle} />
              <InfoRow icon={VideoIcon} label="Video Intro URL" value={tutor.profile?.videoUrl} href={tutor.profile?.videoUrl || undefined} />
            </section>

            {/* Uploaded Documents */}
            <section className="rounded-xl border border-border p-4">
              <div className="mb-3 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Uploaded Documents</h3>
              </div>

              {/* National ID / Passport */}
              <div className="mb-4">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <IdCard className="h-3.5 w-3.5" /> National ID / Passport
                </div>
                {tutor.profile?.idDocumentUrl ? (
                  <div className="max-w-[220px]">
                    <DocThumb url={tutor.profile.idDocumentUrl} label="ID document" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-3 text-xs text-muted-foreground">
                    <FileWarning className="h-4 w-4" /> No ID document uploaded.
                  </div>
                )}
              </div>

              {/* Certificates & Degrees */}
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Award className="h-3.5 w-3.5" /> Certificates &amp; Degrees
                </div>
                {(tutor.profile?.certificateUrls || []).length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {tutor.profile!.certificateUrls.map((url, i) => (
                      <DocThumb key={url + i} url={url} label={`Certificate ${i + 1}`} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-3 text-xs text-muted-foreground">
                    <FileWarning className="h-4 w-4" /> No certificates uploaded.
                  </div>
                )}
              </div>
            </section>

            {/* Footer — vetting actions */}
            <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-background/95 px-1 py-3 backdrop-blur">
              <span className="mr-auto text-xs text-muted-foreground">Vetting actions</span>
              {tutor.status === 'PENDING' && (
                <>
                  <Button
                    size="sm"
                    className="h-9 gap-1.5 bg-[#0F4C81] text-white hover:bg-[#1E6CB5]"
                    disabled={updateTutor.isPending}
                    onClick={() => handle('APPROVED', 'approved')}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 gap-1.5 border-[#DC2626/0.4] text-[#DC2626] hover:bg-[#DC2626/0.08]"
                    disabled={updateTutor.isPending}
                    onClick={() => handle('REJECTED', 'rejected')}
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                </>
              )}
              {tutor.status === 'APPROVED' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 gap-1.5 border-[#D97706/0.4] text-[#B45309] hover:bg-[#D97706/0.08]"
                  disabled={updateTutor.isPending}
                  onClick={() => handle('REJECTED', 'suspended')}
                >
                  <Ban className="h-4 w-4" /> Suspend
                </Button>
              )}
              {tutor.status === 'REJECTED' && (
                <Button
                  size="sm"
                  className="h-9 gap-1.5 bg-[#0F4C81] text-white hover:bg-[#1E6CB5]"
                  disabled={updateTutor.isPending}
                  onClick={() => handle('APPROVED', 're-approved')}
                >
                  <RotateCcw className="h-4 w-4" /> Re-approve
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-9" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function QualChip({
  active,
  label,
  icon: Icon,
}: {
  active?: boolean
  label: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold',
        active
          ? 'border-[#0F4C81/0.35] bg-[#0F4C81/0.08] text-[#0F4C81]'
          : 'border-border bg-muted/20 text-muted-foreground'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      {active && <CheckCircle2 className="ml-auto h-3.5 w-3.5" />}
    </div>
  )
}

/* ============================================================
 * Tutor vetting tab
 * ============================================================ */
function TutorVettingTab({ tutors }: { tutors: AdminTutor[] }) {
  const [filter, setFilter] = React.useState<'ALL' | TutorStatus>('ALL')
  const [profileTutor, setProfileTutor] = React.useState<AdminTutor | null>(null)
  const updateTutor = useUpdateTutorStatus()

  const filtered = React.useMemo(() => {
    if (filter === 'ALL') return tutors
    return tutors.filter((t) => t.status === filter)
  }, [filter, tutors])

  const counts = React.useMemo(
    () => ({
      ALL: tutors.length,
      PENDING: tutors.filter((t) => t.status === 'PENDING').length,
      APPROVED: tutors.filter((t) => t.status === 'APPROVED').length,
      REJECTED: tutors.filter((t) => t.status === 'REJECTED').length,
    }),
    [tutors]
  )

  const handle = (id: string, status: TutorStatus, label: string) => {
    updateTutor.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(`Tutor ${label.toLowerCase()}`),
        onError: (e: Error) => toast.error(e.message || 'Failed to update tutor'),
      }
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
              filter === f
                ? 'border-transparent bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-background text-muted-foreground hover:bg-muted/60'
            )}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                filter === f ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      <Card className="p-0">
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto scrollbar-quran">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Tutor</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Per class</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                    No tutors match this filter.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t.id} className="group">
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3 py-1">
                        <Avatar name={t.name} size={40} country={t.country} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setProfileTutor(t)}
                              className="truncate font-semibold text-foreground underline-offset-2 hover:text-primary hover:underline cursor-pointer"
                              title="View full tutor profile"
                            >
                              {t.name}
                            </button>
                            {t.verified && (
                              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#0F4C81]" />
                            )}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">{t.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{countryFlag(t.country)} {t.country || '—'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-[220px] flex-wrap gap-1">
                        {(t.profile?.specialties || []).slice(0, 3).map((s) => (
                          <Badge
                            key={s}
                            variant="outline"
                            className="border-[#0F4C81/0.3] bg-[#0F4C81/0.06] text-[#0F4C81]"
                          >
                            {s}
                          </Badge>
                        ))}
                        {(t.profile?.specialties || []).length > 3 && (
                          <span className="text-xs text-muted-foreground">+{(t.profile?.specialties || []).length - 3}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {t.rating > 0 ? <StarRating rating={t.rating} size={13} /> : <span className="text-xs text-muted-foreground">New</span>}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">${t.perClassRate}</span>
                      <span className="text-xs text-muted-foreground">/class</span>
                    </TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell>
                      <span className="font-mono text-sm font-semibold text-foreground">${t.walletBalance.toFixed(2)}</span>
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1"
                          onClick={() => setProfileTutor(t)}
                          title="View full profile & documents"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                        {t.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              className="h-7 gap-1 bg-[#0F4C81] text-white hover:bg-[#1E6CB5]"
                              disabled={updateTutor.isPending}
                              onClick={() => handle(t.id, 'APPROVED', 'approved')}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 border-[#DC2626/0.4] text-[#DC2626] hover:bg-[#DC2626/0.08]"
                              disabled={updateTutor.isPending}
                              onClick={() => handle(t.id, 'REJECTED', 'rejected')}
                            >
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </Button>
                          </>
                        )}
                        {t.status === 'APPROVED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 border-[#D97706/0.4] text-[#B45309] hover:bg-[#D97706/0.08]"
                            disabled={updateTutor.isPending}
                            onClick={() => handle(t.id, 'REJECTED', 'suspended')}
                          >
                            <Ban className="h-3.5 w-3.5" /> Suspend
                          </Button>
                        )}
                        {t.status === 'REJECTED' && (
                          <Button
                            size="sm"
                            className="h-7 gap-1 bg-[#0F4C81] text-white hover:bg-[#1E6CB5]"
                            disabled={updateTutor.isPending}
                            onClick={() => handle(t.id, 'APPROVED', 're-approved')}
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Re-approve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <TutorProfileModal tutor={profileTutor} onClose={() => setProfileTutor(null)} />
    </div>
  )
}

/* ============================================================
 * Students & Plans Tab — Admin Plan Swapper
 * ============================================================ */
function StudentsPlanTab() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedStudent, setSelectedStudent] = React.useState<{
    id: string; name: string; email: string; country: string | null;
    currentPlan: string; planType: 'qaida' | 'quran' | 'both'; assignedTutor: string;
    classAccess: 'unlimited' | 'flexible' | 'fixed';
  } | null>(null)
  const [planDropdown, setPlanDropdown] = React.useState<string>('')

  // Demo students for the plan swapper (includes both DB and fallback data)
  const demoStudents = [
    { id: 'demo-noorani-student', name: 'Fatima Noor', email: 'noorani.demo@qtuor.com', country: 'Pakistan', currentPlan: 'Noorani Qaida', planType: 'qaida' as const, assignedTutor: 'Hafiza Madiha Yasir', classAccess: 'unlimited' as const },
    { id: 'demo-quran-student', name: 'Ahmed Khan', email: 'quran.demo@qtuor.com', country: 'United Kingdom', currentPlan: 'Quran Recitation With Tajweed', planType: 'quran' as const, assignedTutor: 'Hafiza Madiha Yasir', classAccess: 'unlimited' as const },
    { id: 'demo-hareem-student', name: 'Hareem Yasir', email: 'hareem.demo@qtuor.com', country: 'Pakistan', currentPlan: 'Noorani Qaida', planType: 'qaida' as const, assignedTutor: 'Hafiza Madiha Yasir', classAccess: 'unlimited' as const },
    { id: 'demo-yasir-student', name: 'Yasir Soomro', email: 'yasir.demo@qtuor.com', country: 'Pakistan', currentPlan: 'Quran Recitation With Tajweed', planType: 'quran' as const, assignedTutor: 'Hafiza Madiha Yasir', classAccess: 'flexible' as const },
    { id: 'demo-student-1', name: 'Ahmed Student', email: 'student@qtuor.com', country: 'United Kingdom', currentPlan: 'General', planType: 'both' as const, assignedTutor: 'Sheikh Abdullah', classAccess: 'unlimited' as const },
  ]

  const filtered = demoStudents.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePlanSwap = (studentId: string, newPlan: string) => {
    const planType = newPlan === 'Noorani Qaida' ? 'qaida' : newPlan === 'Quran Recitation With Tajweed' || newPlan === 'Hifz' ? 'quran' : 'both'
    toast.success('Plan Updated Successfully', { description: `Student plan changed to ${newPlan}. Dashboard will update instantly on next login.` })
    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent({ ...selectedStudent, currentPlan: newPlan, planType })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.textDark }}>Student Management & Plan Swapper</h2>
          <p className="text-sm" style={{ color: C.textMuted }}>Change student plans instantly — dashboard UI switches automatically.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: C.textMuted }} />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students..."
            className="pl-9 w-64"
            style={{ borderColor: C.border }}
          />
        </div>
      </div>

      {/* Student Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((student) => (
          <Card key={student.id} className="overflow-hidden p-0" style={{ borderColor: C.border }}>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: student.planType === 'qaida' ? C.teal : student.planType === 'quran' ? C.gold : C.islamicBlue }}>
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold" style={{ color: C.textDark }}>{student.name}</span>
                      <Badge className="text-[9px] font-bold border-transparent text-white" style={{ backgroundColor: student.planType === 'qaida' ? C.teal : student.planType === 'quran' ? C.gold : C.islamicBlue }}>
                        {student.planType === 'qaida' ? 'Qaida' : student.planType === 'quran' ? 'Quran' : 'Both'}
                      </Badge>
                    </div>
                    <p className="text-xs" style={{ color: C.textMuted }}>{student.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStudent(student)}
                  style={{ borderColor: `${C.islamicBlue}30`, color: C.islamicBlue }}
                >
                  Manage
                </Button>
              </div>

              {/* Current plan info */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg p-2.5" style={{ background: C.lightGray, border: `1px solid ${C.border}` }}>
                  <p className="text-[9px] font-semibold uppercase" style={{ color: C.textMuted }}>Current Plan</p>
                  <p className="text-sm font-bold" style={{ color: C.islamicBlue }}>{student.currentPlan}</p>
                </div>
                <div className="rounded-lg p-2.5" style={{ background: C.lightGray, border: `1px solid ${C.border}` }}>
                  <p className="text-[9px] font-semibold uppercase" style={{ color: C.textMuted }}>Assigned Tutor</p>
                  <p className="text-sm font-bold truncate" style={{ color: C.textDark }}>{student.assignedTutor}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Student Detail / Plan Swap Dialog */}
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle style={{ color: C.textDark }}>Manage Student: {selectedStudent.name}</DialogTitle>
              <DialogDescription>Change plan, tutor, and class access for this student.</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 pt-2">
              {/* Student Info */}
              <div className="flex items-center gap-3 rounded-lg p-3" style={{ background: C.lightGray, border: `1px solid ${C.border}` }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: selectedStudent.planType === 'qaida' ? C.teal : selectedStudent.planType === 'quran' ? C.gold : C.islamicBlue }}>
                  {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-bold" style={{ color: C.textDark }}>{selectedStudent.name}</p>
                  <p className="text-xs" style={{ color: C.textMuted }}>{selectedStudent.email} · {selectedStudent.country}</p>
                </div>
              </div>

              {/* Plan Dropdown — "Anytime Plan Swapper" */}
              <div>
                <Label className="text-sm font-semibold" style={{ color: C.textDark }}>Current Plan</Label>
                <Select value={selectedStudent.currentPlan} onValueChange={(val) => handlePlanSwap(selectedStudent.id, val)}>
                  <SelectTrigger className="mt-1.5" style={{ borderColor: C.border }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Noorani Qaida">Noorani Qaida (Beginner)</SelectItem>
                    <SelectItem value="Quran Recitation With Tajweed">Quran Recitation & Tajweed (Intermediate)</SelectItem>
                    <SelectItem value="Hifz">Hifz / Memorization (Advanced)</SelectItem>
                    <SelectItem value="General">General — Full Access (Both Qaida + Quran)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs" style={{ color: C.teal }}>Changing this will instantly switch the student&apos;s dashboard UI on their next login.</p>
              </div>

              {/* Assigned Tutor */}
              <div>
                <Label className="text-sm font-semibold" style={{ color: C.textDark }}>Assigned Tutor</Label>
                <Select defaultValue={selectedStudent.assignedTutor}>
                  <SelectTrigger className="mt-1.5" style={{ borderColor: C.border }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hafiza Madiha Yasir">Hafiza Madiha Yasir</SelectItem>
                    <SelectItem value="Sheikh Abdullah Al-Rashid">Sheikh Abdullah Al-Rashid</SelectItem>
                    <SelectItem value="Ustadha Maryam Hassan">Ustadha Maryam Hassan</SelectItem>
                    <SelectItem value="Ustadh Omar Khan">Ustadh Omar Khan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Class Access */}
              <div>
                <Label className="text-sm font-semibold" style={{ color: C.textDark }}>Class Access</Label>
                <Select defaultValue={selectedStudent.classAccess}>
                  <SelectTrigger className="mt-1.5" style={{ borderColor: C.border }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlimited">Unlimited — Fixed monthly subscription</SelectItem>
                    <SelectItem value="flexible">Flexible — 12 classes/month (On-Demand)</SelectItem>
                    <SelectItem value="fixed">Fixed — Specific weekly schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  className="text-white flex-1"
                  style={{ backgroundColor: C.islamicBlue }}
                  onClick={() => {
                    toast.success('Changes Saved', { description: `${selectedStudent.name}'s profile updated successfully.` })
                    setSelectedStudent(null)
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" /> Save Changes
                </Button>
                <Button variant="outline" onClick={() => setSelectedStudent(null)} style={{ borderColor: C.border }}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

/* ============================================================
 * Plans tab
 * ============================================================ */
function PlansTab({ plans }: { plans: AdminPlan[] }) {
  const [open, setOpen] = React.useState(false)
  const createPlan = useCreatePlan()

  const [form, setForm] = React.useState({
    name: '',
    category: 'Quran Recitation With Tajweed',
    classesPerMonth: '4',
    monthlyPrice: '49',
    description: '',
    features: '',
    popular: false,
  })

  const reset = () =>
    setForm({ name: '', category: 'Quran Recitation With Tajweed', classesPerMonth: '4', monthlyPrice: '49', description: '', features: '', popular: false })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.classesPerMonth || !form.monthlyPrice) {
      toast.error('Please fill in classes per month and monthly price.')
      return
    }
    createPlan.mutate(
      {
        name: form.name.trim(),
        category: form.category,
        classesPerMonth: Number(form.classesPerMonth),
        monthlyPrice: Number(form.monthlyPrice),
        description: form.description.trim(),
        features: form.features.trim(),
        popular: form.popular,
      },
      {
        onSuccess: () => {
          toast.success('Plan created successfully')
          reset()
          setOpen(false)
        },
        onError: (e: Error) => toast.error(e.message || 'Failed to create plan'),
      }
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">Subscription Plans</h3>
          <p className="text-sm text-muted-foreground">Manage the plans available to students worldwide.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Create New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <StarMedallion className="h-5 w-5 text-[#0F4C81]" />
                Create Subscription Plan
              </DialogTitle>
              <DialogDescription>Define a new plan for students to subscribe to.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="plan-name">Plan name</Label>
                  <Input
                    id="plan-name"
                    placeholder="e.g. 4 Classes / Week"
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="plan-category">Subject</Label>
                  <Select value={form.category} onValueChange={(v) => setForm((s) => ({ ...s, category: v }))}>
                    <SelectTrigger id="plan-category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Noorani Qaida">Noorani Qaida</SelectItem>
                      <SelectItem value="Quran Recitation With Tajweed">Quran Recitation With Tajweed</SelectItem>
                      <SelectItem value="Hifz">Hifz</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="plan-classes">Classes / month</Label>
                  <Input
                    id="plan-classes"
                    type="number"
                    min={1}
                    value={form.classesPerMonth}
                    onChange={(e) => setForm((s) => ({ ...s, classesPerMonth: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="plan-price">Monthly price ($)</Label>
                  <Input
                    id="plan-price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.monthlyPrice}
                    onChange={(e) => setForm((s) => ({ ...s, monthlyPrice: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="plan-desc">Description</Label>
                  <Textarea
                    id="plan-desc"
                    rows={2}
                    placeholder="Short marketing description"
                    value={form.description}
                    onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="plan-features">Features (one per line)</Label>
                  <Textarea
                    id="plan-features"
                    rows={5}
                    placeholder={'Weekly 1-on-1 sessions\nRecitation correction\nProgress tracking'}
                    value={form.features}
                    onChange={(e) => setForm((s) => ({ ...s, features: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Checkbox
                    id="plan-popular"
                    checked={form.popular}
                    onCheckedChange={(v) => setForm((s) => ({ ...s, popular: !!v }))}
                  />
                  <Label htmlFor="plan-popular" className="cursor-pointer text-sm font-medium">
                    Mark as <span className="text-[#D4AF37]">Most Popular</span> (highlighted on Plans page)
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={createPlan.isPending}>
                  {createPlan.isPending ? 'Creating…' : 'Create plan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {plans.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No subscription plans yet. Create your first plan.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <Card
              key={p.id}
              className={cn(
                'relative flex flex-col overflow-hidden p-5 transition-all hover:shadow-lg hover:shadow-primary/5',
                p.popular && 'ring-2 ring-[#D4AF37/0.6]'
              )}
            >
              {p.popular && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#D4AF37] px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow">
                  <Star className="h-3 w-3" /> Popular
                </span>
              )}
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F4C81/0.12] text-[#0F4C81]">
                  <StarMedallion className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold leading-tight text-foreground">{p.name}</h4>
                  <p className="text-[11px] text-muted-foreground">{p.classesPerMonth} classes / month</p>
                </div>
              </div>

              <div className="mb-3 flex items-end gap-1">
                <span className="text-3xl font-extrabold text-gradient-blue">${p.monthlyPrice}</span>
                <span className="mb-1 text-xs text-muted-foreground">/ month</span>
              </div>

              {p.description && (
                <p className="mb-3 text-xs text-muted-foreground">{p.description}</p>
              )}

              <ul className="mb-4 flex-1 space-y-1.5">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#10B981]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={p.active}
                    // Active state is read-only in this demo (no toggle API)
                    onCheckedChange={(v) =>
                      toast.info(
                        v ? 'Plan activation requires a backend update endpoint' : 'Plan deactivation requires a backend update endpoint'
                      )
                    }
                    aria-label="Plan active status"
                  />
                  <span className={cn('text-xs font-medium', p.active ? 'text-[#059669]' : 'text-muted-foreground')}>
                    {p.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    p.active
                      ? 'border-[#10B981/0.3] bg-[#10B981/0.08] text-[#059669]'
                      : 'border-border text-muted-foreground'
                  )}
                >
                  {p.active ? 'Live' : 'Hidden'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============================================================
 * Withdrawals tab
 * ============================================================ */
function WithdrawalsTab({ withdrawals }: { withdrawals: AdminWithdrawal[] }) {
  const maskAccount = (v: string | null | undefined) => {
    if (!v) return '—'
    const s = String(v).replace(/\s+/g, '')
    if (s.length <= 6) return s
    return `${s.slice(0, 4)} •••• •••• ${s.slice(-4)}`
  }

  if (withdrawals.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#0F4C81/0.12] text-[#0F4C81]">
          <Banknote className="h-6 w-6" />
        </div>
        <h4 className="text-lg font-bold text-foreground">No pending payouts</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          All tutor withdrawal requests have been processed.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-0">
      <div className="max-h-[600px] overflow-y-auto overflow-x-auto scrollbar-quran">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Tutor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3 py-1">
                    <Avatar name={w.tutor.name} size={36} />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-foreground">{w.tutor.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{w.tutor.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm font-bold text-foreground">${Number(w.amount).toFixed(2)}</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <Badge variant="outline" className="border-border capitalize text-muted-foreground">
                      {w.method ? w.method.toLowerCase() : 'bank'}
                    </Badge>
                    {w.method === 'BANK' && (w.iban || w.accountNumber) && (
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {w.bankName ? `${w.bankName} · ` : ''}
                        {w.iban ? maskAccount(w.iban) : maskAccount(w.accountNumber || '')}
                      </div>
                    )}
                    {(w.method === 'JAZZCASH' || w.method === 'EASYPAISA') && w.mobileNumber && (
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {w.mobileNumber}
                      </div>
                    )}
                    {w.method === 'PAYPAL' && w.accountLabel && (
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {w.accountLabel}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {w.createdAt ? format(new Date(w.createdAt), 'MMM d, yyyy') : '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 rounded-md border border-[#D97706/0.35] bg-[#D97706/0.18] px-2 py-0.5 text-xs font-semibold text-[#B45309]">
                    <Clock3 className="h-3 w-3" /> Pending
                  </span>
                </TableCell>
                <TableCell className="pr-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      className="h-7 gap-1 bg-[#0F4C81] text-white hover:bg-[#1E6CB5]"
                      onClick={() => toast.success(`Payout approved for ${w.tutor.name} ($${Number(w.amount).toFixed(2)})`)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve Payout
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 border-[#DC2626/0.4] text-[#DC2626] hover:bg-[#DC2626/0.08]"
                      onClick={() => toast.error(`Payout rejected for ${w.tutor.name}`)}
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

/* ============================================================
 * Main view
 * ============================================================ */
export function AdminDashboard() {
  const user = useAppStore((s) => s.user)
  const { data, isLoading, isError, error } = useAdminDashboard()
  const [activeView, setActiveView] = React.useState<string>('overview')
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)

  // Auth gate renders before anything else
  if (!user || user.role !== 'ADMIN') {
    return <AdminAuthGuard />
  }

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'DELETE' })
    useAppStore.getState().logout()
  }

  const NAV_ITEMS = [
    { value: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { value: 'tutors', label: 'Tutor Vetting', icon: ShieldCheck, badge: data?.stats.pendingTutors ?? 0 },
    { value: 'students', label: 'Students & Plans', icon: Users },
    { value: 'plans', label: 'Subscription Plans', icon: Sparkles },
    { value: 'ledger', label: 'Financial Ledger', icon: BookOpen },
    { value: 'gateways', label: 'Gateways & Banking', icon: CreditCard },
    { value: 'withdrawals', label: 'Withdrawals', icon: Banknote, badge: data?.pendingWithdrawals.length ?? 0 },
    { value: 'whatsapp', label: 'WhatsApp Alerts', icon: MessageCircle },
    { value: 'blog', label: 'Blog Engine', icon: Newspaper },
    { value: 'security', label: 'Security Settings', icon: Shield },
  ] as const

  const currentNav = NAV_ITEMS.find((n) => n.value === activeView)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ===== Mobile sidebar overlay ===== */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setMobileSidebarOpen(false)} aria-hidden />
      )}

      {/* ===== Left Sidebar (persistent, Deep Navy Blue) ===== */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col transition-transform duration-300 lg:static lg:translate-x-0',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ background: C.deepNavy }}
      >
        {/* Sidebar header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <QtuorLogoLockup onDark size="sm" />
          <button onClick={() => setMobileSidebarOpen(false)} className="text-white/60 hover:text-white lg:hidden" aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-quran px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">Navigation</p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = activeView === item.value
            const badge = 'badge' in item ? (item as any).badge : 0
            return (
              <button
                key={item.value}
                onClick={() => { setActiveView(item.value); setMobileSidebarOpen(false) }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-[#0F4C81] text-white shadow-sm'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-[#10B981]' : 'text-white/50')} />
                <span className="flex-1 text-left">{item.label}</span>
                {badge > 0 && (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[10px] font-bold text-[#0A2F4F]">
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Sidebar footer — admin profile + logout */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
            <Avatar name={user.name} size={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user.name}</p>
              <p className="truncate text-[10px] text-white/50">{user.email}</p>
            </div>
            <button onClick={handleLogout} className="shrink-0 text-white/50 transition hover:text-white" title="Log out" aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===== Main Content Area (80%) ===== */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Thin top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="text-muted-foreground hover:text-foreground lg:hidden" aria-label="Open sidebar">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-bold text-foreground sm:text-lg">
              {currentNav?.label || 'Admin Control Center'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-muted-foreground transition hover:text-foreground" title="Notifications" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {(data?.pendingWithdrawals.length ?? 0) > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#D4AF37] text-[9px] font-bold text-[#0A2F4F]">
                  {data?.pendingWithdrawals.length}
                </span>
              )}
            </button>
            <div className="hidden items-center gap-2 text-xs sm:flex">
              <Avatar name={user.name} size={28} />
              <span className="font-medium text-foreground">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Scrollable dynamic workspace */}
        <main className="flex-1 overflow-y-auto scrollbar-quran">
          <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
            {/* ===== Dashboard Overview ===== */}
            {activeView === 'overview' && (
              <>
                {/* Live Platform Status */}
                <Card className="overflow-hidden border-[#E2E8F0] bg-white" style={{ borderTop: '3px solid #10B981' }}>
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#10B981/0.18] text-[#059669]">
                        <CalendarCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Live Platform Status</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0F4C81] opacity-60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0F4C81]" />
                          </span>
                          All Systems Operational
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div className="text-center">
                        <p className="text-xl font-extrabold text-[#0F4C81]">{data?.stats.totalBookings ?? 0}</p>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Total Bookings</p>
                      </div>
                      <div className="h-8 w-px bg-[#E2E8F0]" />
                      <div className="text-center">
                        <p className="text-xl font-extrabold text-[#0F4C81]">{data?.stats.approvedTutors ?? 0}</p>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Active Tutors</p>
                      </div>
                      <div className="h-8 w-px bg-[#E2E8F0]" />
                      <div className="text-center">
                        <p className="text-xl font-extrabold text-[#D4AF37]">{data?.stats.totalStudents ?? 0}</p>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Active Subscriptions</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {isLoading ? (
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Card key={i} className="h-[104px] animate-pulse bg-muted/40" />
                    ))}
                  </div>
                ) : isError ? (
                  <Card className="flex items-center gap-3 border-[#DC2626/0.3] bg-[#DC2626/0.05] p-4">
                    <AlertTriangle className="h-5 w-5 text-[#DC2626]" />
                    <div className="text-sm text-foreground">
                      <span className="font-semibold">Couldn't load dashboard data.</span>{' '}
                      <span className="text-muted-foreground">{(error as Error)?.message || 'Please try again shortly.'}</span>
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard label="Total Students" value={data?.stats.totalStudents ?? 0} icon={<Users className="h-5 w-5" />} accent="primary" trend={{ value: '12% this month', direction: 'up' }} />
                    <StatCard label="Total Tutors" value={data?.stats.totalTutors ?? 0} sub={`approved ${data?.stats.approvedTutors ?? 0}`} icon={<GraduationCap className="h-5 w-5" />} accent="primary" trend={{ value: '8% this month', direction: 'up' }} />
                    <StatCard label="Total Revenue" value={`$${(data?.stats.totalRevenue ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} sub="lifetime" icon={<DollarSign className="h-5 w-5" />} accent="gold" trend={{ value: '5% this month', direction: 'up' }} />
                    <StatCard label="Pending Tutors" value={data?.stats.pendingTutors ?? 0} sub="awaiting review" icon={<Clock3 className="h-5 w-5" />} accent="amber" trend={{ value: 'needs attention', direction: data?.stats.pendingTutors ? 'down' : 'neutral' }} />
                  </div>
                )}

                {/* Quick actions */}
                <Card className="relative overflow-hidden p-6">
                  <IslamicPatternBand opacity={0.04} />
                  <div className="relative">
                    <h2 className="text-lg font-bold text-foreground">Welcome back, {user.name.split(' ')[0]}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Your enterprise control center. Select a section from the sidebar to manage tutors, finances, and platform settings.</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <button onClick={() => setActiveView('tutors')} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-left text-sm transition hover:bg-muted/50">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-[#0F4C81]" /> Tutor Vetting <span className="ml-auto text-xs text-muted-foreground">{data?.stats.pendingTutors ?? 0}</span>
                      </button>
                      <button onClick={() => setActiveView('ledger')} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-left text-sm transition hover:bg-muted/50">
                        <BookOpen className="h-4 w-4 shrink-0 text-[#0F4C81]" /> Financial Ledger
                      </button>
                      <button onClick={() => setActiveView('gateways')} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-left text-sm transition hover:bg-muted/50">
                        <CreditCard className="h-4 w-4 shrink-0 text-[#0F4C81]" /> Gateways & Banking
                      </button>
                      <button onClick={() => setActiveView('withdrawals')} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-left text-sm transition hover:bg-muted/50">
                        <Banknote className="h-4 w-4 shrink-0 text-[#0F4C81]" /> Withdrawals <span className="ml-auto text-xs text-muted-foreground">{data?.pendingWithdrawals.length ?? 0}</span>
                      </button>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* ===== Dynamic workspace (no page reload) ===== */}
            {activeView === 'tutors' && (isLoading ? <Card className="h-[400px] animate-pulse bg-muted/40" /> : <TutorVettingTab tutors={data?.tutors ?? []} />)}
            {activeView === 'plans' && (isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Card key={i} className="h-[260px] animate-pulse bg-muted/40" />)}</div> : <PlansTab plans={data?.plans ?? []} />)}
            {activeView === 'students' && <StudentsPlanTab />}
            {activeView === 'withdrawals' && (isLoading ? <Card className="h-[300px] animate-pulse bg-muted/40" /> : <WithdrawalsTab withdrawals={data?.pendingWithdrawals ?? []} />)}
            {activeView === 'whatsapp' && <WhatsAppTab />}
            {activeView === 'blog' && <BlogAdminTab />}
            {activeView === 'security' && <SecurityTab />}
            {activeView === 'gateways' && <GatewaysTab />}
            {activeView === 'ledger' && <LedgerTab />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard

/* ============================================================
 * WhatsApp Notifications Tab
 * ============================================================ */
function WhatsAppTab() {
  // ===== Baileys gateway (Link-Device / QR scan) =====
  const { data: statusData, isLoading: statusLoading } = useBaileysStatus()
  const { data: qrData } = useBaileysQR(!statusData?.connected)
  const disconnectMut = useDisconnectBaileys()
  const baileysConnected = !!statusData?.connected
  const connectedPhone = statusData?.phone || null
  const qrCode = qrData?.qr || null

  // ===== Templates =====
  const { data: tplData, isLoading: tplLoading } = useWhatsAppTemplates()
  const updateTpl = useUpdateWhatsAppTemplate()
  const templates = tplData?.templates || []

  // ===== Legacy settings (feature toggles + admin phone + notification log) =====
  const { data: notifData, isLoading: notifLoading } = useNotifications()
  const { data: settingsData, isLoading: settingsLoading } = useWhatsAppSettings()
  const updateSettings = useUpdateWhatsAppSettings()
  const settings = settingsData?.settings
  const notifications = notifData?.notifications || []
  const byType = notifData?.byType || []

  const toggle = (key: string, value: boolean) => updateSettings.mutate({ [key]: !value })

  return (
    <div className="space-y-4">
      {/* ===== Link-Device connection card (State A / B) ===== */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 bg-[#0F4C81] p-4 text-white">
          <MessageCircle className="h-5 w-5" />
          <span className="font-bold">WhatsApp Link-Device Gateway</span>
          <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-white/80">
            @whiskeysockets/baileys
          </span>
        </div>
        <div className="p-5">
          {statusLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : baileysConnected ? (
            /* ===== State B: Connected (Live Status Dashboard) ===== */
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981/0.15]">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0F4C81] opacity-60" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-[#0F4C81]" />
                </span>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-lg font-bold text-foreground">
                  <span className="text-[#0F4C81]">●</span> Connected to WhatsApp
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {connectedPhone ? `+${connectedPhone.replace(/\D/g, '')}` : 'Session active'} · Auto-reconnects on server restart
                </p>
                {statusData?.connectedAt && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Connected since {new Date(statusData.connectedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Badge className="bg-[#10B981/0.18] text-[#059669] border-[#10B981/0.35]">
                  Real messages active
                </Badge>
                <Badge className="bg-[#0F4C81/0.12] text-[#0F4C81] border-[#0F4C81/0.3]">
                  All automation triggers live
                </Badge>
              </div>
              <Button
                variant="outline"
                className="mt-2 gap-1.5 border-[#DC2626/0.4] text-[#DC2626] hover:bg-[#DC2626/0.08]"
                disabled={disconnectMut.isPending}
                onClick={() => {
                  if (confirm('Disconnect this WhatsApp number? You will need to scan the QR code again to reconnect.')) {
                    disconnectMut.mutate()
                  }
                }}
              >
                <Power className="h-4 w-4" /> Disconnect / Log Out
              </Button>
            </div>
          ) : (
            /* ===== State A: Disconnected (Show QR Code) ===== */
            <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="mx-auto flex flex-col items-center gap-3">
                <div className="rounded-xl border-4 border-[#0F4C81]/20 bg-white p-3 shadow-sm">
                  {qrCode ? (
                    <img src={qrCode} alt="WhatsApp QR Code" className="h-52 w-52" />
                  ) : (
                    <div className="flex h-52 w-52 flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="text-xs">Generating QR…</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {qrCode ? 'Scan to connect' : 'Waiting for gateway…'}
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-[#0F4C81]" />
                  <h3 className="text-base font-bold text-foreground">Connect your WhatsApp number</h3>
                </div>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0F4C81]/15 text-[11px] font-bold text-[#075E54]">1</span>
                    Open <strong className="text-foreground">WhatsApp</strong> on your phone
                  </li>
                  <li className="flex gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0F4C81]/15 text-[11px] font-bold text-[#075E54]">2</span>
                    Go to <strong className="text-foreground">Settings → Linked Devices → Link a Device</strong>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0F4C81]/15 text-[11px] font-bold text-[#075E54]">3</span>
                    Scan the QR code on the left with your phone camera
                  </li>
                </ol>
                <div className="rounded-lg bg-[#0F4C81/0.06] p-3 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5 font-semibold text-[#0F4C81]">
                    <ScanLine className="h-3.5 w-3.5" /> Session persistence
                  </p>
                  <p className="mt-1">Your session is saved on the server. If the server restarts, the gateway auto-reconnects — no need to rescan.</p>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  QR refreshes every 5 seconds. Gateway status: <strong>{statusData?.state || 'offline'}</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ===== State C: Template Configurations ===== */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border p-4">
          <span className="flex items-center gap-2 font-bold">
            <MessageCircle className="h-4 w-4 text-[#0F4C81]" /> Automated Message Templates
          </span>
          <span className="text-[10px] text-muted-foreground">Dynamic variables: {'{TutorName}, {StudentName}, {Amount}, {ClassTime}, {TutorName}, {ClassroomLink}'}</span>
        </div>
        {tplLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading templates…</div>
        ) : (
          <div className="divide-y divide-border">
            {templates.map((t: any) => (
              <TemplateEditor
                key={t.id}
                template={t}
                onSave={(body) => updateTpl.mutate({ id: t.id, template: body })}
                onToggle={(enabled) => updateTpl.mutate({ id: t.id, enabled })}
              />
            ))}
          </div>
        )}
      </Card>

      {/* ===== Automation toggles + admin phone ===== */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 p-4">
          <Bell className="h-4 w-4" />
          <span className="font-bold text-sm">Automation Triggers & Feature Toggles</span>
        </div>
        <div className="space-y-4 p-5">
          {settingsLoading ? (
            <div className="h-24 animate-pulse bg-muted/40 rounded" />
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="wa-admin-phone" className="text-xs font-semibold">Admin / Support WhatsApp Number</Label>
                <Input
                  id="wa-admin-phone"
                  value={settings?.adminPhone || ''}
                  onChange={(e) => updateSettings.mutate({ adminPhone: e.target.value })}
                  placeholder="+1234567890"
                  className="max-w-xs"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  ['notifyTutorApproved', 'Tutor approval + $10 registration fee link'],
                  ['notifyBookingConfirmation', 'Class booking confirmation (student + tutor)'],
                  ['notifyClassReminder', '15-minute live class reminder (cron)'],
                  ['notifyPaymentSuccess', 'Payment success receipt (Stripe / Bank)'],
                  ['notifyTutorPayout', 'Tutor monthly payout (55% share) notification'],
                  ['showFloatingWidget', 'Show floating WhatsApp widget on landing page'],
                  ['allowTutorContactAdmin', '"Ask about this tutor" button on tutor cards'],
                ].map(([key, label]) => (
                  <label key={key} className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-card p-2.5">
                    <span className="text-xs">{label}</span>
                    <Switch
                      checked={settings?.[key as keyof typeof settings] as boolean}
                      onCheckedChange={() => toggle(key, settings?.[key as keyof typeof settings] as boolean)}
                    />
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <Label htmlFor="wa-reminder-min" className="shrink-0 text-xs font-semibold">Reminder minutes before class:</Label>
                <Input
                  id="wa-reminder-min"
                  type="number"
                  min="5"
                  max="60"
                  value={settings?.reminderMinutesBefore || 15}
                  onChange={(e) => updateSettings.mutate({ reminderMinutesBefore: parseInt(e.target.value) || 15 })}
                  className="w-20"
                />
                <span className="text-xs text-muted-foreground">minutes (cron runs every 5 min)</span>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* ===== Stats by type ===== */}
      {byType.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {byType.map((t: any) => (
            <Card key={t.type} className="p-3 text-center">
              <div className="text-xl font-extrabold text-[#0F4C81]">{t._count}</div>
              <div className="text-[10px] uppercase text-muted-foreground">{t.type.replace(/_/g, ' ').toLowerCase()}</div>
            </Card>
          ))}
        </div>
      )}

      {/* ===== Notification log ===== */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border p-4">
          <span className="flex items-center gap-2 font-bold">
            <Bell className="h-4 w-4" /> Notification Log
          </span>
          <span className="text-xs text-muted-foreground">{notifData?.count || 0} total</span>
        </div>
        {notifLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading notifications…</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No notifications sent yet.</div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto scrollbar-quran">
            {notifications.map((n: any) => (
              <div key={n.id} className="border-b border-border/60 p-3 last:border-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${n.status === 'SIMULATED' ? 'bg-amber-100 text-amber-700' : n.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {n.status}
                      </span>
                      <span className="rounded bg-[#0F4C81]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#075E54]">{n.type.replace(/_/g, ' ').toLowerCase()}</span>
                      <span className="text-xs font-semibold">{n.recipientName}</span>
                      {n.recipientPhone && <span className="text-[10px] text-muted-foreground">{n.recipientPhone}</span>}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

/** Inline template editor with variables hint + enable toggle + save. */
function TemplateEditor({ template, onSave, onToggle }: { template: any; onSave: (body: string) => void; onToggle: (enabled: boolean) => void }) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(template.template)
  React.useEffect(() => { setDraft(template.template) }, [template.template])

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{template.label}</span>
            <code className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">{template.key}</code>
          </div>
          {template.variables && (
            <p className="mt-0.5 text-[10px] text-muted-foreground">Variables: {template.variables}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <label className="flex cursor-pointer items-center gap-1 text-[10px] text-muted-foreground">
            <Switch checked={template.enabled} onCheckedChange={onToggle} /> {template.enabled ? 'On' : 'Off'}
          </label>
          {!editing ? (
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => setEditing(true)}>
              <Pencil className="h-3 w-3" /> Edit
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setDraft(template.template); setEditing(false) }}>Cancel</Button>
              <Button size="sm" className="h-7 gap-1 bg-[#0F4C81] text-white hover:bg-[#1da851]" onClick={() => { onSave(draft); setEditing(false); toast.success('Template saved') }}>
                <CheckCircle2 className="h-3 w-3" /> Save
              </Button>
            </div>
          )}
        </div>
      </div>
      {editing ? (
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          className="mt-2 text-xs"
        />
      ) : (
        <p className="mt-2 whitespace-pre-wrap rounded-md bg-muted/30 p-2 text-xs text-muted-foreground">{template.template}</p>
      )}
    </div>
  )
}

/* ============================================================
 * Blog Posts Tab (Admin)
 * ============================================================ */
interface AdminBlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  tags?: string | null
  featuredImage?: string | null
  readingTime: number
  author: string
  source: string
  status: string
  publishedAt: string
  createdAt: string
  updatedAt: string
}

const BLOG_CATEGORIES = [
  'Tajweed Tips',
  'Parent Guides',
  'Quran Learning',
  'Arabic Grammar',
  'Hifz',
  'Islamic Education',
] as const

const BLOG_STATUS_STYLE: Record<string, string> = {
  PUBLISHED: 'bg-[#10B981/0.18] text-[#059669] border-[#10B981/0.35]',
  DRAFT: 'bg-[#94A3B8/0.18] text-muted-foreground border-border',
  ARCHIVED: 'bg-[#DC2626/0.12] text-[#DC2626] border-[#DC2626/0.3]',
}

const BLOG_SOURCE_STYLE: Record<string, string> = {
  AUTO: 'bg-[#D4AF37/0.18] text-[#D4AF37] border-[#D4AF37/0.35]',
  MANUAL: 'bg-[#0F4C81/0.12] text-[#0F4C81] border-[#0F4C81/0.3]',
}

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'Tajweed Tips': '/subjects/quran-recitation.png',
  'Parent Guides': '/subjects/islamic-studies.png',
  'Quran Learning': '/subjects/quran-recitation.png',
  'Arabic Grammar': '/subjects/arabic-language.png',
  'Hifz': '/subjects/hifz.png',
  'Islamic Education': '/subjects/islamic-studies.png',
}

interface BlogFormState {
  title: string
  category: string
  excerpt: string
  content: string
  featuredImage: string
  readingTime: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  tags: string
  author: string
}

const EMPTY_FORM: BlogFormState = {
  title: '',
  category: 'Tajweed Tips',
  excerpt: '',
  content: '',
  featuredImage: '',
  readingTime: '5',
  status: 'PUBLISHED',
  tags: '',
  author: 'Qtuor Editorial',
}

function BlogAdminTab() {
  const { data, isLoading, isError } = useAdminBlogPosts()
  const createPost = useCreateBlogPost()
  const updatePost = useUpdateBlogPost()
  const deletePost = useDeleteBlogPost()

  const posts: AdminBlogPost[] = data?.posts || []

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<AdminBlogPost | null>(null)
  const [form, setForm] = React.useState<BlogFormState>(EMPTY_FORM)
  const [deleteSlug, setDeleteSlug] = React.useState<string | null>(null)

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  const openEdit = (post: AdminBlogPost) => {
    setEditing(post)
    setForm({
      title: post.title,
      category: post.category,
      excerpt: post.excerpt,
      content: '', // content is not returned by admin list endpoint for performance
      featuredImage: post.featuredImage || '',
      readingTime: String(post.readingTime),
      status: (post.status as BlogFormState['status']) || 'PUBLISHED',
      tags: post.tags || '',
      author: post.author || 'Qtuor Editorial',
    })
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    setEditing(null)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.excerpt.trim()) {
      toast.error('Title and excerpt are required.')
      return
    }
    if (!editing && !form.content.trim()) {
      toast.error('Content is required for a new post.')
      return
    }
    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      category: form.category,
      tags: form.tags.trim() || null,
      featuredImage: form.featuredImage.trim() || null,
      readingTime: parseInt(form.readingTime, 10) || 5,
      status: form.status,
      author: form.author.trim() || 'Qtuor Editorial',
    }

    if (editing) {
      // For edits, content is optional (only send if changed)
      const updatePayload: Record<string, unknown> = { ...payload }
      if (!form.content.trim()) delete updatePayload.content
      updatePost.mutate(
        { slug: editing.slug, ...updatePayload },
        {
          onSuccess: () => {
            toast.success('Blog post updated')
            close()
          },
          onError: (err: Error) => toast.error(err.message || 'Failed to update post'),
        }
      )
    } else {
      createPost.mutate(payload, {
        onSuccess: () => {
          toast.success('Blog post created')
          close()
        },
        onError: (err: Error) => toast.error(err.message || 'Failed to create post'),
      })
    }
  }

  const confirmDelete = () => {
    if (!deleteSlug) return
    deletePost.mutate(deleteSlug, {
      onSuccess: () => {
        toast.success('Blog post deleted')
        setDeleteSlug(null)
      },
      onError: (err: Error) => toast.error(err.message || 'Failed to delete post'),
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">Blog Posts</h3>
          <p className="text-sm text-muted-foreground">
            Manually authored articles or auto-generated by the LLM cron. {posts.length} total.
          </p>
        </div>
        <Button className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {isLoading ? (
        <Card className="h-[400px] animate-pulse bg-muted/40" />
      ) : isError ? (
        <Card className="flex items-center gap-3 border-[#DC2626/0.3] bg-[#DC2626/0.05] p-4">
          <AlertTriangle className="h-5 w-5 text-[#DC2626]" />
          <span className="text-sm text-foreground">Couldn&apos;t load blog posts. Please try again shortly.</span>
        </Card>
      ) : posts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#0F4C81/0.12] text-[#0F4C81]">
            <Newspaper className="h-6 w-6" />
          </div>
          <h4 className="text-lg font-bold text-foreground">No blog posts yet</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first article, or wait for the auto-blog cron to generate one.
          </p>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="max-h-[600px] overflow-y-auto overflow-x-auto scrollbar-quran">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((p) => (
                  <TableRow key={p.id} className="group">
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3 py-1">
                        <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                          <img
                            src={p.featuredImage || CATEGORY_IMAGE_MAP[p.category] || '/subjects/quran-recitation.png'}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-foreground">{p.title}</div>
                          <div className="truncate text-xs text-muted-foreground">/{p.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-[#0F4C81/0.3] bg-[#0F4C81/0.06] text-[#0F4C81]">
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold', BLOG_SOURCE_STYLE[p.source] || BLOG_SOURCE_STYLE.MANUAL)}>
                        {p.source === 'AUTO' ? <Sparkles className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                        {p.source}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold', BLOG_STATUS_STYLE[p.status] || BLOG_STATUS_STYLE.DRAFT)}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" /> {format(new Date(p.publishedAt), 'MMM d, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1"
                          disabled={updatePost.isPending || createPost.isPending}
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 border-[#DC2626/0.4] text-[#DC2626] hover:bg-[#DC2626/0.08]"
                          disabled={deletePost.isPending}
                          onClick={() => setDeleteSlug(p.slug)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) close(); else setOpen(true) }}>
        <DialogContent className="max-h-[92vh] overflow-y-auto scrollbar-quran sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-[#0F4C81]" />
              {editing ? 'Edit Blog Post' : 'New Blog Post'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update the article fields. Content is optional on edit (leave blank to keep the existing body).'
                : 'Write a new article. It will be marked as MANUAL source.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="blog-title">Title</Label>
              <Input
                id="blog-title"
                placeholder="e.g. 7 Common Tajweed Mistakes (And How to Fix Them)"
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="blog-category">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((s) => ({ ...s, category: v }))}>
                  <SelectTrigger id="blog-category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BLOG_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="blog-status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((s) => ({ ...s, status: v as BlogFormState['status'] }))}
                >
                  <SelectTrigger id="blog-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="blog-excerpt">Excerpt (shown on the card)</Label>
              <Textarea
                id="blog-excerpt"
                rows={2}
                placeholder="A short 1-2 sentence summary"
                value={form.excerpt}
                onChange={(e) => setForm((s) => ({ ...s, excerpt: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="blog-content">
                Content (HTML){editing && ' — leave blank to keep existing body'}
              </Label>
              <Textarea
                id="blog-content"
                rows={10}
                placeholder={'<h2>Introduction</h2>\n<p>...</p>'}
                value={form.content}
                onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
                className="font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="blog-image">Featured image URL</Label>
                <Input
                  id="blog-image"
                  placeholder="/subjects/quran-recitation.png"
                  value={form.featuredImage}
                  onChange={(e) => setForm((s) => ({ ...s, featuredImage: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="blog-reading">Reading time (min)</Label>
                <Input
                  id="blog-reading"
                  type="number"
                  min={1}
                  max={120}
                  value={form.readingTime}
                  onChange={(e) => setForm((s) => ({ ...s, readingTime: e.target.value }))}
                />
              </div>
            </div>
            {/* Image preview */}
            {form.featuredImage && (
              <div className="overflow-hidden rounded-lg border border-border">
                <img
                  src={form.featuredImage}
                  alt="Featured preview"
                  className="h-32 w-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.opacity = '0.3'
                  }}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="blog-tags">Tags (comma-separated)</Label>
                <Input
                  id="blog-tags"
                  placeholder="tajweed, beginners, kids"
                  value={form.tags}
                  onChange={(e) => setForm((s) => ({ ...s, tags: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="blog-author">Author</Label>
                <Input
                  id="blog-author"
                  value={form.author}
                  onChange={(e) => setForm((s) => ({ ...s, author: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={createPost.isPending || updatePost.isPending}
              >
                {createPost.isPending || updatePost.isPending
                  ? 'Saving…'
                  : editing
                    ? 'Save changes'
                    : 'Create post'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteSlug} onOpenChange={(v) => { if (!v) setDeleteSlug(null) }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#DC2626]">
              <AlertTriangle className="h-5 w-5" /> Delete this blog post?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The post will be permanently removed from the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSlug(null)}>
              Cancel
            </Button>
            <Button
              className="bg-[#DC2626] text-white hover:bg-[#B91C1C]"
              disabled={deletePost.isPending}
              onClick={confirmDelete}
            >
              {deletePost.isPending ? 'Deleting…' : 'Delete permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ============================================================
 * Security Tab — Master Credentials & Secret Keys
 * ============================================================ */
function SecurityTab() {
  const { data: adminData, isLoading } = useAdminSecurity()
  const updateSecurity = useUpdateAdminSecurity()
  const user = useAppStore((s) => s.user)
  const setUser = useAppStore((s) => s.setUser)

  const [currentPw, setCurrentPw] = React.useState('')
  const [newPw, setNewPw] = React.useState('')
  const [confirmPw, setConfirmPw] = React.useState('')
  const [newEmail, setNewEmail] = React.useState('')
  const [showCurrent, setShowCurrent] = React.useState(false)
  const [showNew, setShowNew] = React.useState(false)

  const displayedEmail = adminData?.email || user?.email || '—'

  const handlePassword = () => {
    if (!currentPw) return toast.error('Enter your current password first')
    if (newPw.length < 6) return toast.error('New password must be at least 6 characters')
    if (newPw !== confirmPw) return toast.error('New password and confirmation do not match')
    if (newPw === currentPw) return toast.error('New password must differ from the current one')

    updateSecurity.mutate(
      { currentPassword: currentPw, newPassword: newPw },
      {
        onSuccess: () => {
          toast.success('Master password updated successfully')
          setCurrentPw('')
          setNewPw('')
          setConfirmPw('')
        },
        onError: (e: Error) => toast.error(e.message || 'Failed to update password'),
      }
    )
  }

  const handleEmail = () => {
    if (!currentPw) return toast.error('Enter your current password to confirm the email change')
    if (!newEmail) return toast.error('Enter a new email address')
    const trimmed = newEmail.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return toast.error('Please enter a valid email address')
    if (trimmed === displayedEmail.toLowerCase()) return toast.error('That is already your current email')

    updateSecurity.mutate(
      { currentPassword: currentPw, newEmail: trimmed },
      {
        onSuccess: (res: { ok?: boolean; email?: string }) => {
          toast.success(`Master email updated to ${res.email || trimmed}`)
          // Keep the in-memory store in sync so the navbar updates immediately.
          if (user) setUser({ ...user, email: res.email || trimmed })
          setNewEmail('')
          setCurrentPw('')
        },
        onError: (e: Error) => toast.error(e.message || 'Failed to update email'),
      }
    )
  }

  if (isLoading) return <Card className="h-[420px] animate-pulse bg-muted/40" />

  return (
    <div className="space-y-4">
      {/* Master Credentials card */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 bg-primary p-4 text-primary-foreground">
          <Shield className="h-5 w-5" />
          <span className="font-bold">Master Credentials</span>
          <Badge className="ml-auto border-white/30 bg-white/15 text-white">Admin Only</Badge>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-2">
          {/* Email block */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Current Master Email</Label>
              <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                <span className="truncate font-mono text-sm font-semibold text-foreground">{displayedEmail}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-email">Update Master Email</Label>
              <Input
                id="new-email"
                type="email"
                autoComplete="email"
                placeholder="new.admin@qtuor.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">
                Changing the email also updates your active session cookie.
              </p>
            </div>
            <Button
              onClick={handleEmail}
              disabled={updateSecurity.isPending || !newEmail}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {updateSecurity.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Save Email
            </Button>
          </div>

          {/* Password block */}
          <div className="space-y-3 border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <div className="space-y-1.5">
              <Label htmlFor="cur-pw">Current Password</Label>
              <div className="relative">
                <Input
                  id="cur-pw"
                  type={showCurrent ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showCurrent ? 'Hide password' : 'Show password'}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="new-pw">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-pw"
                    type={showNew ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="min 6 characters"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-pw">Confirm New Password</Label>
                <Input
                  id="confirm-pw"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="re-enter new password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handlePassword}
              disabled={updateSecurity.isPending || !currentPw || !newPw || !confirmPw}
              className="bg-[#0F4C81] text-white hover:bg-[#1E6CB5]"
            >
              {updateSecurity.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Update Password
            </Button>
            <p className="text-[10px] text-muted-foreground">
              Passwords are encrypted before being stored. We never display or send your password in plain text.
            </p>
          </div>
        </div>
      </Card>

      {/* Secret Keys cosmetic card */}
      <Card className="p-5">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[#D4AF37]" />
          <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Platform Secret Keys</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          These internal signing keys are used to secure admin sessions and webhook payloads.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Admin Session Secret</div>
            <div className="mt-1 font-mono text-sm tracking-widest text-foreground">••••••••••••••••</div>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Webhook Signing Secret</div>
            <div className="mt-1 font-mono text-sm tracking-widest text-foreground">••••••••••••••••</div>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button
            variant="outline"
            onClick={() => toast.info('Key rotation is coming soon.')}
          >
            <RefreshCw className="h-4 w-4" /> Rotate Keys
          </Button>
        </div>
      </Card>
    </div>
  )
}

/* ============================================================
 * Gateways Tab — Payment Gateway Switcher + Bank Accounts
 * ============================================================ */
function GatewaysTab() {
  const { data, isLoading } = usePaymentGateways()
  const updateGateway = useUpdatePaymentGateway()
  const createBank = useCreateBankAccount()
  const updateBank = useUpdateBankAccount()
  const deleteBank = useDeleteBankAccount()

  const gateways = (data?.gateways ?? []) as Array<{
    id: string
    provider: string
    displayName: string
    isActive: boolean
    sandbox: boolean
    publishableKey: string | null
    secretKey: string | null
    webhookSecret: string | null
    clientId: string | null
    clientSecret: string | null
    payoutEmail: string | null
    notes: string | null
  }>
  const banks = (data?.bankAccounts ?? []) as Array<{
    id: string
    bankName: string
    accountHolder: string
    iban: string | null
    accountNumber: string | null
    swiftCode: string | null
    branchCode: string | null
    country: string | null
    currency: string
    isDefault: boolean
    notes: string | null
  }>

  if (isLoading) return <Card className="h-[420px] animate-pulse bg-muted/40" />

  const cardGateways = gateways.filter((g) => g.provider === 'STRIPE' || g.provider === 'PAYPAL')
  const mobileGateways = gateways.filter((g) => g.provider === 'JAZZCASH' || g.provider === 'EASYPAISA')

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {cardGateways
          .slice()
          .sort((a, b) => (a.provider === 'STRIPE' ? -1 : 1))
          .map((g) => (
            <GatewayCard
              key={g.id}
              gateway={g}
              onSave={(patch) =>
                updateGateway.mutate(
                  { id: g.id, ...patch },
                  {
                    onSuccess: () => toast.success(`${g.displayName} settings saved`),
                    onError: (e: Error) => toast.error(e.message || 'Failed to save gateway'),
                  }
                )
              }
              saving={updateGateway.isPending}
            />
          ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {mobileGateways.map((g) => (
          <MobileGatewayCard
            key={g.id}
            gateway={g}
            onSave={(patch) =>
              updateGateway.mutate(
                { id: g.id, ...patch },
                {
                  onSuccess: () => toast.success(`${g.displayName} settings saved`),
                  onError: (e: Error) => toast.error(e.message || 'Failed to save gateway'),
                }
              )
            }
            saving={updateGateway.isPending}
          />
        ))}
      </div>

      <BankAccountsCard
        banks={banks}
        onCreate={(payload: any) =>
          createBank.mutate(payload, {
            onSuccess: () => toast.success('Bank account added'),
            onError: (e: Error) => toast.error(e.message || 'Failed to add bank account'),
          })
        }
        onUpdate={(id, patch) =>
          updateBank.mutate(
            { id, ...patch },
            {
              onSuccess: () => toast.success('Bank account updated'),
              onError: (e: Error) => toast.error(e.message || 'Failed to update bank account'),
            }
          )
        }
        onDelete={(id) =>
          deleteBank.mutate(id, {
            onSuccess: () => toast.success('Bank account deleted'),
            onError: (e: Error) => toast.error(e.message || 'Failed to delete bank account'),
          })
        }
        busy={createBank.isPending || updateBank.isPending || deleteBank.isPending}
      />
    </div>
  )
}

function GatewayCard({
  gateway,
  onSave,
  saving,
}: {
  gateway: {
    id: string
    provider: string
    displayName: string
    isActive: boolean
    sandbox: boolean
    publishableKey: string | null
    secretKey: string | null
    webhookSecret: string | null
    clientId: string | null
    clientSecret: string | null
    payoutEmail: string | null
    notes: string | null
  }
  onSave: (patch: Record<string, unknown>) => void
  saving: boolean
}) {
  const isStripe = gateway.provider === 'STRIPE'
  const [publishableKey, setPublishableKey] = React.useState(gateway.publishableKey ?? '')
  const [secretKey, setSecretKey] = React.useState(gateway.secretKey ?? '')
  const [webhookSecret, setWebhookSecret] = React.useState(gateway.webhookSecret ?? '')
  const [clientId, setClientId] = React.useState(gateway.clientId ?? '')
  const [clientSecret, setClientSecret] = React.useState(gateway.clientSecret ?? '')
  const [payoutEmail, setPayoutEmail] = React.useState(gateway.payoutEmail ?? '')
  const [showSecret, setShowSecret] = React.useState(false)

  const handleSave = () => {
    onSave({
      isActive: gateway.isActive,
      sandbox: gateway.sandbox,
      publishableKey,
      secretKey,
      webhookSecret,
      clientId,
      clientSecret,
      payoutEmail,
    })
  }

  return (
    <Card className="flex flex-col p-0">
      <div className="flex items-center justify-between gap-2 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F4C81/0.12] text-[#0F4C81]">
            {isStripe ? <CreditCard className="h-4.5 w-4.5" /> : <Wallet className="h-4.5 w-4.5" />}
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">{gateway.displayName}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{gateway.provider}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Badge
            variant="outline"
            className={
              gateway.isActive
                ? 'border-[#10B981/0.4] bg-[#10B981/0.12] text-[#059669]'
                : 'border-border bg-muted/40 text-muted-foreground'
            }
          >
            {gateway.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Badge
            variant="outline"
            className={
              gateway.sandbox
                ? 'border-[#D97706/0.4] bg-[#D97706/0.12] text-[#B45309]'
                : 'border-[#DC2626/0.3] bg-[#DC2626/0.08] text-[#DC2626]'
            }
          >
            {gateway.sandbox ? 'Sandbox' : 'Live'}
          </Badge>
        </div>
      </div>

      <div className="flex-1 space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-muted/30 p-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold">
            <Switch
              checked={gateway.isActive}
              onCheckedChange={(v) => onSave({ isActive: v })}
            />
            Active
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold">
            <Switch
              checked={gateway.sandbox}
              onCheckedChange={(v) => onSave({ sandbox: v })}
            />
            Sandbox mode
          </label>
        </div>

        {isStripe ? (
          <>
            <Field label="Publishable Key">
              <Input
                value={publishableKey}
                onChange={(e) => setPublishableKey(e.target.value)}
                placeholder="pk_live_... / pk_test_..."
                className="font-mono text-xs"
              />
            </Field>
            <Field label="Secret Key">
              <PasswordInput
                value={secretKey}
                onChange={setSecretKey}
                show={showSecret}
                onToggle={() => setShowSecret((s) => !s)}
                placeholder="sk_live_... / sk_test_..."
              />
            </Field>
            <Field label="Webhook Signing Secret">
              <PasswordInput
                value={webhookSecret}
                onChange={setWebhookSecret}
                show={showSecret}
                onToggle={() => setShowSecret((s) => !s)}
                placeholder="whsec_..."
              />
            </Field>
            <Field label="Payout Email (Stripe Connect)">
              <Input
                type="email"
                value={payoutEmail}
                onChange={(e) => setPayoutEmail(e.target.value)}
                placeholder="payouts@qtuor.com"
              />
            </Field>
          </>
        ) : (
          <>
            <Field label="Client ID">
              <Input
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="AY..."
                className="font-mono text-xs"
              />
            </Field>
            <Field label="Client Secret">
              <PasswordInput
                value={clientSecret}
                onChange={setClientSecret}
                show={showSecret}
                onToggle={() => setShowSecret((s) => !s)}
                placeholder="EO..."
              />
            </Field>
            <Field label="Payout Email (PayPal Payouts)">
              <Input
                type="email"
                value={payoutEmail}
                onChange={(e) => setPayoutEmail(e.target.value)}
                placeholder="payouts@qtuor.com"
              />
            </Field>
          </>
        )}
      </div>

      <div className="flex justify-end border-t border-border p-4">
        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Save Credentials
        </Button>
      </div>
    </Card>
  )
}

function MobileGatewayCard({
  gateway,
  onSave,
  saving,
}: {
  gateway: {
    id: string
    provider: string
    displayName: string
    isActive: boolean
    sandbox: boolean
    clientId: string | null
    clientSecret: string | null
    notes: string | null
  }
  onSave: (patch: Record<string, unknown>) => void
  saving: boolean
}) {
  // Merchant ID maps to `clientId`; Secure Key / Hash Key maps to `clientSecret`.
  const [merchantId, setMerchantId] = React.useState(gateway.clientId ?? '')
  const [secureKey, setSecureKey] = React.useState(gateway.clientSecret ?? '')
  const [showSecret, setShowSecret] = React.useState(false)

  const handleSave = () => {
    onSave({
      isActive: gateway.isActive,
      sandbox: gateway.sandbox,
      clientId: merchantId,
      clientSecret: secureKey,
    })
  }

  return (
    <Card className="flex flex-col p-0">
      <div className="flex items-center justify-between gap-2 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F4C81/0.12] text-[#0F4C81]">
            <Smartphone className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">{gateway.displayName}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {gateway.provider} · Mobile Wallet
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Badge
            variant="outline"
            className={
              gateway.isActive
                ? 'border-[#10B981/0.4] bg-[#10B981/0.12] text-[#059669]'
                : 'border-border bg-muted/40 text-muted-foreground'
            }
          >
            {gateway.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Badge
            variant="outline"
            className={
              gateway.sandbox
                ? 'border-[#D97706/0.4] bg-[#D97706/0.12] text-[#B45309]'
                : 'border-[#DC2626/0.3] bg-[#DC2626/0.08] text-[#DC2626]'
            }
          >
            {gateway.sandbox ? 'Sandbox' : 'Live'}
          </Badge>
        </div>
      </div>

      <div className="flex-1 space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-muted/30 p-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold">
            <Switch
              checked={gateway.isActive}
              onCheckedChange={(v) => onSave({ isActive: v })}
            />
            Active
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold">
            <Switch
              checked={gateway.sandbox}
              onCheckedChange={(v) => onSave({ sandbox: v })}
            />
            Sandbox mode
          </label>
        </div>

        <Field label="Merchant ID">
          <Input
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
            placeholder={gateway.provider === 'JAZZCASH' ? 'MC12345' : 'EP67890'}
            className="font-mono text-xs"
          />
        </Field>
        <Field label={gateway.provider === 'JAZZCASH' ? 'Secure Key (Hash Key)' : 'Secure Key / Salt'}>
          <PasswordInput
            value={secureKey}
            onChange={setSecureKey}
            show={showSecret}
            onToggle={() => setShowSecret((s) => !s)}
            placeholder="••••••••••••"
          />
        </Field>
        <p className="rounded-md bg-[#F1F5F9/0.6] p-2 text-[10px] text-muted-foreground">
          Used to receive local Pakistani mobile-wallet payments. Students select {gateway.displayName} at checkout and upload a receipt of their transfer; admin verifies before activating the subscription.
        </p>
      </div>

      <div className="flex justify-end border-t border-border p-4">
        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Save Credentials
        </Button>
      </div>
    </Card>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function PasswordInput({
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10 font-mono text-xs"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={show ? 'Hide secret' : 'Show secret'}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

function BankAccountsCard({
  banks,
  onCreate,
  onUpdate,
  onDelete,
  busy,
}: {
  banks: Array<{
    id: string
    bankName: string
    accountHolder: string
    iban: string | null
    accountNumber: string | null
    swiftCode: string | null
    branchCode: string | null
    country: string | null
    currency: string
    isDefault: boolean
    notes: string | null
  }>
  onCreate: (payload: Record<string, unknown>) => void
  onUpdate: (id: string, patch: Record<string, unknown>) => void
  onDelete: (id: string) => void
  busy: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<string | null>(null)

  const maskIban = (iban: string | null) => {
    if (!iban) return '—'
    if (iban.length <= 6) return iban
    return `${iban.slice(0, 4)} •••• •••• ${iban.slice(-4)}`
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 p-4">
        <div className="flex items-center gap-2">
          <Landmark className="h-4.5 w-4.5 text-[#0F4C81]" />
          <span className="font-bold text-foreground">Bank Accounts</span>
          <span className="text-xs text-muted-foreground">(Manual Wire Transfers)</span>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true) }} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Bank Account
        </Button>
      </div>

      <div className="max-h-96 overflow-y-auto scrollbar-quran">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Bank</TableHead>
              <TableHead>Holder</TableHead>
              <TableHead>IBAN / Account</TableHead>
              <TableHead>SWIFT</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Default</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No bank accounts yet. Click “Add Bank Account” to create one.
                </TableCell>
              </TableRow>
            ) : (
              banks.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="pl-4">
                    <div className="font-semibold text-foreground">{b.bankName}</div>
                    {b.country && <div className="text-[10px] text-muted-foreground">{b.country}</div>}
                  </TableCell>
                  <TableCell className="text-sm">{b.accountHolder}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{maskIban(b.iban || b.accountNumber)}</TableCell>
                  <TableCell className="font-mono text-xs">{b.swiftCode || '—'}</TableCell>
                  <TableCell><Badge variant="outline">{b.currency}</Badge></TableCell>
                  <TableCell>
                    {b.isDefault ? (
                      <Badge className="border-[#D4AF37/0.4] bg-[#D4AF37/0.15] text-[#D4AF37]">Default</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-1">
                      {!b.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() => onUpdate(b.id, { isDefault: true })}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => { setEditing(b.id); setOpen(true) }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        className="text-[#DC2626] hover:bg-[#DC2626/0.08]"
                        onClick={() => {
                          if (confirm(`Delete bank account "${b.bankName}"?`)) onDelete(b.id)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BankAccountDialog
        open={open}
        editing={editing ? banks.find((b) => b.id === editing) ?? null : null}
        onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null) }}
        onSubmit={(payload) => {
          if (editing) onUpdate(editing, payload)
          else onCreate(payload)
          setOpen(false)
          setEditing(null)
        }}
        busy={busy}
      />
    </Card>
  )
}

function BankAccountDialog({
  open,
  editing,
  onOpenChange,
  onSubmit,
  busy,
}: {
  open: boolean
  editing: {
    id: string
    bankName: string
    accountHolder: string
    iban: string | null
    accountNumber: string | null
    swiftCode: string | null
    branchCode: string | null
    country: string | null
    currency: string
    isDefault: boolean
    notes: string | null
  } | null
  onOpenChange: (v: boolean) => void
  onSubmit: (payload: Record<string, unknown>) => void
  busy: boolean
}) {
  const [form, setForm] = React.useState<Record<string, string>>({
    bankName: '',
    accountHolder: '',
    iban: '',
    accountNumber: '',
    swiftCode: '',
    branchCode: '',
    country: '',
    currency: 'USD',
    notes: '',
    isDefault: 'false',
  })

  React.useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          bankName: editing.bankName,
          accountHolder: editing.accountHolder,
          iban: editing.iban ?? '',
          accountNumber: editing.accountNumber ?? '',
          swiftCode: editing.swiftCode ?? '',
          branchCode: editing.branchCode ?? '',
          country: editing.country ?? '',
          currency: editing.currency,
          notes: editing.notes ?? '',
          isDefault: editing.isDefault ? 'true' : 'false',
        })
      } else {
        setForm({
          bankName: '',
          accountHolder: '',
          iban: '',
          accountNumber: '',
          swiftCode: '',
          branchCode: '',
          country: '',
          currency: 'USD',
          notes: '',
          isDefault: 'false',
        })
      }
    }
  }, [open, editing])

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const submit = () => {
    if (!form.bankName.trim() || !form.accountHolder.trim()) {
      toast.error('Bank name and account holder are required')
      return
    }
    onSubmit({
      bankName: form.bankName.trim(),
      accountHolder: form.accountHolder.trim(),
      iban: form.iban.trim(),
      accountNumber: form.accountNumber.trim(),
      swiftCode: form.swiftCode.trim(),
      branchCode: form.branchCode.trim(),
      country: form.country.trim(),
      currency: form.currency.trim() || 'USD',
      isDefault: form.isDefault === 'true',
      notes: form.notes.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Bank Account' : 'Add Bank Account'}</DialogTitle>
          <DialogDescription>
            Bank accounts are used to receive manual wire transfers and platform payouts.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="ba-bank">Bank Name *</Label>
            <Input id="ba-bank" value={form.bankName} onChange={(e) => set('bankName', e.target.value)} placeholder="Emirates NBD" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="ba-holder">Account Holder *</Label>
            <Input id="ba-holder" value={form.accountHolder} onChange={(e) => set('accountHolder', e.target.value)} placeholder="Qtuor Platform LLC" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ba-iban">IBAN</Label>
            <Input id="ba-iban" value={form.iban} onChange={(e) => set('iban', e.target.value)} placeholder="AE00 0000 0000 0000 0000" className="font-mono text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ba-acc">Account Number</Label>
            <Input id="ba-acc" value={form.accountNumber} onChange={(e) => set('accountNumber', e.target.value)} placeholder="0123456789" className="font-mono text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ba-swift">SWIFT Code</Label>
            <Input id="ba-swift" value={form.swiftCode} onChange={(e) => set('swiftCode', e.target.value)} placeholder="EBILAEAD" className="font-mono text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ba-branch">Branch Code</Label>
            <Input id="ba-branch" value={form.branchCode} onChange={(e) => set('branchCode', e.target.value)} placeholder="001" className="font-mono text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ba-country">Country</Label>
            <Input id="ba-country" value={form.country} onChange={(e) => set('country', e.target.value)} placeholder="United Arab Emirates" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ba-currency">Currency</Label>
            <Input id="ba-currency" value={form.currency} onChange={(e) => set('currency', e.target.value)} placeholder="USD" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="ba-notes">Notes</Label>
            <Textarea id="ba-notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Internal reference notes (optional)" rows={2} />
          </div>
          <label className="flex cursor-pointer items-center gap-2 sm:col-span-2">
            <Switch checked={form.isDefault === 'true'} onCheckedChange={(v) => set('isDefault', v ? 'true' : 'false')} />
            <span className="text-sm">Set as default receiving account</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {editing ? 'Save Changes' : 'Add Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ============================================================
 * Ledger Tab — Receivables + Payables (55/45 Wallet Auditor)
 * ============================================================ */
function LedgerTab() {
  const [section, setSection] = React.useState<'receivables' | 'payables'>('receivables')

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(['receivables', 'payables'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
              section === s
                ? 'border-transparent bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-background text-muted-foreground hover:bg-muted/60'
            )}
          >
            {s === 'receivables' ? <DollarSign className="h-3.5 w-3.5" /> : <Wallet className="h-3.5 w-3.5" />}
            {s === 'receivables' ? 'Student Receivables' : 'Teacher Payables'}
          </button>
        ))}
      </div>

      {section === 'receivables' ? <ReceivablesSection /> : <PayablesSection />}
    </div>
  )
}

function ReceivablesSection() {
  const { data, isLoading, isError } = useReceivablesLedger()
  const updatePaymentStatus = useUpdatePaymentStatus()
  if (isLoading) return <Card className="h-[420px] animate-pulse bg-muted/40" />
  if (isError) return <Card className="p-6 text-sm text-muted-foreground">Failed to load receivables.</Card>

  const payments = (data?.payments ?? []) as Array<{
    id: string
    studentName: string
    studentEmail: string
    planName: string
    amount: number
    paymentMethod: string
    invoiceId: string | null
    status: string
    receiptUrl: string | null
    paidAt: string
  }>
  const summary = data?.summary ?? {
    total: 0,
    successCount: 0,
    failedCount: 0,
    pendingCount: 0,
    refundedCount: 0,
    totalAmount: 0,
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      SUCCESS: 'border-[#10B981/0.4] bg-[#10B981/0.12] text-[#059669]',
      FAILED: 'border-[#DC2626/0.3] bg-[#DC2626/0.08] text-[#DC2626]',
      PENDING: 'border-[#D97706/0.4] bg-[#D97706/0.12] text-[#B45309]',
      REFUNDED: 'border-border bg-muted/40 text-muted-foreground',
    }
    return map[status] || map.REFUNDED
  }

  const handleStatusChange = (id: string, status: string, studentName: string) => {
    updatePaymentStatus.mutate(
      { id, status },
      {
        onSuccess: () =>
          toast.success(
            status === 'SUCCESS'
              ? `Payment approved — ${studentName}'s subscription is now active.`
              : `Payment ${status.toLowerCase()} for ${studentName}.`
          ),
        onError: (e: Error) => toast.error(e.message || 'Failed to update payment status'),
      }
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat label="Total Received" value={`$${(summary.total || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} accent="green" />
        <MiniStat label="Successful" value={summary.successCount || 0} accent="primary" />
        <MiniStat label="Failed" value={summary.failedCount || 0} accent="red" />
        <MiniStat label="Pending" value={summary.pendingCount || 0} accent="amber" />
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[#0F4C81]" />
            <span className="font-bold text-foreground">Student Payment Audit Log</span>
          </div>
          <span className="text-xs text-muted-foreground">{payments.length} records</span>
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-quran">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Student</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    No payment records yet.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="pl-4">
                      <div className="font-semibold text-foreground">{p.studentName}</div>
                      <div className="text-[10px] text-muted-foreground">{p.studentEmail}</div>
                    </TableCell>
                    <TableCell className="max-w-[200px] text-xs text-muted-foreground">{p.planName}</TableCell>
                    <TableCell className="font-semibold text-foreground">${p.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{p.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {format(new Date(p.paidAt), 'MMM d, yyyy · HH:mm')}
                    </TableCell>
                    <TableCell>
                      {p.receiptUrl ? (
                        <a
                          href={p.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F4C81] hover:underline"
                          onClick={(e) => {
                            e.preventDefault()
                            window.open(p.receiptUrl!, '_blank', 'noopener,noreferrer')
                          }}
                        >
                          <ExternalLink className="h-3 w-3" /> View Receipt
                        </a>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase', statusBadge(p.status))}>
                        {p.status}
                      </span>
                    </TableCell>
                    <TableCell className="pr-4">
                      {p.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            className="h-7 gap-1 bg-[#0F4C81] text-white hover:bg-[#1E6CB5]"
                            disabled={updatePaymentStatus.isPending}
                            onClick={() => handleStatusChange(p.id, 'SUCCESS', p.studentName)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 border-[#DC2626/0.4] text-[#DC2626] hover:bg-[#DC2626/0.08]"
                            disabled={updatePaymentStatus.isPending}
                            onClick={() => handleStatusChange(p.id, 'REFUNDED', p.studentName)}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="text-right text-[10px] text-muted-foreground">—</div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

function PayablesSection() {
  const { data, isLoading, isError } = usePayablesLedger()
  const [releaseTarget, setReleaseTarget] = React.useState<{
    id: string
    name: string
    balance: number
  } | null>(null)

  if (isLoading) return <Card className="h-[420px] animate-pulse bg-muted/40" />
  if (isError) return <Card className="p-6 text-sm text-muted-foreground">Failed to load payables.</Card>

  const tutors = (data?.tutors ?? []) as Array<{
    id: string
    name: string
    email: string
    wallet: {
      balance: number
      pendingPayout: number
      totalEarned: number
      escrowHeld: number
      platformRevenue: number
    }
    lessonsCount: number
    releasedSplits: number
    releasable: number
  }>
  const summary = data?.summary ?? {
    totalPending: 0,
    totalReleased: 0,
    totalEscrow: 0,
    platformRevenue: 0,
    totalReleasable: 0,
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat label="Pending Payouts" value={`$${(summary.totalPending || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} accent="amber" />
        <MiniStat label="Total Released" value={`$${(summary.totalReleased || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} accent="green" />
        <MiniStat label="In Escrow" value={`$${(summary.totalEscrow || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} accent="primary" />
        <MiniStat label="Platform Revenue (45%)" value={`$${(summary.platformRevenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} accent="gold" />
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 p-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-[#0F4C81]" />
            <span className="font-bold text-foreground">Tutor Wallet Auditor (55% / 45%)</span>
          </div>
          <span className="text-xs text-muted-foreground">{tutors.length} tutors</span>
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-quran">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Tutor</TableHead>
                <TableHead>Cumulative Earned</TableHead>
                <TableHead>Releasable Wallet</TableHead>
                <TableHead>Escrow Held</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tutors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No tutor wallets found.
                  </TableCell>
                </TableRow>
              ) : (
                tutors.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="pl-4">
                      <div className="font-semibold text-foreground">{t.name}</div>
                      <div className="text-[10px] text-muted-foreground">{t.email}</div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">${t.wallet.totalEarned.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={cn('font-mono text-sm font-semibold', t.wallet.balance > 0 ? 'text-[#059669]' : 'text-muted-foreground')}>
                        ${t.wallet.balance.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">${t.wallet.escrowHeld.toFixed(2)}</TableCell>
                    <TableCell className="text-sm">{t.lessonsCount.toLocaleString()}</TableCell>
                    <TableCell className="pr-4">
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          disabled={t.wallet.balance <= 0}
                          onClick={() => setReleaseTarget({ id: t.id, name: t.name, balance: t.wallet.balance })}
                          className="bg-[#0F4C81] text-white hover:bg-[#1E6CB5]"
                        >
                          <Send className="h-3.5 w-3.5" /> Release Payment
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ReleasePaymentDialog
        target={releaseTarget}
        onOpenChange={(v) => { if (!v) setReleaseTarget(null) }}
      />
    </div>
  )
}

function ReleasePaymentDialog({
  target,
  onOpenChange,
}: {
  target: { id: string; name: string; balance: number } | null
  onOpenChange: (v: boolean) => void
}) {
  const release = useReleasePayment()
  const [amount, setAmount] = React.useState('')
  const [method, setMethod] = React.useState('BANK_TRANSFER')
  const [destination, setDestination] = React.useState('')

  React.useEffect(() => {
    if (target) {
      setAmount(target.balance.toFixed(2))
      setMethod('BANK_TRANSFER')
      setDestination('')
    }
  }, [target])

  const open = !!target
  const amt = Number(amount) || 0

  const submit = () => {
    if (!target) return
    if (!Number.isFinite(amt) || amt <= 0) return toast.error('Enter a valid amount')
    if (amt > target.balance) return toast.error(`Amount exceeds the tutor's available balance ($${target.balance.toFixed(2)})`)

    release.mutate(
      { tutorId: target.id, amount: amt, method, destination: destination.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(`Released $${amt.toFixed(2)} to ${target.name}`)
          onOpenChange(false)
        },
        onError: (e: Error) => toast.error(e.message || 'Failed to release payment'),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Release Payment</DialogTitle>
          <DialogDescription>
            Release funds from <strong>{target?.name}</strong>'s wallet. The amount will be deducted and logged in the payout ledger.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Available balance</span>
              <span className="font-mono font-semibold text-[#059669]">${target?.balance.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rel-amt">Amount (USD)</Label>
            <Input
              id="rel-amt"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rel-method">Payout Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger id="rel-method"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BANK_TRANSFER">Bank Transfer (Wire)</SelectItem>
                <SelectItem value="PAYPAL">PayPal Payouts</SelectItem>
                <SelectItem value="STRIPE">Stripe Connect</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rel-dest">Destination (masked in log)</Label>
            <Input
              id="rel-dest"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="IBAN ••••1234 / paypal@email.com"
            />
            <p className="text-[10px] text-muted-foreground">Only the last 4 characters are stored.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={submit}
            disabled={release.isPending || !target || amt <= 0}
            className="bg-[#0F4C81] text-white hover:bg-[#1E6CB5]"
          >
            {release.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Confirm Release
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MiniStat({ label, value, accent }: { label: string; value: React.ReactNode; accent: 'primary' | 'amber' | 'gold' | 'green' | 'red' }) {
  const accents: Record<string, string> = {
    primary: 'bg-[#0F4C81/0.12] text-[#0F4C81]',
    amber: 'bg-[#D97706/0.18] text-[#B45309]',
    gold: 'bg-[#D4AF37/0.18] text-[#D4AF37]',
    green: 'bg-[#10B981/0.18] text-[#059669]',
    red: 'bg-[#DC2626/0.12] text-[#DC2626]',
  }
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-extrabold text-foreground">{value}</p>
        </div>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', accents[accent])}>
          <DollarSign className="h-4 w-4" />
        </div>
      </div>
    </Card>
  )
}

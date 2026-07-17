'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, countryFlag } from '@/components/shared/avatar'
import { AudioIntroPlayer } from '@/components/shared/audio-intro-player'
import { VerifiedBadge, NativeArabicBadge, HafizBadge, IjazaBadge, StarRating } from '@/components/brand/badges'
import { Users, Clock, BookOpen, ChevronRight, GraduationCap, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { usePublicWhatsAppSettings } from '@/lib/queries'
import { toast } from 'sonner'

export interface TutorWithProfile {
  id: string
  name: string
  country?: string | null
  avatar?: string | null
  profile: {
    id: string
    bio: string
    hourlyRate: number
    perClassRate?: number
    rating: number
    reviewCount: number
    studentCount: number
    lessonsCount: number
    verified: boolean
    nativeArabic: boolean
    hafiz: boolean
    ijazaCertified: boolean
    audioIntroText?: string | null
    specialties: string[]
    languages: string[]
    experienceYears: number
  } | null
}

/**
 * Horizontal tutor row card (PRD: "Horizontal row display cards
 * for tutors instead of vertical grids").
 */
export function TutorRowCard({ tutor, onView, hidePricing = false }: { tutor: TutorWithProfile; onView?: (id: string) => void; hidePricing?: boolean }) {
  const openAuth = useAppStore((s) => s.openAuth)
  const user = useAppStore((s) => s.user)
  const { data: settingsData } = usePublicWhatsAppSettings()
  const settings = settingsData?.settings
  const p = tutor.profile
  if (!p) return null

  const contactAdminWhatsApp = () => {
    const adminPhone = settings?.adminPhone?.replace(/[^\d]/g, '') || '1234567890'
    const msg = encodeURIComponent(`Assalam-o-Alaikum! I'm interested in booking a class with ${tutor.name} on Qtuor. Could you provide more information?`)
    window.open(`https://wa.me/${adminPhone}?text=${msg}`, '_blank')
  }

  return (
    <Card className="group relative overflow-hidden p-0 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-[oklch(0.34_0.13_256)] to-[oklch(0.62_0.14_230)]" />
      <div className="grid gap-0 sm:grid-cols-[auto_1fr_auto]">
        {/* Photo + badges column */}
        <div className="flex flex-col items-center gap-3 p-5 sm:border-r sm:border-border/60">
          <div className="relative">
            <Avatar name={tutor.name} src={tutor.avatar} size={88} country={tutor.country} />
            {p.verified && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[oklch(0.62_0.14_230)] px-2 py-0.5 text-[9px] font-bold uppercase text-white shadow">
                Verified
              </span>
            )}
          </div>
          <StarRating rating={p.rating} />
          <span className="text-[11px] text-muted-foreground">({p.reviewCount} reviews)</span>
        </div>

        {/* Main info */}
        <div className="flex flex-col gap-3 p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{tutor.name}</h3>
              <span className="text-xs text-muted-foreground">{countryFlag(tutor.country)} {tutor.country}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {p.nativeArabic && <NativeArabicBadge />}
              {p.hafiz && <HafizBadge />}
              {p.ijazaCertified && <IjazaBadge />}
            </div>
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">{p.bio}</p>

          <div className="flex flex-wrap gap-1.5">
            {p.specialties.map((s) => (
              <Badge key={s} variant="outline" className="border-[oklch(0.62_0.14_230/0.3)] bg-[oklch(0.62_0.14_230/0.06)] text-[oklch(0.40_0.11_258)]">
                {s}
              </Badge>
            ))}
            <Badge variant="outline" className="border-border text-muted-foreground">
              {p.languages.join(' · ')}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <Stat icon={<Users className="h-3.5 w-3.5" />} value={p.studentCount} label="Students" />
            <Stat icon={<BookOpen className="h-3.5 w-3.5" />} value={p.lessonsCount} label="Lessons" />
            <Stat icon={<Clock className="h-3.5 w-3.5" />} value={`${p.experienceYears}y`} label="Experience" />
          </div>

          {p.audioIntroText && (
            <div className="max-w-sm">
              <AudioIntroPlayer text={p.audioIntroText} name={tutor.name} />
            </div>
          )}
        </div>

        {/* Right CTA column */}
        <div className="flex flex-col items-center justify-center gap-2 border-t border-border/60 bg-muted/30 p-5 sm:border-l sm:border-t-0">
          {!hidePricing && (
            <div className="text-center">
              <div className="text-xs text-muted-foreground">From</div>
              <div className="text-2xl font-extrabold text-primary">${p.perClassRate ?? p.hourlyRate}</div>
              <div className="text-xs text-muted-foreground">/ class</div>
            </div>
          )}
          <Button
            className="w-full bg-[#0F4C81] text-white hover:bg-[#0E3D6B] transition-colors"
            onClick={() => (user ? onView?.(tutor.id) : openAuth('register', 'STUDENT'))}
          >
            Book Class
          </Button>
          <Button variant="ghost" size="sm" className="w-full gap-1 text-primary" onClick={() => onView?.(tutor.id)}>
            View profile <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          {settings?.allowTutorContactAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 border-[#0F4C81]/40 text-[#0F4C81] hover:bg-[#0F4C81]/10 hover:text-[#0F4C81]"
              onClick={contactAdminWhatsApp}
            >
              <MessageCircle className="h-3.5 w-3.5" /> Ask about this tutor
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1.5">
      <span className="text-[oklch(0.62_0.14_230)]">{icon}</span>
      <div className="leading-tight">
        <div className="font-semibold">{value}</div>
        <div className="text-[10px] text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  center?: boolean
  className?: string
}) {
  return (
    <div className={cn(center && 'text-center mx-auto', 'max-w-2xl', className)}>
      {eyebrow && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.62_0.14_230/0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[oklch(0.40_0.11_258)]">
          <GraduationCap className="h-3 w-3" /> {eyebrow}
        </span>
      )}
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-base text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

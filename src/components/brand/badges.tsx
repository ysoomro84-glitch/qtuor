import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Languages, BookOpenCheck, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Badge className={cn('gap-1 bg-[oklch(0.62_0.14_230)] text-white hover:bg-[oklch(0.55_0.14_230)]', className)}>
      <ShieldCheck className="h-3 w-3" /> Verified
    </Badge>
  )
}

export function NativeArabicBadge({ className }: { className?: string }) {
  return (
    <Badge variant="secondary" className={cn('gap-1 bg-[oklch(0.93_0.04_240)] text-primary', className)}>
      <Languages className="h-3 w-3" /> Native Arabic
    </Badge>
  )
}

export function HafizBadge({ className }: { className?: string }) {
  return (
    <Badge variant="secondary" className={cn('gap-1 bg-[oklch(0.78_0.15_85/0.18)] text-[oklch(0.55_0.13_75)] border-[oklch(0.78_0.15_85/0.4)]', className)}>
      <BookOpenCheck className="h-3 w-3" /> Hafiz
    </Badge>
  )
}

export function IjazaBadge({ className }: { className?: string }) {
  return (
    <Badge variant="secondary" className={cn('gap-1 bg-[oklch(0.45_0.10_260/0.1)] text-[oklch(0.40_0.10_260)] border-[oklch(0.45_0.10_260/0.3)]', className)}>
      <Award className="h-3 w-3" /> Ijaza
    </Badge>
  )
}

export function StarRating({ rating, size = 14, showValue = true }: { rating: number; size?: number; showValue?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="oklch(0.78 0.15 85)" aria-hidden>
        <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.8 5.9 20.4l1.5-6.8L2.2 9l6.9-.7L12 2z" />
      </svg>
      {showValue && <span className="font-semibold text-sm">{rating.toFixed(1)}</span>}
    </span>
  )
}

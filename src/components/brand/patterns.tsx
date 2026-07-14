import * as React from 'react'
import { cn } from '@/lib/utils'

export function IslamicPatternBand({ className, opacity = 0.08 }: { className?: string; opacity?: number }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
        <defs>
          <pattern id="girih" width="80" height="80" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="oklch(0.34 0.13 256)" strokeWidth="1">
              <path d="M40 0 L55 25 L40 50 L25 25 Z" />
              <path d="M0 40 L25 55 L50 40 L25 25 Z" />
              <path d="M40 50 L55 75 L40 100 L25 75 Z" />
              <path d="M50 40 L75 55 L100 40 L75 25 Z" />
              <circle cx="40" cy="40" r="6" />
              <circle cx="0" cy="0" r="6" />
              <circle cx="80" cy="0" r="6" />
              <circle cx="0" cy="80" r="6" />
              <circle cx="80" cy="80" r="6" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#girih)" />
      </svg>
    </div>
  )
}

export function StarMedallion({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.5" fill="none">
        <path d="M50 5 L61 28 L85 17 L74 41 L97 50 L74 59 L85 83 L61 72 L50 95 L39 72 L15 83 L26 59 L3 50 L26 41 L15 17 L39 28 Z" />
        <circle cx="50" cy="50" r="14" />
        <circle cx="50" cy="50" r="6" />
      </g>
    </svg>
  )
}

export function BismillahHeader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-3 text-primary/70', className)}>
      <StarMedallion className="h-5 w-5" />
      <span className="font-arabic text-lg" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
      <StarMedallion className="h-5 w-5" />
    </div>
  )
}

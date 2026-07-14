'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const COUNTRY_FLAGS: Record<string, string> = {
  Egypt: '🇪🇬',
  Jordan: '🇯🇴',
  'Saudi Arabia': '🇸🇦',
  Pakistan: '🇵🇰',
  Morocco: '🇲🇦',
  Turkey: '🇹🇷',
  'United Kingdom': '🇬🇧',
  'United States': '🇺🇸',
  Global: '🌍',
}

const GRADIENTS = [
  'from-[oklch(0.34_0.13_256)] to-[oklch(0.55_0.12_250)]',
  'from-[oklch(0.55_0.12_250)] to-[oklch(0.62_0.14_230)]',
  'from-[oklch(0.45_0.10_260)] to-[oklch(0.62_0.14_230)]',
  'from-[oklch(0.40_0.11_258)] to-[oklch(0.50_0.10_200)]',
]

export function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function Avatar({
  name,
  src,
  size = 44,
  country,
  className,
}: {
  name: string
  src?: string | null
  size?: number
  country?: string | null
  className?: string
}) {
  const idx = React.useMemo(() => {
    let h = 0
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
    return h % GRADIENTS.length
  }, [name])

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className={cn('rounded-full object-cover', className)}
      />
    )
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={cn(
        'relative flex items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-sm',
        GRADIENTS[idx],
        className
      )}
      aria-label={name}
    >
      {initialsOf(name)}
      {country && COUNTRY_FLAGS[country] && (
        <span
          className="absolute -bottom-0.5 -right-0.5 text-[10px] rounded-full bg-white shadow ring-1 ring-black/5"
          style={{ fontSize: Math.max(11, size * 0.26) }}
          title={country}
        >
          {COUNTRY_FLAGS[country]}
        </span>
      )}
    </div>
  )
}

export function countryFlag(country?: string | null) {
  return COUNTRY_FLAGS[country || ''] || '🌍'
}

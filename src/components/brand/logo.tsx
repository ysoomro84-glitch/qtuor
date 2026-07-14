import * as React from 'react'

interface LogoProps {
  className?: string
  /** Render the mark in a light tone for use on dark backgrounds (e.g. footer). */
  onDark?: boolean
}

/**
 * Qtuor logo — the official brand asset (`/brand/qtuor-logo.png`): a deep-navy
 * "Q" icon with a black "tuor" wordmark to its right, on a transparent background.
 *
 * This component renders the full lockup image, height-constrained via `className`
 * (e.g. `h-9`). Width auto-scales to preserve the aspect ratio. On dark backgrounds
 * pass `onDark` to invert the artwork to pure white (the standard treatment for
 * logos placed on dark surfaces).
 */
export function QtuorLogo({ className = 'h-9', onDark = false }: LogoProps) {
  return (
    <img
      src="/brand/qtuor-logo.png"
      alt="Qtuor"
      className={className}
      style={onDark ? { filter: 'brightness(0) invert(1)' } : undefined}
      draggable={false}
    />
  )
}

/**
 * Full lockup: the official Qtuor logo image (Q + "tuor") with the brand slogan
 * "LEARN · RECITE · EXCEL" set beneath it, centered. Height-constrained by `size`.
 * Use `onDark` on dark surfaces (footer, admin header) to render it white.
 */
export function QtuorLogoLockup({
  className = '',
  onDark = false,
  size = 'md',
}: {
  className?: string
  onDark?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const h = size === 'sm' ? 'h-7' : size === 'lg' ? 'h-11' : 'h-9'
  const sloganSize = size === 'sm' ? 'text-[7px]' : size === 'lg' ? 'text-[9.5px]' : 'text-[8px]'
  const sloganColor = onDark ? 'rgba(255,255,255,0.62)' : '#8EAEC6'

  return (
    <div className={`flex flex-col items-center leading-none ${className}`}>
      <QtuorLogo className={h} onDark={onDark} />
      <div
        className={`font-display mt-1 whitespace-nowrap font-semibold uppercase tracking-[0.22em] ${sloganSize}`}
        style={{ color: sloganColor }}
      >
        Learn · Recite · Excel
      </div>
    </div>
  )
}

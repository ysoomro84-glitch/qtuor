'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { CURRENCIES, CurrencyInfo, DEFAULT_CURRENCY } from '@/lib/currency'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, Globe } from 'lucide-react'

interface CurrencySwitcherProps {
  value: string
  onChange: (code: string) => void
  className?: string
}

export function CurrencySwitcher({ value, onChange, className }: CurrencySwitcherProps) {
  const [open, setOpen] = React.useState(false)
  const [dropup, setDropup] = React.useState(false)
  const [portalStyle, setPortalStyle] = React.useState<React.CSSProperties>({})
  const containerRef = React.useRef<HTMLDivElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const selected = CURRENCIES.find((c) => c.code === value) || CURRENCIES[0]

  // Calculate dropdown position using portal
  const updatePosition = React.useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const dropdownHeight = 400 // approximate max height
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const shouldDropUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow

    setDropup(shouldDropUp)
    setPortalStyle({
      position: 'fixed',
      zIndex: 9999,
      width: '300px',
      maxHeight: `${Math.min(380, shouldDropUp ? spaceAbove - 8 : spaceBelow - 8)}px`,
      ...(shouldDropUp
        ? { bottom: window.innerHeight - rect.top + 4, left: Math.min(rect.left, window.innerWidth - 320) }
        : { top: rect.bottom + 4, left: Math.min(rect.left, window.innerWidth - 320) }),
    })
  }, [])

  // Close on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      updatePosition()
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, updatePosition])

  // Update position on scroll/resize
  React.useEffect(() => {
    if (!open) return
    const handleUpdate = () => updatePosition()
    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)
    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [open, updatePosition])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
  }

  const dropdownContent = open ? createPortal(
    <div
      ref={dropdownRef}
      style={portalStyle}
      className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
      role="listbox"
      aria-label="Select currency"
    >
      <div className="overflow-y-auto" style={{ maxHeight: portalStyle.maxHeight as string || '380px' }}>
        {/* Popular currencies */}
        <div className="px-2 pt-2 pb-1">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Popular
          </div>
          {CURRENCIES.slice(0, 6).map((c) => (
            <CurrencyOption
              key={c.code}
              currency={c}
              isSelected={c.code === value}
              onSelect={() => {
                onChange(c.code)
                setOpen(false)
              }}
            />
          ))}
        </div>

        <div className="mx-2 border-t border-border" />

        {/* Other currencies */}
        <div className="px-2 pt-1 pb-2">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            More currencies
          </div>
          {CURRENCIES.slice(6).map((c) => (
            <CurrencyOption
              key={c.code}
              currency={c}
              isSelected={c.code === value}
              onSelect={() => {
                onChange(c.code)
                setOpen(false)
              }}
            />
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-border bg-muted/30 px-3 py-2 text-[10px] text-muted-foreground">
        Exchange rates are approximate. Final amount may vary at time of payment.
      </div>
    </div>,
    document.body
  ) : null

  return (
    <div ref={containerRef} className={cn('relative', className)} onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
          open
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border bg-background text-foreground hover:bg-muted/60'
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="h-4 w-4" />
        <span className="flex items-center gap-1.5">
          <span className="text-base leading-none">{selected.flag}</span>
          <span>{selected.code}</span>
          <span className="text-xs text-muted-foreground">({selected.symbol})</span>
        </span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && (dropup ? 'rotate-180' : 'rotate-180'))} />
      </button>

      {dropdownContent}
    </div>
  )
}

function CurrencyOption({
  currency,
  isSelected,
  onSelect,
}: {
  currency: CurrencyInfo
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm transition-colors',
        isSelected
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-foreground hover:bg-muted/60'
      )}
    >
      <span className="text-lg leading-none">{currency.flag}</span>
      <span className="flex-1 min-w-0">
        <span className="font-medium">{currency.code}</span>
        <span className="ml-1.5 text-xs text-muted-foreground truncate">{currency.name}</span>
      </span>
      <span className="text-xs font-medium text-muted-foreground shrink-0">{currency.symbol}</span>
      {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
    </button>
  )
}

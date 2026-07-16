'use client'

import * as React from 'react'
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
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selected = CURRENCIES.find((c) => c.code === value) || CURRENCIES[0]

  // Close on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={containerRef} className={cn('relative z-50', className)} onKeyDown={handleKeyDown}>
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
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className="fixed z-[9999] mt-1 rounded-xl border border-border bg-card shadow-2xl"
          style={{
            top: containerRef.current
              ? containerRef.current.getBoundingClientRect().bottom + 4
              : undefined,
            left: containerRef.current
              ? Math.min(containerRef.current.getBoundingClientRect().left, window.innerWidth - 320)
              : undefined,
            width: '300px',
            maxHeight: '380px',
          }}
          role="listbox"
          aria-label="Select currency"
        >
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

          {/* Disclaimer */}
          <div className="sticky bottom-0 border-t border-border bg-muted/30 px-3 py-2 text-[10px] text-muted-foreground backdrop-blur-sm">
            Exchange rates are approximate. Final amount may vary at time of payment.
          </div>
        </div>
      )}
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

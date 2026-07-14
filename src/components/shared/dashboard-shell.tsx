'use client'

import * as React from 'react'
import { QtuorLogoLockup } from '@/components/brand/logo'
import { Avatar } from '@/components/shared/avatar'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Bell, Menu, X, LogOut, LayoutDashboard } from 'lucide-react'

/**
 * Shared Dashboard Shell — fixed left sidebar + thin top bar layout.
 *
 * Used by Student & Tutor portals (mirrors the Admin sidebar layout).
 * The public navbar/footer are NOT rendered — this is a private workspace.
 *
 * - Left sidebar (w-64, Deep Navy #0A192F): Qtuor logo + nav items + profile/logout.
 * - Thin top bar (h-16): current section title + notification bell + avatar.
 * - Main content area (flex-1): renders the active section's children.
 *
 * Mobile-responsive: sidebar collapses to a hamburger toggle.
 */

export interface DashboardNavItem {
  value: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export function DashboardShell({
  navItems,
  activeView,
  setActiveView,
  userName,
  userEmail,
  children,
}: {
  navItems: DashboardNavItem[]
  activeView: string
  setActiveView: (v: string) => void
  userName: string
  userEmail: string
  children: React.ReactNode
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)
  const logout = useAppStore((s) => s.logout)
  const setView = useAppStore((s) => s.setView)

  const handleLogout = async () => {
    try { await fetch('/api/auth/me', { method: 'DELETE' }) } catch {}
    logout()
  }

  const currentNav = navItems.find((n) => n.value === activeView)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setMobileSidebarOpen(false)} aria-hidden />
      )}

      {/* Left Sidebar (persistent, Deep Navy Blue) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col transition-transform duration-300 lg:static lg:translate-x-0',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ background: '#0A192F' }}
      >
        {/* Sidebar header — Qtuor logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <button onClick={() => setView('landing')} className="transition hover:opacity-80" aria-label="Qtuor home">
            <QtuorLogoLockup onDark size="sm" />
          </button>
          <button onClick={() => setMobileSidebarOpen(false)} className="text-white/60 hover:text-white lg:hidden" aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-quran px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeView === item.value
            return (
              <button
                key={item.value}
                onClick={() => { setActiveView(item.value); setMobileSidebarOpen(false) }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-[#8EAEC6]/20 text-white ring-1 ring-[#8EAEC6]/30'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-[#8EAEC6]' : 'text-white/50')} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge ? (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[10px] font-bold text-[#0A192F]">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>

        {/* Sidebar footer — profile + logout */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
            <Avatar name={userName} size={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{userName}</p>
              <p className="truncate text-[10px] text-white/50">{userEmail}</p>
            </div>
            <button onClick={handleLogout} className="shrink-0 text-white/50 transition hover:text-white" title="Log out" aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Thin top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="text-muted-foreground hover:text-foreground lg:hidden" aria-label="Open sidebar">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-bold text-foreground sm:text-lg">
              {currentNav?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-muted-foreground transition hover:text-foreground" title="Notifications" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-2 text-xs sm:flex">
              <Avatar name={userName} size={28} />
              <span className="font-medium text-foreground">{userName}</span>
            </div>
          </div>
        </header>

        {/* Scrollable dynamic workspace */}
        <main className="flex-1 overflow-y-auto scrollbar-quran">
          <div className="mx-auto max-w-7xl p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

/** Loading skeleton for dashboard sections */
export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-xl bg-muted/40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/40" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-xl bg-muted/40 lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-xl bg-muted/40" />
      </div>
    </div>
  )
}

/** Error state for dashboard sections */
export function DashboardError({ message }: { message?: string }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <X className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-bold">Could not load your dashboard</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {message || 'Please try again later.'}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        Reload
      </button>
    </div>
  )
}

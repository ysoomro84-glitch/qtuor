'use client'

import * as React from 'react'
import { useAppStore, type ViewKey } from '@/lib/store'
import { QtuorLogoLockup } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Avatar } from '@/components/shared/avatar'
import { BookOpen, BookOpenText, GraduationCap, LayoutDashboard, LogOut, Menu, Newspaper, Shield, Sparkles, User, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS: { label: string; view: ViewKey; icon: any }[] = [
  { label: 'Find Tutors', view: 'marketplace', icon: BookOpen },
  { label: 'Plans', view: 'plans', icon: Sparkles },
  { label: 'Blog', view: 'blog', icon: Newspaper },
  { label: 'Become a Tutor', view: 'tutor-dashboard', icon: GraduationCap },
]

export function Navbar() {
  const { user, view, setView, openAuth, logout } = useAppStore()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const go = (v: ViewKey) => {
    if (v === 'tutor-dashboard' && (!user || user.role !== 'TUTOR')) {
      openAuth('register', 'TUTOR')
      return
    }
    setView(v)
    setMobileOpen(false)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'DELETE' })
    logout()
  }

  const handleDashboard = () => {
    if (!user) return openAuth('login')
    if (user.role === 'STUDENT') setView('student-dashboard')
    else if (user.role === 'TUTOR') setView('tutor-dashboard')
    else if (user.role === 'ADMIN') setView('admin')
  }

  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur-xl transition-all duration-300"
      style={{
        background: 'rgba(255, 255, 255, 0.82)',
        borderBottom: '1px solid rgba(142, 174, 198, 0.2)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button onClick={() => setView('landing')} className="shrink-0 transition hover:opacity-80" aria-label="Qtuor home">
          <QtuorLogoLockup />
        </button>

        {/* Desktop nav — hidden in classroom mode */}
        {view !== 'classroom' && (
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <button
                onClick={() => go('marketplace')}
                className={cn(
                  'group relative px-3 py-2 text-sm font-medium transition-colors duration-300',
                  view === 'marketplace' ? 'text-[#0B2545]' : 'text-foreground hover:text-[#0B2545]'
                )}
              >
                Find Tutors
                <span className={cn('absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[oklch(0.62_0.14_230)] transition-all duration-300', view === 'marketplace' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100')} />
              </button>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <button
                onClick={() => go('plans')}
                className={cn(
                  'group relative px-3 py-2 text-sm font-medium transition-colors duration-300',
                  view === 'plans' ? 'text-[#0B2545]' : 'text-foreground hover:text-[#0B2545]'
                )}
              >
                Plans
                <span className={cn('absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[oklch(0.62_0.14_230)] transition-all duration-300', view === 'plans' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100')} />
              </button>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <button
                onClick={() => go('blog')}
                className={cn(
                  'group relative px-3 py-2 text-sm font-medium transition-colors duration-300',
                  view === 'blog' ? 'text-[#0B2545]' : 'text-foreground hover:text-[#0B2545]'
                )}
              >
                Blog
                <span className={cn('absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[oklch(0.62_0.14_230)] transition-all duration-300', view === 'blog' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100')} />
              </button>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <button
                onClick={() => go('tutor-dashboard')}
                className={cn(
                  'group relative px-3 py-2 text-sm font-medium transition-colors duration-300',
                  view === 'tutor-dashboard' ? 'text-[#0B2545]' : 'text-foreground hover:text-[#0B2545]'
                )}
              >
                Become a Tutor
                <span className={cn('absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[oklch(0.62_0.14_230)] transition-all duration-300', view === 'tutor-dashboard' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100')} />
              </button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        )}

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-3 transition hover:bg-muted">
                  <Avatar name={user.name} src={user.avatar} size={30} country={user.country} />
                  <span className="hidden text-sm font-medium sm:inline">{user.name.split(' ')[0]}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDashboard} className="cursor-pointer gap-2">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </DropdownMenuItem>
                {user.role === 'STUDENT' && (
                  <DropdownMenuItem onClick={() => setView('student-dashboard')} className="cursor-pointer gap-2">
                    <User className="h-4 w-4" /> My Learning
                  </DropdownMenuItem>
                )}
                {user.role === 'TUTOR' && (
                  <DropdownMenuItem onClick={() => setView('tutor-dashboard')} className="cursor-pointer gap-2">
                    <Wallet className="h-4 w-4" /> Earnings
                  </DropdownMenuItem>
                )}
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem onClick={() => setView('admin')} className="cursor-pointer gap-2">
                    <Shield className="h-4 w-4" /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-destructive">
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={() => openAuth('login')} className="hidden sm:inline-flex transition-colors duration-300 hover:text-[#0B2545]">
                Log in
              </Button>
              <Button
                onClick={() => openAuth('register')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                style={{
                  padding: '10px 24px',
                  boxShadow: '0 4px 14px rgba(11, 37, 69, 0.2)',
                }}
              >
                Get Started
              </Button>
            </>
          )}

          {/* Mobile menu — hidden in classroom mode */}
          {view !== 'classroom' && (
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <QtuorLogoLockup />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.view}
                    onClick={() => go(item.view)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition hover:bg-muted',
                      view === item.view && 'bg-muted text-primary'
                    )}
                  >
                    <item.icon className="h-4 w-4" /> {item.label}
                  </button>
                ))}
                {!user && (
                  <>
                    <Button variant="outline" className="mt-4" onClick={() => { openAuth('login'); setMobileOpen(false) }}>
                      Log in
                    </Button>
                    <Button className="mt-2 bg-primary" onClick={() => { openAuth('register'); setMobileOpen(false) }}>
                      Get Started
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          )}
        </div>
      </div>
    </header>
  )
}

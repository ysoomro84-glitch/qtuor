import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewKey =
  | 'landing'
  | 'marketplace'
  | 'plans'
  | 'library'
  | 'subject'
  | 'auth'
  | 'blog'
  | 'student-dashboard'
  | 'tutor-dashboard'
  | 'admin'
  | 'classroom'

export type Role = 'STUDENT' | 'TUTOR' | 'ADMIN'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: Role
  avatar?: string | null
  country?: string | null
}

interface AppState {
  // Auth
  user: SessionUser | null
  setUser: (u: SessionUser | null) => void
  logout: () => void

  // Navigation (single-page view switcher)
  view: ViewKey
  setView: (v: ViewKey) => void

  // Subject page context
  activeSubject: string | null
  setActiveSubject: (s: string | null) => void

  // Classroom context
  activeBookingId: string | null
  setActiveBookingId: (id: string | null) => void

  // Dynamic plan type — drives dashboard content switching
  planType: 'qaida' | 'quran' | 'both'
  setPlanType: (pt: 'qaida' | 'quran' | 'both') => void

  // Marketplace filters
  category: string
  setCategory: (c: string) => void
  search: string
  setSearch: (s: string) => void

  // UI
  authOpen: boolean
  authMode: 'login' | 'register'
  authRoleLock: Role | null
  openAuth: (mode?: 'login' | 'register', roleLock?: Role | null) => void
  closeAuth: () => void  // returns to previous view

  // Cart / selected plan
  selectedPlanId: string | null
  setSelectedPlanId: (id: string | null) => void
  checkoutOpen: boolean
  setCheckoutOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (u) => set({ user: u }),
      logout: () => set({ user: null, view: 'landing' }),

      view: 'landing',
      setView: (view) => set({ view }),

      activeSubject: null,
      setActiveSubject: (activeSubject) => set({ activeSubject }),

      activeBookingId: null,
      setActiveBookingId: (activeBookingId) => set({ activeBookingId }),

      planType: 'both',
      setPlanType: (planType) => set({ planType }),

      category: 'all',
      setCategory: (category) => set({ category }),
      search: '',
      setSearch: (search) => set({ search }),

      authOpen: false,
      authMode: 'register',
      authRoleLock: null,
      openAuth: (mode = 'register', roleLock: Role | null = null) =>
        set({ authOpen: true, authMode: mode, authRoleLock: roleLock, view: 'auth' }),
      closeAuth: () => set({ authOpen: false, authRoleLock: null, view: 'landing' }),

      selectedPlanId: null,
      setSelectedPlanId: (selectedPlanId) => set({ selectedPlanId }),
      checkoutOpen: false,
      setCheckoutOpen: (checkoutOpen) => set({ checkoutOpen }),
    }),
    {
      name: 'qtuor-store',
      partialize: (state) => ({
        user: state.user,
        view: state.view,
        category: state.category,
        search: state.search,
        activeBookingId: state.activeBookingId,
        planType: state.planType,
      }),
    }
  )
)

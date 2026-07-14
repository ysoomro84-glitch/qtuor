'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import type { Role } from '@/lib/store'

interface ApiUser {
  id: string
  email: string
  name: string
  role: Role
  country?: string | null
  avatar?: string | null
}

export function useSessionBootstrap() {
  const user = useAppStore((s) => s.user)
  const setUser = useAppStore((s) => s.setUser)

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const u: ApiUser | null = data.user
        setUser(u)
        // Only redirect away from landing if the user is genuinely on the landing
        // page right now (read live from the store, not the stale closure value).
        const currentView = useAppStore.getState().view
        if (u && currentView === 'landing') {
          if (u.role === 'STUDENT') useAppStore.getState().setView('student-dashboard')
          else if (u.role === 'TUTOR') useAppStore.getState().setView('tutor-dashboard')
          else if (u.role === 'ADMIN') useAppStore.getState().setView('admin')
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return { user }
}

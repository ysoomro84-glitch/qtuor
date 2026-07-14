import { cookies } from 'next/headers'
import { db } from './db'
import type { Role } from './store'

const SESSION_COOKIE = 'qtuor-session'

export interface SessionPayload {
  userId: string
  role: Role
  email: string
  name: string
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  const raw = store.get(SESSION_COOKIE)?.value
  if (!raw) return null
  try {
    const parsed = JSON.parse(atob(raw)) as SessionPayload
    if (!parsed.userId || !parsed.role) return null
    // Trust the httpOnly cookie — avoids a DB query on every API call (major memory saving)
    return { userId: parsed.userId, role: parsed.role, email: parsed.email, name: parsed.name }
  } catch {
    return null
  }
}

export async function setSession(payload: SessionPayload) {
  const store = await cookies()
  store.set(SESSION_COOKIE, btoa(JSON.stringify(payload)), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function clearSession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

// Simple password hashing (NOT for production — demo only)
export function hashPassword(pw: string): string {
  // Reversible-ish obfuscation for the demo. Real apps must use bcrypt/argon2.
  return btoa(`qtuor:${pw}`)
}

export function verifyPassword(pw: string, hash: string): boolean {
  return hashPassword(pw) === hash
}

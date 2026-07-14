/**
 * Qtuor Mobile API Client
 *
 * Connects to the same backend API as the web app.
 * Users registered on the web can log in here with the same credentials.
 *
 * Set API_BASE_URL to your deployed server URL (or use localhost for dev).
 */

import * as SecureStore from 'expo-secure-store';

// ===== Configuration =====
// For local development: use your computer's IP address (not localhost)
// For production: use your deployed server URL
export const API_BASE_URL = 'http://10.0.2.2:3000' // Android emulator → host machine
// export const API_BASE_URL = 'http://localhost:3000' // iOS simulator
// export const API_BASE_URL = 'https://www.qtuor.com' // Production

const SESSION_KEY = 'qtuor-mobile-session'

// ===== Types =====
export interface User {
  id: string
  email: string
  name: string
  role: 'STUDENT' | 'TUTOR' | 'ADMIN'
  country?: string | null
  avatar?: string | null
}

export interface Plan {
  id: string
  name: string
  category: string
  classesPerMonth: number
  monthlyPrice: number
  description: string
  features: string[]
  popular?: boolean
}

export interface Tutor {
  id: string
  name: string
  country?: string | null
  avatar?: string | null
  profile?: {
    id: string
    bio: string
    perClassRate: number
    rating: number
    reviewCount: number
    studentCount: number
    lessonsCount: number
    verified: boolean
    nativeArabic: boolean
    hafiz: boolean
    ijazaCertified: boolean
    specialties: string[]
    languages: string[]
    experienceYears: number
  } | null
}

export interface Booking {
  id: string
  scheduledAt: string
  durationMins: number
  status: string
  isTrial: boolean
  topic?: string | null
  meetingId?: string | null
  student?: { id: string; name: string }
  tutor?: { id: string; name: string }
}

// ===== Session Management =====

export async function getSession(): Promise<string | null> {
  return await SecureStore.getItemAsync(SESSION_KEY)
}

export async function setSession(token: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, token)
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY)
}

// ===== HTTP Helper =====

async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = await getSession()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Cookie'] = `qtuor-session=${token}`
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

// ===== Auth API =====

export async function login(email: string, password: string): Promise<User> {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  // The server sets an httpOnly cookie; we also store it for manual cookie injection
  await setSession(data.id) // Store user ID as session reference
  return data
}

export async function getMe(): Promise<User | null> {
  try {
    return await apiFetch('/api/auth/me')
  } catch {
    return null
  }
}

export async function logout(): Promise<void> {
  try {
    await apiFetch('/api/auth/me', { method: 'DELETE' })
  } catch {}
  await clearSession()
}

// ===== Plans API =====

export async function getPlans(): Promise<{ plans: Plan[] }> {
  return apiFetch('/api/plans')
}

// ===== Tutors API =====

export async function getTutors(filters?: {
  category?: string
  search?: string
  gender?: string
  sort?: string
}): Promise<{ tutors: Tutor[] }> {
  const params = new URLSearchParams()
  if (filters?.category && filters.category !== 'all') params.set('category', filters.category)
  if (filters?.search) params.set('search', filters.search)
  if (filters?.gender) params.set('gender', filters.gender)
  if (filters?.sort) params.set('sort', filters.sort)
  return apiFetch(`/api/tutors?${params.toString()}`)
}

// ===== Student Dashboard API =====

export async function getStudentDashboard(): Promise<any> {
  return apiFetch('/api/dashboard/student')
}

// ===== Tutor Dashboard API =====

export async function getTutorDashboard(): Promise<any> {
  return apiFetch('/api/dashboard/tutor')
}

// ===== Bookings API =====

export async function getBookings(role: 'student' | 'tutor' = 'student'): Promise<{ bookings: Booking[] }> {
  return apiFetch(`/api/bookings?role=${role}`)
}

export async function createBooking(payload: {
  tutorId: string
  scheduledAt: string
  isTrial?: boolean
  topic?: string
}): Promise<Booking> {
  return apiFetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ===== Blog API =====

export async function getBlogPosts(filters?: { category?: string; search?: string }): Promise<{ posts: any[] }> {
  const params = new URLSearchParams()
  if (filters?.category) params.set('category', filters.category)
  if (filters?.search) params.set('search', filters.search)
  return apiFetch(`/api/blog?${params.toString()}`)
}

// ===== Subscriptions API =====

export async function subscribe(planId: string): Promise<any> {
  return apiFetch('/api/subscriptions', {
    method: 'POST',
    body: JSON.stringify({ planId }),
  })
}

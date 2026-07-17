'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, cache: 'no-store' })
  // Guard: if the response is HTML (e.g. Vercel 404/500 page), don't try to parse as JSON
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    // Server returned an HTML error page instead of JSON
    console.error(`[fetchJson] Non-JSON response from ${url}: ${contentType} (status ${res.status})`)
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
    throw new Error('Server returned non-JSON response')
  }
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

// ---- Tutors ----
export function useTutors(filters?: { category?: string; search?: string; nativeArabic?: boolean; hafiz?: boolean; ijaza?: boolean; sort?: string; gender?: string }) {
  const params = new URLSearchParams()
  if (filters?.category && filters.category !== 'all') params.set('category', filters.category)
  if (filters?.search) params.set('search', filters.search)
  if (filters?.nativeArabic) params.set('nativeArabic', 'true')
  if (filters?.hafiz) params.set('hafiz', 'true')
  if (filters?.ijaza) params.set('ijaza', 'true')
  if (filters?.gender) params.set('gender', filters.gender)
  if (filters?.sort) params.set('sort', filters.sort)
  return useQuery({
    queryKey: ['tutors', filters],
    queryFn: () => fetchJson(`/api/tutors?${params.toString()}`),
  })
}

export function useTutor(id: string | null) {
  return useQuery({
    queryKey: ['tutor', id],
    queryFn: () => fetchJson(`/api/tutors/${id}`),
    enabled: !!id,
  })
}

// ---- Plans ----
export function usePlans() {
  return useQuery({ queryKey: ['plans'], queryFn: () => fetchJson('/api/plans') })
}

// ---- Subscription ----
export function useSubscription() {
  return useQuery({ queryKey: ['subscription'], queryFn: () => fetchJson('/api/subscriptions') })
}

export function useSubscribe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (planId: string) =>
      fetchJson('/api/subscriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription'] })
      qc.invalidateQueries({ queryKey: ['student-dashboard'] })
    },
  })
}

// ---- Bookings ----
export function useBookings(role: 'student' | 'tutor' = 'student') {
  return useQuery({ queryKey: ['bookings', role], queryFn: () => fetchJson(`/api/bookings?role=${role}`) })
}

export function useCreateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) =>
      fetchJson('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['student-dashboard'] })
      qc.invalidateQueries({ queryKey: ['tutor-dashboard'] })
    },
  })
}

export function useUpdateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetchJson(`/api/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['student-dashboard'] })
      qc.invalidateQueries({ queryKey: ['tutor-dashboard'] })
    },
  })
}

// ---- Availability ----
export function useAvailability(tutorId?: string) {
  return useQuery({
    queryKey: ['availability', tutorId],
    queryFn: () => fetchJson(`/api/availability${tutorId ? `?tutorId=${tutorId}` : ''}`),
  })
}

export function useSaveAvailability() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (slots: Record<number, string[][]>) =>
      fetchJson('/api/availability', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slots }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['availability'] }),
  })
}

// ---- Student dashboard ----
export function useStudentDashboard() {
  return useQuery({ queryKey: ['student-dashboard'], queryFn: () => fetchJson('/api/dashboard/student') })
}

// ---- Tutor dashboard ----
export function useTutorDashboard() {
  return useQuery({ queryKey: ['tutor-dashboard'], queryFn: () => fetchJson('/api/dashboard/tutor') })
}

// ---- Admin dashboard ----
export function useAdminDashboard() {
  return useQuery({ queryKey: ['admin-dashboard'], queryFn: () => fetchJson('/api/dashboard/admin') })
}

export function useUpdateTutorStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, verified }: { id: string; status?: string; verified?: boolean }) =>
      fetchJson(`/api/admin/tutors/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, verified }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-dashboard'] }),
  })
}

export function useCreatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) =>
      fetchJson('/api/admin/plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] })
      qc.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

// ---- Reviews ----
export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { tutorId: string; rating: number; comment: string }) =>
      fetchJson('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tutor'] }),
  })
}

// ---- Withdrawal ----
export function useRequestWithdrawal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      amount: number
      method?: string
      accountLabel?: string
      accountNumber?: string
      iban?: string
      bankName?: string
      mobileNumber?: string
    }) =>
      fetchJson('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tutor-dashboard'] }),
  })
}

// ---- WhatsApp Notifications ----
export function useNotifications() {
  return useQuery({ queryKey: ['notifications'], queryFn: () => fetchJson('/api/notifications') })
}

export function useWhatsAppSettings() {
  return useQuery({ queryKey: ['whatsapp-settings'], queryFn: () => fetchJson('/api/whatsapp/settings') })
}

/** Public settings — no auth required, used by the floating widget and tutor cards. */
export function usePublicWhatsAppSettings() {
  return useQuery({ queryKey: ['whatsapp-public-settings'], queryFn: () => fetchJson('/api/whatsapp/public') })
}

export function useUpdateWhatsAppSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) =>
      fetchJson('/api/whatsapp/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['whatsapp-settings'] }),
  })
}

// ---- WhatsApp Baileys Gateway (Link-Device) ----
export function useBaileysStatus() {
  return useQuery({
    queryKey: ['baileys-status'],
    queryFn: () => fetchJson('/api/whatsapp/baileys/status'),
    refetchInterval: 3000, // poll every 3s for connection changes
  })
}

export function useBaileysQR(enabled: boolean) {
  return useQuery({
    queryKey: ['baileys-qr'],
    queryFn: () => fetchJson('/api/whatsapp/baileys/qr'),
    refetchInterval: enabled ? 5000 : false, // poll QR every 5s while disconnected
    enabled,
  })
}

export function useDisconnectBaileys() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => fetchJson('/api/whatsapp/baileys/disconnect', { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['baileys-status'] })
      qc.invalidateQueries({ queryKey: ['baileys-qr'] })
    },
  })
}

export function useSendTestWhatsApp() {
  return useMutation({
    mutationFn: ({ to, message }: { to: string; message: string }) =>
      fetchJson('/api/whatsapp/baileys/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to, message }) }),
  })
}

// ---- WhatsApp Templates ----
export function useWhatsAppTemplates() {
  return useQuery({ queryKey: ['wa-templates'], queryFn: () => fetchJson('/api/whatsapp/templates') })
}

export function useUpdateWhatsAppTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: string; template?: string; enabled?: boolean }) =>
      fetchJson('/api/whatsapp/templates', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wa-templates'] }),
  })
}

// ---- Wallet Ledger & Revenue Split ----
export function useTutorWalletLedger() {
  return useQuery({ queryKey: ['wallet-ledger'], queryFn: () => fetchJson('/api/wallet/ledger') })
}

export function usePlatformRevenue() {
  return useQuery({ queryKey: ['platform-revenue'], queryFn: () => fetchJson('/api/admin/revenue') })
}

export function useReleasePayouts() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => fetchJson('/api/wallet/release-payouts', { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform-revenue'] })
      qc.invalidateQueries({ queryKey: ['wallet-ledger'] })
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] })
    },
  })
}

// ---- Lesson Bookmark (Smart Lesson Tracking) ----
export function useBookmark(studentId: string | null, tutorId: string | null) {
  return useQuery({
    queryKey: ['bookmark', studentId, tutorId],
    queryFn: () => fetchJson(`/api/bookmark?studentId=${studentId}&tutorId=${tutorId}`),
    enabled: !!studentId && !!tutorId,
  })
}

export function useSaveBookmark() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { studentId: string; tutorId: string; bookType: string; pageId: number; pageLabel: string; lastLineIndex?: number }) =>
      fetchJson('/api/bookmark', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['bookmark', vars.studentId, vars.tutorId] })
    },
  })
}

// ---- Student Plan (for content lock in classroom) ----
export function useStudentPlan(studentId: string | null) {
  return useQuery({
    queryKey: ['student-plan', studentId],
    queryFn: () => fetchJson(`/api/student-plan?studentId=${studentId}`),
    enabled: !!studentId,
  })
}

// ============================================================
// MODULE 2 — Master Central Admin Control Panel
// ============================================================

// ---- Admin Security (master credentials) ----
export function useAdminSecurity() {
  return useQuery({ queryKey: ['admin-security'], queryFn: () => fetchJson('/api/admin/security') })
}

export function useUpdateAdminSecurity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword?: string; newEmail?: string }) =>
      fetchJson('/api/admin/security', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-security'] })
      qc.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

// ---- Payment Gateways + Bank Accounts ----
export function usePaymentGateways() {
  return useQuery({ queryKey: ['payment-gateways'], queryFn: () => fetchJson('/api/admin/payment-gateways') })
}

export function useUpdatePaymentGateway() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      id: string
      isActive?: boolean
      sandbox?: boolean
      publishableKey?: string
      secretKey?: string
      webhookSecret?: string
      clientId?: string
      clientSecret?: string
      payoutEmail?: string
      displayName?: string
      notes?: string
    }) =>
      fetchJson('/api/admin/payment-gateways', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-gateways'] }),
  })
}

export function useCreateBankAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      bankName: string
      accountHolder: string
      iban?: string
      accountNumber?: string
      swiftCode?: string
      branchCode?: string
      country?: string
      currency?: string
      isDefault?: boolean
      notes?: string
    }) =>
      fetchJson('/api/admin/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-gateways'] }),
  })
}

export function useUpdateBankAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      id: string
      bankName?: string
      accountHolder?: string
      iban?: string
      accountNumber?: string
      swiftCode?: string
      branchCode?: string
      country?: string
      currency?: string
      isDefault?: boolean
      notes?: string
    }) =>
      fetchJson(`/api/admin/bank-accounts/${payload.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-gateways'] }),
  })
}

export function useDeleteBankAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchJson(`/api/admin/bank-accounts/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-gateways'] }),
  })
}

// ---- Financial Ledgers ----
export function useReceivablesLedger() {
  return useQuery({ queryKey: ['receivables-ledger'], queryFn: () => fetchJson('/api/admin/ledger/receivables') })
}

export function usePayablesLedger() {
  return useQuery({ queryKey: ['payables-ledger'], queryFn: () => fetchJson('/api/admin/ledger/payables') })
}

export function useReleasePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { tutorId: string; amount: number; method: string; destination?: string }) =>
      fetchJson('/api/admin/ledger/release-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payables-ledger'] })
      qc.invalidateQueries({ queryKey: ['receivables-ledger'] })
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] })
    },
  })
}

// ---- Blog (public + admin) ----
export function useBlogPosts(filters?: { category?: string; search?: string }) {
  const params = new URLSearchParams()
  if (filters?.category && filters.category !== 'all') params.set('category', filters.category)
  if (filters?.search) params.set('search', filters.search)
  return useQuery({
    queryKey: ['blog-posts', filters?.category || 'all', filters?.search || ''],
    queryFn: () => fetchJson(`/api/blog?${params.toString()}`),
  })
}

export function useBlogPost(slug: string | null) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => fetchJson(`/api/blog/${slug}`),
    enabled: !!slug,
  })
}

export function useAdminBlogPosts() {
  return useQuery({ queryKey: ['admin-blog-posts'], queryFn: () => fetchJson('/api/blog/admin') })
}

export function useCreateBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) =>
      fetchJson('/api/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] })
    },
  })
}

export function useUpdateBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, ...payload }: { slug: string } & Record<string, any>) =>
      fetchJson(`/api/blog/${slug}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] })
      qc.invalidateQueries({ queryKey: ['blog-post'] })
    },
  })
}

export function useDeleteBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => fetchJson(`/api/blog/${slug}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] })
    },
  })
}

// ============================================================
// PART 2B — Local Pakistani Payment Gateways & Banking
// ============================================================

// ---- Public Bank Details (no auth) ----
export function usePublicBankDetails() {
  return useQuery({
    queryKey: ['public-bank-details'],
    queryFn: () => fetchJson('/api/bank-details/public'),
    staleTime: 5 * 60 * 1000,
  })
}

// ---- Local Bank Transfer Subscription (student) ----
export function useLocalBankSubscribe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { planId: string; receiptUrl: string }) =>
      fetchJson('/api/subscriptions/local-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription'] })
      qc.invalidateQueries({ queryKey: ['student-dashboard'] })
    },
  })
}

// ---- Admin: approve / reject a pending StudentPayment (local-bank receipt) ----
export function useUpdatePaymentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetchJson(`/api/admin/ledger/receivables/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['receivables-ledger'] })
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] })
    },
  })
}

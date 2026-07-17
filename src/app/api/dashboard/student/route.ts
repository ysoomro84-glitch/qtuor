import { NextResponse } from 'next/server'

// ─── Shared demo dashboard data ──────────────────────────────────────
function getDemoDashboardData(email: string) {
  const demoTutor = { id: 'demo-tutor-ahmad', name: 'Qari Ahmad Raza', avatar: null, country: 'Pakistan' }
  const now = new Date()
  const soon = new Date(now.getTime() + 2 * 60 * 1000)
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const demoPlan = { id: 'plan-demo-combo', name: 'Demo Full Access', category: 'General', classesPerMonth: 12, monthlyPrice: 49, features: ['3 classes / week (30 min each)', 'Noorani Qaida board', 'Quran Recitation with Tajweed', 'Certified tutor', 'Auto-bookmark & resume', 'Virtual classroom access'] }

  if (email === 'noorani.demo@qtuor.com') {
    return {
      subscription: { id: 'demo-sub-nq', status: 'ACTIVE', startedAt: now.toISOString(), expiresAt, plan: demoPlan },
      bookings: [
        { id: 'demo-booking-nq-1', studentId: 'demo-noorani-student', tutorId: 'demo-tutor-ahmad', scheduledAt: soon.toISOString(), durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Noorani Qaida — Lesson 5: Harakat (Fatha, Kasra, Damma)', meetingId: 'demo-nq-room', tutor: demoTutor },
        { id: 'demo-booking-nq-2', studentId: 'demo-noorani-student', tutorId: 'demo-tutor-ahmad', scheduledAt: new Date(now.getTime() + 65 * 60 * 1000).toISOString(), durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Quran Recitation — Surah Al-Fatihah Tajweed Practice', meetingId: 'demo-nq-quran', tutor: demoTutor },
      ],
      progress: [
        { id: 'demo-prog-nq-1', subject: 'Noorani Qaida', lessonTitle: 'Lesson 5: Harakat', surahName: null, completed: false, progressPct: 35 },
        { id: 'demo-prog-nq-2', subject: 'Quran Recitation With Tajweed', lessonTitle: 'Surah Al-Fatihah', surahName: 'Al-Fatihah', completed: false, progressPct: 15 },
      ],
      stats: { completedLessons: 4, memorizedSurahs: 0, totalBookings: 5, completedBookings: 4, hasActiveSubscription: true, subscriptionPlanName: 'Demo Full Access', subscriptionExpiresAt: expiresAt, completionRate: 80 },
    }
  }

  if (email === 'quran.demo@qtuor.com') {
    return {
      subscription: { id: 'demo-sub-tw', status: 'ACTIVE', startedAt: now.toISOString(), expiresAt, plan: demoPlan },
      bookings: [
        { id: 'demo-booking-tw-1', studentId: 'demo-quran-student', tutorId: 'demo-tutor-ahmad', scheduledAt: soon.toISOString(), durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Quran Recitation — Surah Al-Baqarah (Ayah 142-152) Tajweed Focus', meetingId: 'demo-tw-room', tutor: demoTutor },
        { id: 'demo-booking-tw-2', studentId: 'demo-quran-student', tutorId: 'demo-tutor-ahmad', scheduledAt: new Date(now.getTime() + 65 * 60 * 1000).toISOString(), durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Noorani Qaida — Lesson 8: Madd (Stretching Rules)', meetingId: 'demo-tw-qaida', tutor: demoTutor },
      ],
      progress: [
        { id: 'demo-prog-tw-1', subject: 'Quran Recitation With Tajweed', lessonTitle: 'Surah Al-Baqarah Ayah 142-152', surahName: 'Al-Baqarah', completed: false, progressPct: 20 },
        { id: 'demo-prog-tw-2', subject: 'Noorani Qaida', lessonTitle: 'Lesson 8: Madd Rules', surahName: null, completed: false, progressPct: 55 },
      ],
      stats: { completedLessons: 8, memorizedSurahs: 1, totalBookings: 10, completedBookings: 9, hasActiveSubscription: true, subscriptionPlanName: 'Demo Full Access', subscriptionExpiresAt: expiresAt, completionRate: 90 },
    }
  }

  return null
}

const emptyDashboard = {
  subscription: null,
  bookings: [],
  progress: [],
  stats: { completedLessons: 0, memorizedSurahs: 0, totalBookings: 0, completedBookings: 0, hasActiveSubscription: false, subscriptionPlanName: null, subscriptionExpiresAt: null, completionRate: 0 },
}

export async function GET() {
  try {
    const { getSession } = await import('@/lib/auth')
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })

    try {
      const { db } = await import('@/lib/db')

      const [subscription, bookings, progress] = await Promise.all([
        db.subscription.findFirst({
          where: { userId: session.userId, status: 'ACTIVE' },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
        }),
        db.booking.findMany({
          where: { studentId: session.userId },
          include: { tutor: { select: { id: true, name: true, avatar: true, country: true } } },
          orderBy: { scheduledAt: 'desc' },
          take: 20,
        }),
        db.lessonProgress.findMany({ where: { studentId: session.userId }, orderBy: { createdAt: 'asc' } }),
      ])

      // If DB returned empty data for a demo account, inject demo data
      if (bookings.length === 0 && !subscription) {
        const demoData = getDemoDashboardData(session.email)
        if (demoData) return NextResponse.json(demoData)
      }

      const completedLessons = progress.filter((p) => p.completed).length
      const memorizedSurahs = progress.filter((p) => p.completed && p.surahName).length
      const totalBookings = bookings.length
      const completedBookings = bookings.filter((b) => b.status === 'COMPLETED').length

      return NextResponse.json({
        subscription: subscription
          ? {
              ...subscription,
              plan: { ...subscription.plan, features: subscription.plan.features.split('\n').filter(Boolean) },
            }
          : null,
        bookings,
        progress,
        stats: {
          completedLessons,
          memorizedSurahs,
          totalBookings,
          completedBookings,
          hasActiveSubscription: !!subscription,
          subscriptionPlanName: subscription?.plan?.name || null,
          subscriptionExpiresAt: subscription?.expiresAt || null,
          completionRate: totalBookings ? Math.round((completedBookings / totalBookings) * 100) : 0,
        },
      })
    } catch (dbErr: any) {
      if (dbErr?.message === 'DATABASE_UNAVAILABLE') {
        const session = await getSession()
        const demoData = getDemoDashboardData(session?.email || '')
        if (demoData) return NextResponse.json(demoData)
        return NextResponse.json(emptyDashboard)
      }
      throw dbErr
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load dashboard' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'

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
        // Return demo dashboard data for Vercel
        const session = await getSession()
        const demoTutor = { id: 'demo-tutor-ahmad', name: 'Qari Ahmad Raza', avatar: null, country: 'Pakistan' }
        const now = new Date()
        const soon = new Date(now.getTime() + 2 * 60 * 1000) // 2 min from now

        // Provide demo data based on which demo account is logged in
        const isNoorani = session?.email === 'noorani.demo@qtuor.com'
        const isQuran = session?.email === 'quran.demo@qtuor.com'
        const isDemoStudent = session?.email === 'student@qtuor.com'

        if (isNoorani) {
          return NextResponse.json({
            subscription: {
              id: 'demo-sub-nq', status: 'ACTIVE',
              startedAt: now.toISOString(),
              expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              plan: { id: 'plan-nq-3', name: 'Qaida Learner', category: 'Noorani Qaida', classesPerMonth: 12, monthlyPrice: 39, features: ['3 classes / week (30 min each)', 'Interactive Noorani Qaida board', 'Certified Qaida tutor', 'Auto-bookmark & resume', 'Parent safety snapshots', 'Homework worksheets'] },
            },
            bookings: [
              { id: 'demo-booking-nq-1', scheduledAt: soon.toISOString(), durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Noorani Qaida — Lesson 5: Harakat (Fatha, Kasra, Damma)', meetingId: null, tutor: demoTutor },
            ],
            progress: [
              { id: 'demo-prog-nq-1', subject: 'Noorani Qaida', lessonTitle: 'Lesson 5: Harakat', surahName: null, completed: false, progressPct: 35 },
            ],
            stats: { completedLessons: 4, memorizedSurahs: 0, totalBookings: 5, completedBookings: 4, hasActiveSubscription: true, subscriptionPlanName: 'Qaida Learner', subscriptionExpiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), completionRate: 80 },
          })
        }

        if (isQuran) {
          return NextResponse.json({
            subscription: {
              id: 'demo-sub-tw', status: 'ACTIVE',
              startedAt: now.toISOString(),
              expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              plan: { id: 'plan-tw-3', name: 'Tajweed Builder', category: 'Quran Recitation With Tajweed', classesPerMonth: 12, monthlyPrice: 49, features: ['3 classes / week (30 min each)', 'Word-by-word Quran sync', 'Tajweed color highlighting', 'Ijaza-certified tutor', 'Auto-bookmark & resume', 'Weekly progress report'] },
            },
            bookings: [
              { id: 'demo-booking-tw-1', scheduledAt: soon.toISOString(), durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Quran Recitation — Surah Al-Baqarah (Ayah 142-152) Tajweed Focus', meetingId: null, tutor: demoTutor },
            ],
            progress: [
              { id: 'demo-prog-tw-1', subject: 'Quran Recitation With Tajweed', lessonTitle: 'Surah Al-Baqarah Ayah 142-152', surahName: 'Al-Baqarah', completed: false, progressPct: 20 },
            ],
            stats: { completedLessons: 8, memorizedSurahs: 1, totalBookings: 10, completedBookings: 9, hasActiveSubscription: true, subscriptionPlanName: 'Tajweed Builder', subscriptionExpiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), completionRate: 90 },
          })
        }

        // Generic demo student or other accounts
        return NextResponse.json({
          subscription: null,
          bookings: [],
          progress: [],
          stats: {
            completedLessons: 0,
            memorizedSurahs: 0,
            totalBookings: 0,
            completedBookings: 0,
            hasActiveSubscription: false,
            subscriptionPlanName: null,
            subscriptionExpiresAt: null,
            completionRate: 0,
          },
        })
      }
      throw dbErr
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load dashboard' }, { status: 500 })
  }
}

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

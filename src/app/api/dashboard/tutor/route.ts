import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { getSession } = await import('@/lib/auth')
    const session = await getSession()
    if (!session || session.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Tutor login required' }, { status: 401 })
    }

    try {
      const { db } = await import('@/lib/db')

      const [profile, wallet, bookings, availabilities, withdrawals] = await Promise.all([
        db.tutorProfile.findUnique({ where: { userId: session.userId } }),
        db.wallet.upsert({ where: { tutorId: session.userId }, update: {}, create: { tutorId: session.userId } }),
        db.booking.findMany({
          where: { tutorId: session.userId },
          include: { student: { select: { id: true, name: true, avatar: true, country: true } } },
          orderBy: { scheduledAt: 'desc' },
          take: 30,
        }),
        db.availability.findMany({ where: { tutorId: session.userId } }),
        db.withdrawal.findMany({ where: { tutorId: session.userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
      ])

      const completed = bookings.filter((b) => b.status === 'COMPLETED').length
      const upcoming = bookings.filter((b) => b.status === 'SCHEDULED' && new Date(b.scheduledAt) > new Date()).length
      const uniqueStudents = new Set(bookings.map((b) => b.studentId)).size

      return NextResponse.json({
        profile,
        wallet,
        withdrawals,
        availabilities,
        bookings,
        stats: {
          totalLessons: completed,
          upcomingLessons: upcoming,
          uniqueStudents,
          rating: profile?.rating || 0,
          reviewCount: profile?.reviewCount || 0,
          balance: wallet?.balance || 0,
          totalEarned: wallet?.totalEarned || 0,
        },
      })
    } catch (dbErr: any) {
      if (dbErr?.message === 'DATABASE_UNAVAILABLE') {
        // Return demo tutor dashboard data for Vercel
        return NextResponse.json({
          profile: null,
          wallet: { balance: 0, totalEarned: 0 },
          withdrawals: [],
          availabilities: [],
          bookings: [],
          stats: {
            totalLessons: 0,
            upcomingLessons: 0,
            uniqueStudents: 0,
            rating: 0,
            reviewCount: 0,
            balance: 0,
            totalEarned: 0,
          },
        })
      }
      throw dbErr
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load dashboard' }, { status: 500 })
  }
}

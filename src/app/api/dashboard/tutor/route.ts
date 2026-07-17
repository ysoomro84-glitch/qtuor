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
        const now = new Date()
        const soon = new Date(now.getTime() + 5 * 60 * 1000).toISOString()
        const demoStudentNQ = { id: 'demo-noorani-student', name: 'Fatima Noor', avatar: null, country: 'Pakistan' }
        const demoStudentTW = { id: 'demo-quran-student', name: 'Ahmed Khan', avatar: null, country: 'United Kingdom' }
        return NextResponse.json({
          profile: null,
          wallet: { balance: 0, totalEarned: 0 },
          withdrawals: [],
          availabilities: [],
          bookings: [
            { id: 'demo-booking-nq-1', studentId: 'demo-noorani-student', tutorId: 'demo-tutor-ahmad', scheduledAt: soon, durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Noorani Qaida — Lesson 5: Harakat', meetingId: 'demo-nq-room', student: demoStudentNQ },
            { id: 'demo-booking-tw-1', studentId: 'demo-quran-student', tutorId: 'demo-tutor-ahmad', scheduledAt: new Date(now.getTime() + 10 * 60 * 1000).toISOString(), durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Quran Recitation — Surah Al-Baqarah', meetingId: 'demo-tw-room', student: demoStudentTW },
          ],
          stats: {
            totalLessons: 3000,
            upcomingLessons: 2,
            uniqueStudents: 50,
            rating: 5.0,
            reviewCount: 178,
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

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
        const demoStudentHareem = { id: 'demo-hareem-student', name: 'Hareem Yasir', avatar: null, country: 'Pakistan' }
        const demoStudentYasir = { id: 'demo-yasir-student', name: 'Yasir Soomro', avatar: null, country: 'Pakistan' }

        const isMadiha = session.email === 'madiha.demo@qtuor.com'
        const madihaBookings = [
          { id: 'demo-booking-hareem-1', studentId: 'demo-hareem-student', tutorId: 'demo-tutor-madiha', scheduledAt: soon, durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Noorani Qaida — Lesson 3: Harakat (Fatha, Kasra, Damma)', meetingId: 'demo-hareem-room', student: demoStudentHareem },
          { id: 'demo-booking-yasir-1', studentId: 'demo-yasir-student', tutorId: 'demo-tutor-madiha', scheduledAt: new Date(now.getTime() + 10 * 60 * 1000).toISOString(), durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Quran Recitation — Surah Al-Mulk (Ayah 1-14) Tajweed Focus', meetingId: 'demo-yasir-room', student: demoStudentYasir },
          { id: 'demo-booking-nq-1', studentId: 'demo-noorani-student', tutorId: 'demo-tutor-madiha', scheduledAt: new Date(now.getTime() + 65 * 60 * 1000).toISOString(), durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Noorani Qaida — Lesson 5: Harakat', meetingId: 'demo-nq-room', student: demoStudentNQ },
        ]
        const genericBookings = [
          { id: 'demo-booking-nq-1', studentId: 'demo-noorani-student', tutorId: 'demo-tutor-ahmad', scheduledAt: soon, durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Noorani Qaida — Lesson 5: Harakat', meetingId: 'demo-nq-room', student: demoStudentNQ },
          { id: 'demo-booking-tw-1', studentId: 'demo-quran-student', tutorId: 'demo-tutor-ahmad', scheduledAt: new Date(now.getTime() + 10 * 60 * 1000).toISOString(), durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Quran Recitation — Surah Al-Baqarah', meetingId: 'demo-tw-room', student: demoStudentTW },
        ]

        return NextResponse.json({
          profile: isMadiha ? {
            id: 'tp-demo-madiha',
            userId: 'demo-tutor-madiha',
            bio: 'Dedicated and certified female Quran tutor with over a decade of experience. Specializing in making Noorani Qaida engaging for young kids and teaching advanced Tajweed to female students globally.',
            perClassRate: 7,
            rating: 4.9,
            reviewCount: 120,
            studentCount: 310,
            lessonsCount: 4200,
            verified: true,
            nativeArabic: false,
            hafiz: true,
            ijazaCertified: true,
            specialties: 'Noorani Qaida,Quran Recitation With Tajweed,Hifz',
            languages: 'Urdu,English',
            status: 'APPROVED',
            experienceYears: 10,
          } : null,
          wallet: { balance: 140, totalEarned: 840, escrowHeld: 0, platformRevenue: 0, pendingPayout: 140 },
          withdrawals: [],
          availabilities: [],
          bookings: isMadiha ? madihaBookings : genericBookings,
          stats: isMadiha ? {
            totalLessons: 4200,
            upcomingLessons: 3,
            uniqueStudents: 310,
            rating: 4.9,
            reviewCount: 120,
            balance: 140,
            totalEarned: 840,
          } : {
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

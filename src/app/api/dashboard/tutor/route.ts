import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'TUTOR') {
    return NextResponse.json({ error: 'Tutor login required' }, { status: 401 })
  }

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
}

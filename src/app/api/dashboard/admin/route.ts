import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// Parse the JSON-encoded certificateUrls column safely into a string[].
// Falls back to [] for any malformed/empty value so the admin UI never crashes.
function safeParseUrls(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter((s): s is string => typeof s === 'string' && s.length > 0)
    }
    return []
  } catch {
    return []
  }
}

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }

  const [tutors, students, plans, pendingWithdrawals, bookings] = await Promise.all([
    db.user.findMany({
      where: { role: 'TUTOR' },
      select: {
        id: true, name: true, email: true, country: true, phone: true, gender: true, createdAt: true,
        tutorProfile: { select: { id: true, bio: true, perClassRate: true, rating: true, verified: true, nativeArabic: true, hafiz: true, ijazaCertified: true, specialties: true, languages: true, experienceYears: true, teachingStyle: true, videoUrl: true, status: true, idDocumentUrl: true, certificateUrls: true } },
        wallet: { select: { balance: true, totalEarned: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    db.user.count({ where: { role: 'STUDENT' } }),
    db.plan.findMany({ orderBy: { monthlyPrice: 'asc' } }),
    db.withdrawal.findMany({
      where: { status: 'PENDING' },
      select: { id: true, amount: true, status: true, method: true, createdAt: true, accountLabel: true, accountNumber: true, iban: true, bankName: true, mobileNumber: true, tutor: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    db.booking.count(),
  ])

  const approvedTutors = tutors.filter((t) => t.tutorProfile?.status === 'APPROVED').length
  const pendingTutors = tutors.filter((t) => t.tutorProfile?.status === 'PENDING').length
  const totalRevenue = tutors.reduce((s, t) => s + (t.wallet?.totalEarned || 0), 0)

  return NextResponse.json({
    tutors: tutors.map((t) => ({
      id: t.id,
      name: t.name,
      email: t.email,
      country: t.country,
      phone: t.phone,
      gender: t.gender,
      createdAt: t.createdAt,
      status: t.tutorProfile?.status || 'PENDING',
      verified: t.tutorProfile?.verified || false,
      rating: t.tutorProfile?.rating || 0,
      hourlyRate: t.tutorProfile?.perClassRate || 0,
      perClassRate: t.tutorProfile?.perClassRate || 0,
      walletBalance: t.wallet?.balance || 0,
      profile: t.tutorProfile
        ? {
            bio: t.tutorProfile.bio,
            specialties: t.tutorProfile.specialties.split(','),
            languages: t.tutorProfile.languages.split(','),
            nativeArabic: t.tutorProfile.nativeArabic,
            hafiz: t.tutorProfile.hafiz,
            ijazaCertified: t.tutorProfile.ijazaCertified,
            experienceYears: t.tutorProfile.experienceYears,
            teachingStyle: t.tutorProfile.teachingStyle,
            videoUrl: t.tutorProfile.videoUrl,
            idDocumentUrl: t.tutorProfile.idDocumentUrl || null,
            certificateUrls: t.tutorProfile.certificateUrls
              ? safeParseUrls(t.tutorProfile.certificateUrls)
              : [],
          }
        : null,
    })),
    plans: plans.map((p) => ({ ...p, features: p.features.split('\n').filter(Boolean) })),
    pendingWithdrawals,
    stats: {
      totalStudents: students,
      totalTutors: tutors.length,
      approvedTutors,
      pendingTutors,
      totalBookings: bookings,
      totalRevenue,
    },
  })
}

import { NextResponse } from 'next/server'
import { FALLBACK_TUTORS, FALLBACK_PLANS } from '@/lib/fallback-data'

// Parse the JSON-encoded certificateUrls column safely into a string[].
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
  try {
    const { getSession } = await import('@/lib/auth')
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
    }

    try {
      const { db } = await import('@/lib/db')

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
    } catch (dbErr: any) {
      if (dbErr?.message === 'DATABASE_UNAVAILABLE') {
        // Return demo admin dashboard data for Vercel
        return NextResponse.json({
          tutors: FALLBACK_TUTORS.map((t) => ({
            id: t.id,
            name: t.name,
            email: `${t.name.toLowerCase().replace(/\s+/g, '.')}@qtuor.com`,
            country: t.country,
            phone: null,
            gender: null,
            createdAt: new Date().toISOString(),
            status: 'APPROVED',
            verified: t.profile?.verified || true,
            rating: t.profile?.rating || 0,
            hourlyRate: t.profile?.perClassRate || 0,
            perClassRate: t.profile?.perClassRate || 0,
            walletBalance: 0,
            profile: t.profile
              ? {
                  bio: t.profile.bio,
                  specialties: t.profile.specialties,
                  languages: t.profile.languages,
                  nativeArabic: t.profile.nativeArabic,
                  hafiz: t.profile.hafiz,
                  ijazaCertified: t.profile.ijazaCertified,
                  experienceYears: t.profile.experienceYears,
                  teachingStyle: null,
                  videoUrl: null,
                  idDocumentUrl: null,
                  certificateUrls: [],
                }
              : null,
          })),
          plans: FALLBACK_PLANS,
          pendingWithdrawals: [],
          stats: {
            totalStudents: 42,
            totalTutors: FALLBACK_TUTORS.length,
            approvedTutors: FALLBACK_TUTORS.length,
            pendingTutors: 0,
            totalBookings: 156,
            totalRevenue: 2450,
          },
        })
      }
      throw dbErr
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load dashboard' }, { status: 500 })
  }
}

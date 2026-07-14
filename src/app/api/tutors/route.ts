import { NextRequest, NextResponse } from 'next/server'
import { FALLBACK_TUTORS } from '@/lib/fallback-data'

export async function GET(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || 'all'
    const search = searchParams.get('search') || ''
    const nativeArabic = searchParams.get('nativeArabic')
    const hafiz = searchParams.get('hafiz')
    const ijaza = searchParams.get('ijaza')
    const minRating = searchParams.get('minRating')
    const gender = searchParams.get('gender')
    const sort = searchParams.get('sort') || 'rating'

    const where: any = {
      role: 'TUTOR',
      ...(gender ? { gender } : {}),
      tutorProfile: {
        verified: true,
        status: 'APPROVED',
        ...(category !== 'all' ? { specialties: { contains: category } } : {}),
        ...(nativeArabic === 'true' ? { nativeArabic: true } : {}),
        ...(hafiz === 'true' ? { hafiz: true } : {}),
        ...(ijaza === 'true' ? { ijazaCertified: true } : {}),
        ...(minRating ? { rating: { gte: parseFloat(minRating) } } : {}),
      },
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { country: { contains: search } },
              { tutorProfile: { bio: { contains: search } } },
            ],
          }
        : {}),
    }

    let orderBy: any = { tutorProfile: { rating: 'desc' } }
    if (sort === 'price-low') orderBy = { tutorProfile: { perClassRate: 'asc' } }
    if (sort === 'price-high') orderBy = { tutorProfile: { perClassRate: 'desc' } }
    if (sort === 'lessons') orderBy = { tutorProfile: { lessonsCount: 'desc' } }

    const tutors = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        country: true,
        avatar: true,
        gender: true,
        phone: true,
        tutorProfile: {
          select: {
            id: true,
            bio: true,
            perClassRate: true,
            rating: true,
            reviewCount: true,
            studentCount: true,
            lessonsCount: true,
            verified: true,
            nativeArabic: true,
            hafiz: true,
            ijazaCertified: true,
            audioIntroText: true,
            specialties: true,
            languages: true,
            experienceYears: true,
          },
        },
      },
      orderBy,
      take: 20,
    })

    if (tutors.length > 0) {
      return NextResponse.json({
        tutors: tutors.map((t) => ({
          id: t.id,
          name: t.name,
          country: t.country,
          avatar: t.avatar,
          profile: t.tutorProfile
            ? {
                id: t.tutorProfile.id,
                bio: t.tutorProfile.bio,
                hourlyRate: t.tutorProfile.perClassRate,
                perClassRate: t.tutorProfile.perClassRate,
                rating: t.tutorProfile.rating,
                reviewCount: t.tutorProfile.reviewCount,
                studentCount: t.tutorProfile.studentCount,
                lessonsCount: t.tutorProfile.lessonsCount,
                verified: t.tutorProfile.verified,
                nativeArabic: t.tutorProfile.nativeArabic,
                hafiz: t.tutorProfile.hafiz,
                ijazaCertified: t.tutorProfile.ijazaCertified,
                audioIntroText: t.tutorProfile.audioIntroText,
                specialties: t.tutorProfile.specialties.split(','),
                languages: t.tutorProfile.languages.split(','),
                experienceYears: t.tutorProfile.experienceYears,
              }
            : null,
        })),
      })
    }
    // DB returned empty — fall through to fallback
  } catch (e) {
    console.warn('[/api/tutors] Database unavailable, using fallback data:', (e as Error)?.message)
  }

  // Fallback: return static demo tutors (apply basic filters)
  const url = new URL(req.url)
  const category = url.searchParams.get('category') || 'all'
  const search = (url.searchParams.get('search') || '').toLowerCase()

  let filtered = [...FALLBACK_TUTORS]
  if (category !== 'all') {
    filtered = filtered.filter((t) =>
      t.profile?.specialties?.some((s) => s.includes(category))
    )
  }
  if (search) {
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        t.country.toLowerCase().includes(search) ||
        t.profile?.bio?.toLowerCase().includes(search)
    )
  }

  return NextResponse.json({ tutors: filtered })
}

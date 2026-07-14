import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || 'all'
  const search = searchParams.get('search') || ''
  const nativeArabic = searchParams.get('nativeArabic')
  const hafiz = searchParams.get('hafiz')
  const ijaza = searchParams.get('ijaza')
  const minRating = searchParams.get('minRating')
  const gender = searchParams.get('gender') // 'male' | 'female'
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

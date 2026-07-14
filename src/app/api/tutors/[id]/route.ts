import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const user = await db.user.findUnique({
    where: { id },
    include: {
      tutorProfile: { include: { reviews: { include: { student: true }, take: 10, orderBy: { createdAt: 'desc' } } } },
      availabilities: true,
    },
  })
  if (!user || user.role !== 'TUTOR' || !user.tutorProfile) {
    return NextResponse.json({ error: 'Tutor not found' }, { status: 404 })
  }
  return NextResponse.json({
    id: user.id,
    name: user.name,
    country: user.country,
    avatar: user.avatar,
    profile: {
      ...user.tutorProfile,
      specialties: user.tutorProfile.specialties.split(','),
      languages: user.tutorProfile.languages.split(','),
    },
    availabilities: user.availabilities,
    reviews: user.tutorProfile.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      studentName: r.student.name,
      createdAt: r.createdAt,
    })),
  })
}

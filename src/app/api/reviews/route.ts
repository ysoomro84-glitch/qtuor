import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })
  const { tutorId, rating, comment } = await req.json()
  const tutorProfile = await db.tutorProfile.findUnique({ where: { userId: tutorId } })
  if (!tutorProfile) return NextResponse.json({ error: 'Tutor not found' }, { status: 404 })

  const review = await db.review.create({
    data: { tutorId: tutorProfile.id, studentId: session.userId, rating, comment },
  })

  // update tutor aggregate
  const agg = await db.review.aggregate({
    where: { tutorId: tutorProfile.id },
    _avg: { rating: true },
    _count: true,
  })
  await db.tutorProfile.update({
    where: { id: tutorProfile.id },
    data: {
      rating: agg._avg.rating || 5,
      reviewCount: agg._count,
    },
  })

  return NextResponse.json({ review })
}

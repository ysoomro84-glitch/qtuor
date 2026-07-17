import { NextRequest, NextResponse } from 'next/server'

const _getDb = () => import("@/lib/db").then(m => m.db);
async function _getSession() {
  const { getSession } = await import('@/lib/auth');
  return getSession();
}

export async function POST(req: NextRequest) {
  const session = await _getSession()
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })
  const { tutorId, rating, comment } = await req.json()
  const tutorProfile = await (await _getDb()).tutorProfile.findUnique({ where: { userId: tutorId } })
  if (!tutorProfile) return NextResponse.json({ error: 'Tutor not found' }, { status: 404 })

  const review = await (await _getDb()).review.create({
    data: { tutorId: tutorProfile.id, studentId: session.userId, rating, comment },
  })

  // update tutor aggregate
  const agg = await (await _getDb()).review.aggregate({
    where: { tutorId: tutorProfile.id },
    _avg: { rating: true },
    _count: true,
  })
  await (await _getDb()).tutorProfile.update({
    where: { id: tutorProfile.id },
    data: {
      rating: agg._avg.rating || 5,
      reviewCount: agg._count,
    },
  })

  return NextResponse.json({ review })
}

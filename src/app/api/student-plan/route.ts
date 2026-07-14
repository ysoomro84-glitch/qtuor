import { NextRequest, NextResponse } from 'next/server'

/**
 * Returns the student's active subscription plan category.
 * Used by the Virtual Classroom to lock/unlock content based on the plan.
 */
export async function GET(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const { getSession } = await import('@/lib/auth')
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId') || session.userId

    const sub = await db.subscription.findFirst({
      where: { userId: studentId, status: 'ACTIVE' },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    })

    if (!sub) {
      return NextResponse.json({ plan: null, category: null, allowedBooks: ['qaida', 'quran'] })
    }

    const category = sub.plan.category || 'General'
    let allowedBooks: ('qaida' | 'quran')[]
    if (category === 'Noorani Qaida') {
      allowedBooks = ['qaida']
    } else if (category === 'Quran Recitation With Tajweed' || category === 'Hifz') {
      allowedBooks = ['quran']
    } else {
      allowedBooks = ['qaida', 'quran']
    }

    return NextResponse.json({
      plan: { name: sub.plan.name, category, monthlyPrice: sub.plan.monthlyPrice },
      category,
      allowedBooks,
    })
  } catch (e) {
    // DB unavailable — allow both books in demo mode
    return NextResponse.json({ plan: null, category: null, allowedBooks: ['qaida', 'quran'] })
  }
}

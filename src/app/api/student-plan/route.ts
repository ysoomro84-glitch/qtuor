import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

/**
 * Returns the student's active subscription plan category.
 * Used by the Virtual Classroom to lock/unlock content based on the plan.
 *
 * Content Lock Logic:
 *  • "Noorani Qaida" → only Qaida pages
 *  • "Quran Recitation With Tajweed", "Hifz" → only Quran pages
 *  • Others (Arabic, Tafsir, Islamic Studies) → both Qaida + Quran
 */
export async function GET(req: NextRequest) {
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

  // Determine which books are allowed based on plan category
  let allowedBooks: ('qaida' | 'quran')[]
  if (category === 'Noorani Qaida') {
    allowedBooks = ['qaida']
  } else if (category === 'Quran Recitation With Tajweed' || category === 'Hifz') {
    allowedBooks = ['quran']
  } else {
    // Arabic Language, Tafsir, Islamic Studies, General → both
    allowedBooks = ['qaida', 'quran']
  }

  return NextResponse.json({
    plan: { name: sub.plan.name, category, monthlyPrice: sub.plan.monthlyPrice },
    category,
    allowedBooks,
  })
}

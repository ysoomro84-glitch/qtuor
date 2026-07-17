import { NextRequest, NextResponse } from 'next/server'

/**
 * Returns the student's active subscription plan category.
 * Used by the Virtual Classroom to lock/unlock content based on the plan.
 */

// ─── Demo plan data for serverless/Vercel ───
function getDemoPlanData(email: string) {
  // Noorani Qaida demo students → qaida only
  if (email === 'noorani.demo@qtuor.com' || email === 'hareem.demo@qtuor.com') {
    return {
      plan: { name: 'Noorani Qaida Plan', category: 'Noorani Qaida', monthlyPrice: 21 },
      category: 'Noorani Qaida',
      allowedBooks: ['qaida'] as const,
    }
  }
  // Quran demo students → quran only
  if (email === 'quran.demo@qtuor.com' || email === 'yasir.demo@qtuor.com') {
    return {
      plan: { name: 'Quran & Tajweed Plan', category: 'Quran Recitation With Tajweed', monthlyPrice: 26 },
      category: 'Quran Recitation With Tajweed',
      allowedBooks: ['quran'] as const,
    }
  }
  return null
}

export async function GET(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const { getSession } = await import('@/lib/auth')
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId') || session.userId

    try {
      const sub = await db.subscription.findFirst({
        where: { userId: studentId, status: 'ACTIVE' },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      })

      // If no subscription found in DB, check demo accounts
      if (!sub) {
        const demoPlan = getDemoPlanData(session.email)
        if (demoPlan) return NextResponse.json(demoPlan)
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
    } catch (dbErr: any) {
      // DB unavailable on Vercel — check demo accounts first
      if (dbErr?.message === 'DATABASE_UNAVAILABLE') {
        const demoPlan = getDemoPlanData(session.email)
        if (demoPlan) return NextResponse.json(demoPlan)
        return NextResponse.json({ plan: null, category: null, allowedBooks: ['qaida', 'quran'] })
      }
      throw dbErr
    }
  } catch (e: any) {
    // Session error or other
    return NextResponse.json({ plan: null, category: null, allowedBooks: ['qaida', 'quran'] })
  }
}

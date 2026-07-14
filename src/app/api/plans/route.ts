import { NextResponse } from 'next/server'
import { FALLBACK_PLANS } from '@/lib/fallback-data'

export async function GET() {
  try {
    const { db } = await import('@/lib/db')
    const plans = await db.plan.findMany({
      where: { active: true },
      orderBy: { monthlyPrice: 'asc' },
    })
    if (plans.length > 0) {
      return NextResponse.json({
        plans: plans.map((p) => ({ ...p, features: p.features.split('\n').filter(Boolean) })),
      })
    }
    // DB returned empty — fall through to fallback
  } catch (e) {
    console.warn('[/api/plans] Database unavailable, using fallback data:', (e as Error)?.message)
  }

  // Fallback: return static demo plans
  return NextResponse.json({ plans: FALLBACK_PLANS })
}

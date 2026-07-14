import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const plans = await db.plan.findMany({
    where: { active: true },
    orderBy: { monthlyPrice: 'asc' },
  })
  return NextResponse.json({
    plans: plans.map((p) => ({ ...p, features: p.features.split('\n').filter(Boolean) })),
  })
}

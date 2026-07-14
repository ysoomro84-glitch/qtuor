import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }
  const { name, category, classesPerMonth, monthlyPrice, description, features, popular } = await req.json()
  const plan = await db.plan.create({
    data: {
      name,
      category: category || 'General',
      classesPerMonth: parseInt(classesPerMonth),
      monthlyPrice: parseFloat(monthlyPrice),
      description,
      features: Array.isArray(features) ? features.join('\n') : features,
      popular: !!popular,
      active: true,
    },
  })
  return NextResponse.json({ plan: { ...plan, features: plan.features.split('\n').filter(Boolean) } })
}

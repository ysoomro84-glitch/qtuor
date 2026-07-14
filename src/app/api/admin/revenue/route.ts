import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getPlatformRevenueStats } from '@/lib/billing'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }
  const stats = await getPlatformRevenueStats()

  // Get all splits with student + tutor info for the admin ledger
  const splits = await db.walletSplit.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      tutor: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json({ stats, splits })
}

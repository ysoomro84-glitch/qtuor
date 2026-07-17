import { NextResponse } from 'next/server'
import { getPlatformRevenueStats } from '@/lib/billing'

const _getDb = () => import("@/lib/db").then(m => m.db);
async function _getSession() {
  const { getSession } = await import('@/lib/auth');
  return getSession();
}

export async function GET() {
  const session = await _getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }
  const stats = await getPlatformRevenueStats()

  // Get all splits with student + tutor info for the admin ledger
  const splits = await (await _getDb()).walletSplit.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      tutor: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json({ stats, splits })
}

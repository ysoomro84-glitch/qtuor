import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

/** GET /api/admin/ledger/receivables — student payment audit log + summary. */
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }

  const payments = await db.studentPayment.findMany({
    orderBy: { paidAt: 'desc' },
    take: 200,
  })

  const summary = {
    total: payments.reduce((s, p) => s + (p.status === 'SUCCESS' ? p.amount : 0), 0),
    successCount: payments.filter((p) => p.status === 'SUCCESS').length,
    failedCount: payments.filter((p) => p.status === 'FAILED').length,
    pendingCount: payments.filter((p) => p.status === 'PENDING').length,
    refundedCount: payments.filter((p) => p.status === 'REFUNDED').length,
    totalAmount: payments.reduce((s, p) => s + p.amount, 0),
  }

  return NextResponse.json({ payments, summary })
}

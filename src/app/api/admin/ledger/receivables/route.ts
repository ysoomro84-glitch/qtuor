import { NextResponse } from 'next/server'

const _getDb = () => import("@/lib/db").then(m => m.db);
const _getAuth = () => import("@/lib/auth").then(m => m.getSession);

/** GET /api/admin/ledger/receivables — student payment audit log + summary. */
export async function GET() {
  const session = (await _getAuth())
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }

  const payments = await (await _getDb()).studentPayment.findMany({
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

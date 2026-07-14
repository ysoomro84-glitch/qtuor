import { NextResponse } from 'next/server'

const _getDb = () => import("@/lib/db").then(m => m.db);
const _getAuth = () => import("@/lib/auth").then(m => m.getSession);

export async function GET() {
  const session = (await _getAuth())
  if (!session || session.role !== 'TUTOR') {
    return NextResponse.json({ error: 'Tutor login required' }, { status: 401 })
  }
  const wallet = await (await _getDb()).wallet.upsert({
    where: { tutorId: session.userId },
    update: {},
    create: { tutorId: session.userId },
  })
  const withdrawals = await (await _getDb()).withdrawal.findMany({
    where: { tutorId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return NextResponse.json({ wallet, withdrawals })
}

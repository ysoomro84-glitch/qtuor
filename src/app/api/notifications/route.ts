import { NextResponse } from 'next/server'

const _getDb = () => import("@/lib/db").then(m => m.db);
const _getAuth = () => import("@/lib/auth").then(m => m.getSession);

export async function GET() {
  const session = (await _getAuth())
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }
  const notifications = await (await _getDb()).notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  const count = await (await _getDb()).notification.count()
  const byType = await (await _getDb()).notification.groupBy({
    by: ['type'],
    _count: true,
    orderBy: { _count: { type: 'desc' } },
  })
  return NextResponse.json({ notifications, count, byType })
}

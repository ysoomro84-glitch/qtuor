import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }
  const notifications = await db.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  const count = await db.notification.count()
  const byType = await db.notification.groupBy({
    by: ['type'],
    _count: true,
    orderBy: { _count: { type: 'desc' } },
  })
  return NextResponse.json({ notifications, count, byType })
}

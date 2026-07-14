import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'TUTOR') {
    return NextResponse.json({ error: 'Tutor login required' }, { status: 401 })
  }
  const wallet = await db.wallet.upsert({
    where: { tutorId: session.userId },
    update: {},
    create: { tutorId: session.userId },
  })
  const withdrawals = await db.withdrawal.findMany({
    where: { tutorId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return NextResponse.json({ wallet, withdrawals })
}

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getTutorWalletLedger } from '@/lib/billing'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'TUTOR') {
    return NextResponse.json({ error: 'Tutor login required' }, { status: 401 })
  }
  const ledger = await getTutorWalletLedger(session.userId)
  return NextResponse.json(ledger)
}

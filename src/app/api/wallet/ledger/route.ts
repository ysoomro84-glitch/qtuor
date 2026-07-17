import { NextResponse } from 'next/server'
import { getTutorWalletLedger } from '@/lib/billing'

async function _getSession() {
  const { getSession } = await import('@/lib/auth');
  return getSession();
}

export async function GET() {
  const session = await _getSession()
  if (!session || session.role !== 'TUTOR') {
    return NextResponse.json({ error: 'Tutor login required' }, { status: 401 })
  }
  const ledger = await getTutorWalletLedger(session.userId)
  return NextResponse.json(ledger)
}

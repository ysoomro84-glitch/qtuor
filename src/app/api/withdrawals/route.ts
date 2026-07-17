import { NextRequest, NextResponse } from 'next/server'

const _getDb = () => import("@/lib/db").then(m => m.db);
async function _getSession() {
  const { getSession } = await import('@/lib/auth');
  return getSession();
}

export async function POST(req: NextRequest) {
  const session = await _getSession()
  if (!session || session.role !== 'TUTOR') {
    return NextResponse.json({ error: 'Tutor login required' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const {
    amount,
    method = 'BANK',
    accountLabel,
    accountNumber,
    iban,
    bankName,
    mobileNumber,
  } = body as {
    amount?: number
    method?: string
    accountLabel?: string
    accountNumber?: string
    iban?: string
    bankName?: string
    mobileNumber?: string
  }

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const wallet = await (await _getDb()).wallet.findUnique({ where: { tutorId: session.userId } })
  if (!wallet || wallet.balance < amount) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
  }

  const withdrawal = await (await _getDb()).withdrawal.create({
    data: {
      tutorId: session.userId,
      amount,
      method,
      status: 'PENDING',
      accountLabel: accountLabel ?? null,
      accountNumber: accountNumber ?? null,
      iban: iban ?? null,
      bankName: bankName ?? null,
      mobileNumber: mobileNumber ?? null,
    },
  })
  await (await _getDb()).wallet.update({
    where: { tutorId: session.userId },
    data: { balance: { decrement: amount }, pendingPayout: { increment: amount } },
  })
  return NextResponse.json({ withdrawal })
}

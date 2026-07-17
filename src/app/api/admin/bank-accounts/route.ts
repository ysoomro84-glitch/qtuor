import { NextRequest, NextResponse } from 'next/server'

const _getDb = () => import("@/lib/db").then(m => m.db);
async function _getSession() {
  const { getSession } = await import('@/lib/auth');
  return getSession();
}

async function adminGuard() {
  const session = await _getSession()
  if (!session || session.role !== 'ADMIN') return null
  return session
}

/** GET /api/admin/bank-accounts — list all bank accounts. */
export async function GET() {
  const session = await adminGuard()
  if (!session) return NextResponse.json({ error: 'Admin login required' }, { status: 401 })

  const bankAccounts = await (await _getDb()).bankAccount.findMany({
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json({ bankAccounts })
}

/** POST /api/admin/bank-accounts — create a new bank account. */
export async function POST(req: NextRequest) {
  const session = await adminGuard()
  if (!session) return NextResponse.json({ error: 'Admin login required' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const {
    bankName,
    accountHolder,
    iban,
    accountNumber,
    swiftCode,
    branchCode,
    country,
    currency,
    isDefault,
    notes,
  } = body as Record<string, unknown>

  if (!bankName || typeof bankName !== 'string' || !bankName.trim()) {
    return NextResponse.json({ error: 'Bank name is required' }, { status: 400 })
  }
  if (!accountHolder || typeof accountHolder !== 'string' || !accountHolder.trim()) {
    return NextResponse.json({ error: 'Account holder is required' }, { status: 400 })
  }

  const created = await (await _getDb()).$transaction(async (tx) => {
    if (isDefault === true) {
      await tx.bankAccount.updateMany({ data: { isDefault: false } })
    }
    return tx.bankAccount.create({
      data: {
        bankName: bankName.trim(),
        accountHolder: accountHolder.trim(),
        iban: typeof iban === 'string' ? iban.trim() || null : null,
        accountNumber: typeof accountNumber === 'string' ? accountNumber.trim() || null : null,
        swiftCode: typeof swiftCode === 'string' ? swiftCode.trim() || null : null,
        branchCode: typeof branchCode === 'string' ? branchCode.trim() || null : null,
        country: typeof country === 'string' ? country.trim() || null : null,
        currency: typeof currency === 'string' && currency.trim() ? currency.trim() : 'USD',
        isDefault: isDefault === true,
        notes: typeof notes === 'string' ? notes.trim() || null : null,
      },
    })
  })

  return NextResponse.json({ bankAccount: created })
}

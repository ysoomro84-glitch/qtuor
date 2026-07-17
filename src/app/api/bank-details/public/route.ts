import { NextResponse } from 'next/server'

const _getDb = () => import("@/lib/db").then(m => m.db);

/**
 * GET /api/bank-details/public
 * Returns the default (or first) bank account so students can make a local
 * bank transfer. Public endpoint — no auth required. Returns full bank
 * details because students need them to actually wire the money.
 */
export async function GET() {
  const bank = await (await _getDb()).bankAccount.findFirst({
    where: { isDefault: true },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  })

  if (!bank) {
    return NextResponse.json({ bank: null })
  }

  return NextResponse.json({
    bank: {
      id: bank.id,
      bankName: bank.bankName,
      accountHolder: bank.accountHolder,
      accountNumber: bank.accountNumber,
      iban: bank.iban,
      swiftCode: bank.swiftCode,
      branchCode: bank.branchCode,
      country: bank.country,
      currency: bank.currency,
      notes: bank.notes,
    },
  })
}

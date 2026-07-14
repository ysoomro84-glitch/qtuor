import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

async function adminGuard() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return null
  return session
}

/** PATCH /api/admin/bank-accounts/[id] — partial update. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await adminGuard()
  if (!session) return NextResponse.json({ error: 'Admin login required' }, { status: 401 })

  const { id } = await ctx.params
  const existing = await db.bankAccount.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })

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

  const data: Record<string, unknown> = {}
  if (typeof bankName === 'string') data.bankName = bankName.trim()
  if (typeof accountHolder === 'string') data.accountHolder = accountHolder.trim()
  if (typeof iban === 'string') data.iban = iban.trim() || null
  if (typeof accountNumber === 'string') data.accountNumber = accountNumber.trim() || null
  if (typeof swiftCode === 'string') data.swiftCode = swiftCode.trim() || null
  if (typeof branchCode === 'string') data.branchCode = branchCode.trim() || null
  if (typeof country === 'string') data.country = country.trim() || null
  if (typeof currency === 'string' && currency.trim()) data.currency = currency.trim()
  if (typeof notes === 'string') data.notes = notes.trim() || null
  if (typeof isDefault === 'boolean') data.isDefault = isDefault

  const updated = await db.$transaction(async (tx) => {
    if (data.isDefault === true) {
      await tx.bankAccount.updateMany({
        where: { NOT: { id } },
        data: { isDefault: false },
      })
    }
    return tx.bankAccount.update({ where: { id }, data })
  })

  return NextResponse.json({ bankAccount: updated })
}

/** DELETE /api/admin/bank-accounts/[id] — remove a bank account. */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await adminGuard()
  if (!session) return NextResponse.json({ error: 'Admin login required' }, { status: 401 })

  const { id } = await ctx.params
  try {
    await db.bankAccount.delete({ where: { id } })
  } catch {
    return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}

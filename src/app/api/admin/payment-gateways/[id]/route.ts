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

/** PATCH /api/admin/payment-gateways/[id] — partial update. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await adminGuard()
  if (!session) return NextResponse.json({ error: 'Admin login required' }, { status: 401 })

  const { id } = await ctx.params
  const existing = await (await _getDb()).paymentGateway.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Gateway not found' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const {
    isActive,
    sandbox,
    publishableKey,
    secretKey,
    webhookSecret,
    clientId,
    clientSecret,
    payoutEmail,
    displayName,
    notes,
  } = body as Record<string, unknown>

  const data: Record<string, unknown> = {}
  if (typeof isActive === 'boolean') data.isActive = isActive
  if (typeof sandbox === 'boolean') data.sandbox = sandbox
  if (typeof publishableKey === 'string') data.publishableKey = publishableKey
  if (typeof secretKey === 'string') data.secretKey = secretKey
  if (typeof webhookSecret === 'string') data.webhookSecret = webhookSecret
  if (typeof clientId === 'string') data.clientId = clientId
  if (typeof clientSecret === 'string') data.clientSecret = clientSecret
  if (typeof payoutEmail === 'string') data.payoutEmail = payoutEmail
  if (typeof displayName === 'string') data.displayName = displayName
  if (typeof notes === 'string') data.notes = notes

  const updated = await (await _getDb()).$transaction(async (tx) => {
    if (data.isActive === true) {
      await tx.paymentGateway.updateMany({
        where: { NOT: { id } },
        data: { isActive: false },
      })
    }
    return tx.paymentGateway.update({ where: { id }, data })
  })

  return NextResponse.json({ gateway: updated })
}

/** DELETE /api/admin/payment-gateways/[id] — remove a gateway. */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await adminGuard()
  if (!session) return NextResponse.json({ error: 'Admin login required' }, { status: 401 })

  const { id } = await ctx.params
  try {
    await (await _getDb()).paymentGateway.delete({ where: { id } })
  } catch {
    return NextResponse.json({ error: 'Gateway not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}

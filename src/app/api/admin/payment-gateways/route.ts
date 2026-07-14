import { NextRequest, NextResponse } from 'next/server'

const _getDb = () => import("@/lib/db").then(m => m.db);
const _getAuth = () => import("@/lib/auth").then(m => m.getSession);

async function adminGuard() {
  const session = (await _getAuth())
  if (!session || session.role !== 'ADMIN') return null
  return session
}

/** GET /api/admin/payment-gateways — list all gateways + bank accounts. */
export async function GET() {
  const session = await adminGuard()
  if (!session) return NextResponse.json({ error: 'Admin login required' }, { status: 401 })

  const [gateways, bankAccounts] = await Promise.all([
    (await _getDb()).paymentGateway.findMany({ orderBy: { provider: 'asc' } }),
    (await _getDb()).bankAccount.findMany({ orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] }),
  ])

  return NextResponse.json({ gateways, bankAccounts })
}

/** PUT /api/admin/payment-gateways — partial update by id. */
export async function PUT(req: NextRequest) {
  const session = await adminGuard()
  if (!session) return NextResponse.json({ error: 'Admin login required' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { id } = body as { id?: string }
  if (!id) return NextResponse.json({ error: 'Gateway id is required' }, { status: 400 })

  const existing = await (await _getDb()).paymentGateway.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Gateway not found' }, { status: 404 })

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

  // Only one gateway should be active at a time per provider convention.
  // If activating this one, deactivate the other(s).
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

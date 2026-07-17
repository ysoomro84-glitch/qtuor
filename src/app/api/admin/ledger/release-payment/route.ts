import { NextRequest, NextResponse } from 'next/server'

const _getDb = () => import("@/lib/db").then(m => m.db);
async function _getSession() {
  const { getSession } = await import('@/lib/auth');
  return getSession();
}

/** POST /api/admin/ledger/release-payment — admin releases a tutor wallet payout. */
export async function POST(req: NextRequest) {
  const session = await _getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { tutorId, amount, method, destination } = body as {
    tutorId?: string
    amount?: number
    method?: string
    destination?: string
  }

  if (!tutorId) return NextResponse.json({ error: 'tutorId is required' }, { status: 400 })

  const amt = typeof amount === 'number' ? amount : Number(amount)
  if (!Number.isFinite(amt) || amt <= 0) {
    return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
  }

  const validMethods = ['BANK_TRANSFER', 'PAYPAL', 'STRIPE']
  const finalMethod = validMethods.includes(method || '') ? method! : 'BANK_TRANSFER'

  const tutor = await (await _getDb()).user.findUnique({
    where: { id: tutorId },
    include: { wallet: true, tutorProfile: true },
  })
  if (!tutor) return NextResponse.json({ error: 'Tutor not found' }, { status: 404 })
  if (!tutor.wallet) return NextResponse.json({ error: 'Tutor has no wallet' }, { status: 400 })
  if (tutor.wallet.balance < amt) {
    return NextResponse.json(
      { error: `Insufficient wallet balance ($${tutor.wallet.balance.toFixed(2)} available)` },
      { status: 400 }
    )
  }

  // Mask the destination for the audit log (keep last 4 chars only).
  const destRaw = typeof destination === 'string' ? destination.trim() : ''
  const maskedDestination = destRaw
    ? destRaw.length <= 4
      ? `••••${destRaw}`
      : `••••${destRaw.slice(-4)}`
    : null

  const result = await (await _getDb()).$transaction(async (tx) => {
    const release = await tx.payoutRelease.create({
      data: {
        tutorId,
        tutorName: tutor.name,
        amount: amt,
        method: finalMethod,
        destination: maskedDestination,
        status: 'CLEARED',
        releasedBy: session.userId,
      },
    })

    const wallet = await tx.wallet.update({
      where: { tutorId },
      data: { balance: { decrement: amt } },
    })

    // Simple in-app notification (no WhatsApp dependency for this action).
    await tx.notification.create({
      data: {
        type: 'TUTOR_PAYOUT',
        channel: 'WHATSAPP',
        recipientName: tutor.name,
        recipientUserId: tutorId,
        recipientTutorId: tutor.tutorProfile?.id ?? null,
        recipientPhone: tutor.phone ?? null,
        message: `Payment of $${amt.toFixed(2)} released to your ${finalMethod.replace('_', ' ').toLowerCase()}.`,
        status: 'SIMULATED',
        meta: JSON.stringify({
          amount: amt,
          method: finalMethod,
          releaseId: release.id,
          releasedBy: session.userId,
        }),
      },
    })

    return { release, wallet }
  })

  return NextResponse.json({ ok: true, release: result.release, wallet: result.wallet })
}

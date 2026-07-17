import { NextRequest, NextResponse } from 'next/server'

const _getDb = () => import("@/lib/db").then(m => m.db);

async function _getSession() {
  const { getSession } = await import('@/lib/auth');
  return getSession();
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await _getSession()
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })
  const { id } = await ctx.params
  const body = await req.json()
  const { status } = body

  const booking = await (await _getDb()).booking.findUnique({ where: { id } })
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const isParty = booking.studentId === session.userId || booking.tutorId === session.userId
  if (!isParty) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // On completion — NO per-class deduction or wallet credit.
  // The tutor's 55% share is released from escrow on the monthly payout cycle,
  // not per-class. Completing a class just updates the booking status.
  // (The escrow split was created when the student subscribed.)

  const updated = await (await _getDb()).booking.update({
    where: { id },
    data: { status },
  })
  return NextResponse.json({ booking: updated })
}

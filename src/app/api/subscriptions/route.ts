import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { sendWhatsApp, msgPaymentSuccess } from '@/lib/whatsapp'
import { createEscrowSplit } from '@/lib/billing'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ subscription: null })
  const sub = await db.subscription.findFirst({
    where: { userId: session.userId, status: 'ACTIVE' },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  })
  if (!sub) return NextResponse.json({ subscription: null })
  return NextResponse.json({
    subscription: {
      id: sub.id,
      status: sub.status,
      startedAt: sub.startedAt,
      expiresAt: sub.expiresAt,
      plan: { ...sub.plan, features: sub.plan.features.split('\n').filter(Boolean) },
    },
  })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })
  const { planId } = await req.json()
  const plan = await db.plan.findUnique({ where: { id: planId } })
  if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

  // Cancel existing active subs
  await db.subscription.updateMany({
    where: { userId: session.userId, status: 'ACTIVE' },
    data: { status: 'CANCELLED' },
  })

  const sub = await db.subscription.create({
    data: {
      userId: session.userId,
      planId: plan.id,
      status: 'ACTIVE',
      // Fixed monthly subscription — no class balance. Student pays flat rate.
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
    include: { plan: true },
  })

  // ===== Create escrow split (55/45) =====
  // The full plan price is held in escrow. When the monthly cycle ends,
  // 55% is released to the tutor's wallet and 45% becomes platform revenue.
  // The tutor is determined when the student books their first class.
  const user = await db.user.findUnique({ where: { id: session.userId } })
  if (user) {
    // Check if the student already has a tutor (from existing bookings)
    const existingBooking = await db.booking.findFirst({
      where: { studentId: session.userId, status: { in: ['SCHEDULED', 'COMPLETED'] } },
      orderBy: { createdAt: 'desc' },
    })
    await createEscrowSplit(
      sub.id,
      session.userId,
      user.name,
      plan.name,
      plan.monthlyPrice,
      existingBooking?.tutorId
    )

    // ===== WhatsApp: Payment success notification =====
    await sendWhatsApp({
      type: 'PAYMENT_SUCCESS',
      recipientName: user.name,
      recipientPhone: user.phone,
      recipientUserId: user.id,
      message: msgPaymentSuccess(user.name, plan.name, plan.monthlyPrice, plan.classesPerMonth),
      meta: { planId: plan.id, planName: plan.name, amount: plan.monthlyPrice, classesPerMonth: plan.classesPerMonth },
    })
  }

  return NextResponse.json({
    subscription: {
      id: sub.id,
      status: sub.status,
      expiresAt: sub.expiresAt,
      plan: { ...sub.plan, features: sub.plan.features.split('\n').filter(Boolean) },
    },
  })
}

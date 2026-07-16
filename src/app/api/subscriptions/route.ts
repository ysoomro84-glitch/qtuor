import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const { db } = await import('@/lib/db')
    const { getSession } = await import('@/lib/auth')
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
  } catch (e) {
    // DB unavailable — return demo subscription for Vercel deployment
    try {
      const { getSession } = await import('@/lib/auth')
      const session = await getSession()
      const now = new Date()
      const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      if (session?.email === 'noorani.demo@qtuor.com') {
        return NextResponse.json({
          subscription: {
            id: 'demo-sub-nq', status: 'ACTIVE', startedAt: now.toISOString(), expiresAt: expires.toISOString(),
            plan: { id: 'plan-nq-3', name: 'Qaida Learner', category: 'Noorani Qaida', classesPerMonth: 12, monthlyPrice: 39, features: ['3 classes / week (30 min each)', 'Interactive Noorani Qaida board', 'Certified Qaida tutor', 'Auto-bookmark & resume', 'Parent safety snapshots', 'Homework worksheets'] },
          },
        })
      }
      if (session?.email === 'quran.demo@qtuor.com') {
        return NextResponse.json({
          subscription: {
            id: 'demo-sub-tw', status: 'ACTIVE', startedAt: now.toISOString(), expiresAt: expires.toISOString(),
            plan: { id: 'plan-tw-3', name: 'Tajweed Builder', category: 'Quran Recitation With Tajweed', classesPerMonth: 12, monthlyPrice: 49, features: ['3 classes / week (30 min each)', 'Word-by-word Quran sync', 'Tajweed color highlighting', 'Ijaza-certified tutor', 'Auto-bookmark & resume', 'Weekly progress report'] },
          },
        })
      }
    } catch {}
    // No active subscription in demo mode
    return NextResponse.json({ subscription: null })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const { getSession } = await import('@/lib/auth')
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })
    const { planId } = await req.json()
    const plan = await db.plan.findUnique({ where: { id: planId } })
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    await db.subscription.updateMany({
      where: { userId: session.userId, status: 'ACTIVE' },
      data: { status: 'CANCELLED' },
    })

    const sub = await db.subscription.create({
      data: {
        userId: session.userId,
        planId: plan.id,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
      include: { plan: true },
    })

    try {
      const { createEscrowSplit } = await import('@/lib/billing')
      const { sendWhatsApp, msgPaymentSuccess } = await import('@/lib/whatsapp')
      const user = await db.user.findUnique({ where: { id: session.userId } })
      if (user) {
        const existingBooking = await db.booking.findFirst({
          where: { studentId: session.userId, status: { in: ['SCHEDULED', 'COMPLETED'] } },
          orderBy: { createdAt: 'desc' },
        })
        await createEscrowSplit(sub.id, session.userId, user.name, plan.name, plan.monthlyPrice, existingBooking?.tutorId)
        await sendWhatsApp({
          type: 'PAYMENT_SUCCESS',
          recipientName: user.name,
          recipientPhone: user.phone,
          recipientUserId: user.id,
          message: msgPaymentSuccess(user.name, plan.name, plan.monthlyPrice, plan.classesPerMonth),
          meta: { planId: plan.id, planName: plan.name, amount: plan.monthlyPrice, classesPerMonth: plan.classesPerMonth },
        })
      }
    } catch (notifyErr) {
      console.warn('[subscriptions] Notification/billing failed:', (notifyErr as Error)?.message)
    }

    return NextResponse.json({
      subscription: {
        id: sub.id,
        status: sub.status,
        expiresAt: sub.expiresAt,
        plan: { ...sub.plan, features: sub.plan.features.split('\n').filter(Boolean) },
      },
    })
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable — subscription feature requires a connected database' }, { status: 503 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

/**
 * PATCH /api/admin/ledger/receivables/[id]
 * Admin only. Body: { status: 'SUCCESS' | 'REFUNDED' }.
 *
 * Updates the StudentPayment status. When the status moves to SUCCESS,
 * also activate the student's most recent PENDING subscription that matches
 * this payment (matched by studentId + planName + recent createdAt).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const { status } = body as { status?: string }

  const allowed = ['SUCCESS', 'REFUNDED', 'FAILED', 'PENDING']
  if (!status || !allowed.includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${allowed.join(', ')}` },
      { status: 400 }
    )
  }

  const payment = await db.studentPayment.findUnique({ where: { id } })
  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  const updated = await db.studentPayment.update({
    where: { id },
    data: { status },
  })

  // If approved (SUCCESS), activate the student's most recent PENDING subscription
  // matching the plan name on this payment.
  if (status === 'SUCCESS') {
    const planName = payment.planName
    // Find the plan by name (case-insensitive)
    const plan = await db.plan.findFirst({
      where: { name: planName },
    })

    if (plan) {
      const pendingSub = await db.subscription.findFirst({
        where: {
          userId: payment.studentId,
          planId: plan.id,
          status: 'PENDING',
        },
        orderBy: { createdAt: 'desc' },
      })

      if (pendingSub) {
        await db.subscription.update({
          where: { id: pendingSub.id },
          data: { status: 'ACTIVE' },
        })
      }
    } else {
      // Fallback: activate the most recent PENDING subscription for this student.
      const fallback = await db.subscription.findFirst({
        where: { userId: payment.studentId, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
      })
      if (fallback) {
        await db.subscription.update({
          where: { id: fallback.id },
          data: { status: 'ACTIVE' },
        })
      }
    }

    // ===== Automation trigger: PAYMENT_SUCCESS WhatsApp message =====
    // Fired when the admin approves a manual local bank transfer receipt
    // (also fires for Stripe webhook success — see /api/subscriptions).
    try {
      const { sendWhatsApp, getTemplate } = await import('@/lib/whatsapp')
      const student = await db.user.findUnique({ where: { id: payment.studentId } })
      if (student?.phone) {
        const message = await getTemplate(
          'PAYMENT_SUCCESS',
          'JazakAllah Khair! Payment of {Amount} received successfully for subscription plan {PlanName}. Your student account is now active. Log in to book your first class: www.qtuor.com/login',
          { StudentName: student.name, Amount: `$${payment.amount}`, PlanName: payment.planName }
        )
        await sendWhatsApp({
          type: 'PAYMENT_SUCCESS',
          recipientName: student.name,
          recipientPhone: student.phone,
          recipientUserId: student.id,
          message,
          meta: { trigger: 'PAYMENT_SUCCESS', paymentId: payment.id, amount: payment.amount },
        })
      }
    } catch (e) {
      console.error('[receivables] PAYMENT_SUCCESS WhatsApp trigger failed:', e)
    }
  }

  return NextResponse.json({ ok: true, payment: updated })
}

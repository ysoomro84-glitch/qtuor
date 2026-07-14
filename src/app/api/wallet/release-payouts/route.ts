import { NextResponse } from 'next/server'
import { processTutorMonthlyPayouts } from '@/lib/billing'
import { sendWhatsApp, msgTutorPayout } from '@/lib/whatsapp'

const _getDb = () => import("@/lib/db").then(m => m.db);
const _getAuth = () => import("@/lib/auth").then(m => m.getSession);

/**
 * Admin endpoint to manually trigger the monthly payout cycle.
 * Releases all ESCROWED splits (55% to tutor, 45% to platform)
 * and sends WhatsApp notifications to tutors.
 */
export async function POST() {
  const session = (await _getAuth())
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }

  const result = await processTutorMonthlyPayouts()

  // Send WhatsApp payout notifications to all tutors who received money
  const releasedSplits = await (await _getDb()).walletSplit.findMany({
    where: { status: 'RELEASED', releasedAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } },
    include: { tutor: { select: { id: true, name: true, phone: true } } },
  })

  for (const split of releasedSplits) {
    await sendWhatsApp({
      type: 'TUTOR_PAYOUT',
      recipientName: split.tutor.name,
      recipientPhone: split.tutor.phone,
      recipientUserId: split.tutor.id,
      message: msgTutorPayout(split.tutor.name, split.tutorShare, 'Bank/PayPal (Stripe Connect)'),
      meta: { splitId: split.id, amount: split.tutorShare, planName: split.planName },
    })
  }

  return NextResponse.json({
    ...result,
    notificationsSent: releasedSplits.length,
  })
}

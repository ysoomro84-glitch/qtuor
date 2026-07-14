import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { sendWhatsApp, msgTutorApproved } from '@/lib/whatsapp'

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }
  const { id } = await ctx.params
  const { status, verified } = await req.json()

  const profile = await db.tutorProfile.findUnique({ where: { userId: id }, include: { user: true } })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const wasApproved = profile.status === 'APPROVED'
  const updated = await db.tutorProfile.update({
    where: { userId: id },
    data: {
      ...(status ? { status, verified: status === 'APPROVED' } : {}),
      ...(typeof verified === 'boolean' ? { verified } : {}),
    },
  })

  // ===== WhatsApp: Tutor approved → send $10 registration fee link =====
  if (status === 'APPROVED' && !wasApproved) {
    const paymentLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.qtuor.com'}/register-fee?tutor=${id}`
    const message = msgTutorApproved(profile.user.name, paymentLink)
    await sendWhatsApp({
      type: 'TUTOR_APPROVED',
      recipientName: profile.user.name,
      recipientPhone: profile.user.phone,
      recipientUserId: id,
      recipientTutorId: profile.id,
      message,
      meta: { paymentLink, fee: 10, tutorId: id },
    })
  }

  return NextResponse.json({ profile: updated })
}

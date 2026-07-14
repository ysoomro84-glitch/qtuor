import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { getSession } = await import('@/lib/auth')
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
    }

    const { id } = await ctx.params
    const body = await req.json()
    const { status, verified } = body

    try {
      const { db } = await import('@/lib/db')

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
        try {
          const { sendWhatsApp, msgTutorApproved } = await import('@/lib/whatsapp')
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
        } catch (waErr) {
          console.warn('[admin/tutors] WhatsApp notification failed:', (waErr as Error)?.message)
        }
      }

      return NextResponse.json({ profile: updated })
    } catch (dbErr: any) {
      if (dbErr?.message === 'DATABASE_UNAVAILABLE') {
        return NextResponse.json({
          profile: {
            userId: id,
            status: status || 'PENDING',
            verified: status === 'APPROVED' || false,
          },
        })
      }
      throw dbErr
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update tutor' }, { status: 500 })
  }
}

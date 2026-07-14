import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { sendWhatsApp, msgBookingStudent, msgBookingTutor } from '@/lib/whatsapp'
import { format } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ bookings: [] })
  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role') || 'student'

  const where = role === 'tutor' ? { tutorId: session.userId } : { studentId: session.userId }
  const bookings = await db.booking.findMany({
    where,
    include: {
      student: { select: { id: true, name: true, avatar: true, country: true } },
      tutor: { select: { id: true, name: true, avatar: true, country: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  })
  return NextResponse.json({ bookings })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })
  const { tutorId, scheduledAt, durationMins = 30, topic, isTrial = false } = await req.json()

  if (session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Only students can book classes' }, { status: 403 })
  }

  // Trial check
  if (isTrial) {
    const usedTrial = await db.booking.findFirst({
      where: { studentId: session.userId, isTrial: true },
    })
    if (usedTrial) {
      return NextResponse.json({ error: 'You have already used your free trial class.' }, { status: 400 })
    }
  } else {
    // Fixed monthly subscription — no class balance to check.
    // Student just needs an active subscription. Classes are unlimited within the plan.
    const sub = await db.subscription.findFirst({
      where: { userId: session.userId, status: 'ACTIVE' },
    })
    if (!sub) {
      return NextResponse.json({ error: 'Please subscribe to a plan to book classes.' }, { status: 400 })
    }

    // If there's an ESCROWED split with no tutor assigned yet, assign this tutor
    const unassignedSplit = await db.walletSplit.findFirst({
      where: { subscriptionId: sub.id, status: 'ESCROWED' },
    })
    if (unassignedSplit) {
      // Check if this split already has a tutor; if not, assign the booked tutor
      // (The split was created without a tutor if the student subscribed before booking)
      // We update the split's tutorId and add to that tutor's escrowHeld
      const existingWallet = await db.wallet.findUnique({ where: { tutorId } })
      if (existingWallet) {
        // The escrow was already counted; just link the split to this tutor
        await db.walletSplit.update({
          where: { id: unassignedSplit.id },
          data: { tutorId },
        })
      } else {
        // Create wallet for this tutor and add escrow
        await db.wallet.create({
          data: { tutorId, escrowHeld: unassignedSplit.planPrice },
        })
        await db.walletSplit.update({
          where: { id: unassignedSplit.id },
          data: { tutorId },
        })
      }
    }
  }

  const booking = await db.booking.create({
    data: {
      studentId: session.userId,
      tutorId,
      scheduledAt: new Date(scheduledAt),
      durationMins,
      topic,
      isTrial,
      status: 'SCHEDULED',
      meetingId: 'qtuor-' + Math.random().toString(36).slice(2, 10),
    },
    include: {
      student: { select: { id: true, name: true, avatar: true, country: true, phone: true } },
      tutor: { select: { id: true, name: true, avatar: true, country: true, phone: true } },
    },
  })

  // ===== WhatsApp: Booking confirmation to both student and tutor =====
  const classDate = format(booking.scheduledAt, 'EEEE, MMM d yyyy')
  const classTime = format(booking.scheduledAt, 'h:mm a')
  const classroomLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.qtuor.com'}/?classroom=${booking.meetingId}`

  // To student
  await sendWhatsApp({
    type: 'BOOKING_CONFIRMATION_STUDENT',
    recipientName: booking.student.name,
    recipientPhone: booking.student.phone,
    recipientUserId: booking.student.id,
    message: msgBookingStudent(booking.student.name, booking.tutor.name, classDate, classTime, classroomLink, isTrial),
    meta: { bookingId: booking.id, tutorName: booking.tutor.name, isTrial },
  })

  // To tutor
  await sendWhatsApp({
    type: 'BOOKING_CONFIRMATION_TUTOR',
    recipientName: booking.tutor.name,
    recipientPhone: booking.tutor.phone,
    recipientUserId: booking.tutor.id,
    message: msgBookingTutor(booking.tutor.name, booking.student.name, classDate, classTime, isTrial),
    meta: { bookingId: booking.id, studentName: booking.student.name, isTrial },
  })

  return NextResponse.json({ booking })
}

import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsApp, msgBookingStudent, msgBookingTutor } from '@/lib/whatsapp'
import { format } from 'date-fns'

const _getDb = () => import("@/lib/db").then(m => m.db);
const _getAuth = () => import("@/lib/auth").then(m => m.getSession);

export async function GET(req: NextRequest) {
  const session = (await _getAuth())
  if (!session) return NextResponse.json({ bookings: [] })
  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role') || 'student'

  try {
    const where = role === 'tutor' ? { tutorId: session.userId } : { studentId: session.userId }
    const bookings = await (await _getDb()).booking.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, avatar: true, country: true } },
        tutor: { select: { id: true, name: true, avatar: true, country: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    })
    return NextResponse.json({ bookings })
  } catch (e: any) {
    if (e?.message === 'DATABASE_UNAVAILABLE') {
      // Demo fallback for Vercel (no SQLite)
      const demoTutor = { id: 'demo-tutor-ahmad', name: 'Qari Ahmad Raza', avatar: null, country: 'Pakistan' }
      const demoStudentNQ = { id: 'demo-noorani-student', name: 'Fatima Noor', avatar: null, country: 'Pakistan' }
      const demoStudentTW = { id: 'demo-quran-student', name: 'Ahmed Khan', avatar: null, country: 'United Kingdom' }

      if (session.email === 'noorani.demo@qtuor.com' && role === 'student') {
        return NextResponse.json({ bookings: [
          { id: 'demo-booking-nq-1', studentId: 'demo-noorani-student', tutorId: 'demo-tutor-ahmad', scheduledAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Noorani Qaida — Lesson 5: Harakat (Fatha, Kasra, Damma)', meetingId: 'demo-nq-room', tutor: demoTutor },
          { id: 'demo-booking-nq-2', studentId: 'demo-noorani-student', tutorId: 'demo-tutor-ahmad', scheduledAt: new Date(Date.now() + 65 * 60 * 1000).toISOString(), durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Quran Recitation — Surah Al-Fatihah Tajweed Practice', meetingId: 'demo-nq-quran', tutor: demoTutor },
        ] })
      }
      if (session.email === 'quran.demo@qtuor.com' && role === 'student') {
        return NextResponse.json({ bookings: [
          { id: 'demo-booking-tw-1', studentId: 'demo-quran-student', tutorId: 'demo-tutor-ahmad', scheduledAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Quran Recitation — Surah Al-Baqarah (Ayah 142-152) Tajweed Focus', meetingId: 'demo-tw-room', tutor: demoTutor },
          { id: 'demo-booking-tw-2', studentId: 'demo-quran-student', tutorId: 'demo-tutor-ahmad', scheduledAt: new Date(Date.now() + 65 * 60 * 1000).toISOString(), durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Noorani Qaida — Lesson 8: Madd (Stretching Rules)', meetingId: 'demo-tw-qaida', tutor: demoTutor },
        ] })
      }
      if (session.email === 'tutor.demo@qtuor.com' && role === 'tutor') {
        return NextResponse.json({ bookings: [
          { id: 'demo-booking-nq-1', studentId: 'demo-noorani-student', tutorId: 'demo-tutor-ahmad', scheduledAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Noorani Qaida — Lesson 5: Harakat', meetingId: 'demo-nq-room', student: demoStudentNQ },
          { id: 'demo-booking-tw-1', studentId: 'demo-quran-student', tutorId: 'demo-tutor-ahmad', scheduledAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), durationMins: 30, status: 'SCHEDULED', isTrial: false, topic: 'Quran Recitation — Surah Al-Baqarah', meetingId: 'demo-tw-room', student: demoStudentTW },
        ] })
      }
      return NextResponse.json({ bookings: [] })
    }
    throw e
  }
}

export async function POST(req: NextRequest) {
  const session = (await _getAuth())
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })
  const { tutorId, scheduledAt, durationMins = 30, topic, isTrial = false } = await req.json()

  if (session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Only students can book classes' }, { status: 403 })
  }

  // Trial check
  if (isTrial) {
    const usedTrial = await (await _getDb()).booking.findFirst({
      where: { studentId: session.userId, isTrial: true },
    })
    if (usedTrial) {
      return NextResponse.json({ error: 'You have already used your free trial class.' }, { status: 400 })
    }
  } else {
    // Fixed monthly subscription — no class balance to check.
    // Student just needs an active subscription. Classes are unlimited within the plan.
    const sub = await (await _getDb()).subscription.findFirst({
      where: { userId: session.userId, status: 'ACTIVE' },
    })
    if (!sub) {
      return NextResponse.json({ error: 'Please subscribe to a plan to book classes.' }, { status: 400 })
    }

    // If there's an ESCROWED split with no tutor assigned yet, assign this tutor
    const unassignedSplit = await (await _getDb()).walletSplit.findFirst({
      where: { subscriptionId: sub.id, status: 'ESCROWED' },
    })
    if (unassignedSplit) {
      // Check if this split already has a tutor; if not, assign the booked tutor
      // (The split was created without a tutor if the student subscribed before booking)
      // We update the split's tutorId and add to that tutor's escrowHeld
      const existingWallet = await (await _getDb()).wallet.findUnique({ where: { tutorId } })
      if (existingWallet) {
        // The escrow was already counted; just link the split to this tutor
        await (await _getDb()).walletSplit.update({
          where: { id: unassignedSplit.id },
          data: { tutorId },
        })
      } else {
        // Create wallet for this tutor and add escrow
        await (await _getDb()).wallet.create({
          data: { tutorId, escrowHeld: unassignedSplit.planPrice },
        })
        await (await _getDb()).walletSplit.update({
          where: { id: unassignedSplit.id },
          data: { tutorId },
        })
      }
    }
  }

  const booking = await (await _getDb()).booking.create({
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

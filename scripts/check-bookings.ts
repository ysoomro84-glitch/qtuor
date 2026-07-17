import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function check() {
  const bookings = await db.booking.findMany({
    include: {
      student: { select: { email: true, name: true } },
      tutor: { select: { email: true, name: true } },
    },
  })
  for (const b of bookings) {
    console.log('Booking:', b.id)
    console.log('  Student:', b.student.email, '-', b.student.name)
    console.log('  Tutor:', b.tutor.email, '-', b.tutor.name)
    console.log('  Topic:', b.topic)
    console.log('  Status:', b.status)
    console.log('  ScheduledAt:', b.scheduledAt.toISOString())
    console.log('  MeetingId:', b.meetingId || 'NULL')
    console.log('')
  }

  const subs = await db.subscription.findMany({
    include: { user: { select: { email: true } }, plan: { select: { name: true, category: true } } },
  })
  for (const s of subs) {
    console.log('Subscription:', s.id, '|', s.user.email, '|', s.plan.name, '(' + s.plan.category + ')', '|', s.status)
  }

  await db.$disconnect()
}
check()

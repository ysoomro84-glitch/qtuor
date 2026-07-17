import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function check() {
  console.log('=== BOOKINGS ===')
  const bookings = await db.booking.findMany({
    include: {
      student: { select: { email: true, name: true } },
      tutor: { select: { email: true, name: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  })
  for (const b of bookings) {
    console.log(`  ${b.student.name} (${b.student.email})`)
    console.log(`    Topic: ${b.topic}`)
    console.log(`    Status: ${b.status} | MeetingId: ${b.meetingId || 'NULL'}`)
    console.log(`    Scheduled: ${b.scheduledAt.toISOString()}`)
    console.log('')
  }

  console.log('=== SUBSCRIPTIONS ===')
  const subs = await db.subscription.findMany({
    include: { user: { select: { email: true, name: true } }, plan: { select: { name: true, category: true } } },
  })
  for (const s of subs) {
    console.log(`  ${s.user.name} (${s.user.email}) → ${s.plan.name} [${s.plan.category}] — ${s.status}`)
  }

  console.log('\n=== LESSON PROGRESS ===')
  const progress = await db.lessonProgress.findMany({
    include: { student: { select: { name: true } } },
  })
  for (const p of progress) {
    console.log(`  ${p.student.name}: ${p.subject} — ${p.lessonTitle} (${p.progressPct}%)`)
  }

  await db.$disconnect()
}
check()

/**
 * Seed: StudentPayment rows for the admin receivables ledger.
 * Idempotent (skips if any StudentPayment rows already exist).
 *
 * Run: `bun run scripts/seed-payments.ts`
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const SAMPLE_PAYMENTS = [
  { studentName: 'Ahmed Student', studentEmail: 'student@qtuor.com', planName: 'Quran Recitation With Tajweed — 4 Classes / Week', amount: 33, method: 'STRIPE', status: 'SUCCESS', daysAgo: 1 },
  { studentName: 'Aisha Rahman', studentEmail: 'aisha.rahman@example.com', planName: 'Hifz — 5 Classes / Week', amount: 49, method: 'PAYPAL', status: 'SUCCESS', daysAgo: 2 },
  { studentName: 'Yusuf Ozer', studentEmail: 'yusuf.ozer@example.com', planName: 'Noorani Qaida — 3 Classes / Week', amount: 21, method: 'CARD', status: 'SUCCESS', daysAgo: 3 },
  { studentName: 'Maryam Khan', studentEmail: 'maryam.khan@example.com', planName: 'Hifz — 4 Classes / Week', amount: 42, method: 'STRIPE', status: 'FAILED', daysAgo: 4 },
  { studentName: 'Ibrahim Sallam', studentEmail: 'ibrahim.sallam@example.com', planName: 'Quran Recitation With Tajweed — 2 Classes / Week', amount: 19, method: 'BANK_TRANSFER', status: 'PENDING', daysAgo: 5 },
  { studentName: 'Khadija Nur', studentEmail: 'khadija.nur@example.com', planName: 'Noorani Qaida — 5 Classes / Week', amount: 33, method: 'STRIPE', status: 'SUCCESS', daysAgo: 9 },
  { studentName: 'Omar Farooq', studentEmail: 'omar.farooq@example.com', planName: 'Hifz — 3 Classes / Week', amount: 34, method: 'PAYPAL', status: 'SUCCESS', daysAgo: 14 },
  { studentName: 'Fatima Zahra', studentEmail: 'fatima.zahra@example.com', planName: 'Quran Recitation With Tajweed — 5 Classes / Week', amount: 39, method: 'CARD', status: 'REFUNDED', daysAgo: 18 },
  { studentName: 'Bilal Hussain', studentEmail: 'bilal.hussain@example.com', planName: 'Noorani Qaida — 4 Classes / Week', amount: 27, method: 'STRIPE', status: 'SUCCESS', daysAgo: 22 },
  { studentName: 'Zainab Ali', studentEmail: 'zainab.ali@example.com', planName: 'Hifz — 2 Classes / Week', amount: 25, method: 'PAYPAL', status: 'SUCCESS', daysAgo: 27 },
]

async function main() {
  const existing = await db.studentPayment.count()
  if (existing > 0) {
    console.log(`Skipping seed — ${existing} StudentPayment rows already exist.`)
    return
  }

  // Try to map to real student ids so studentId is meaningful.
  const realStudents = await db.user.findMany({
    where: { role: 'STUDENT' },
    select: { id: true, name: true, email: true },
  })
  const findStudentId = (email: string) =>
    realStudents.find((s) => s.email.toLowerCase() === email.toLowerCase())?.id ?? 'guest-student'

  for (const p of SAMPLE_PAYMENTS) {
    const paidAt = new Date(Date.now() - p.daysAgo * 24 * 60 * 60 * 1000)
    await db.studentPayment.create({
      data: {
        studentId: findStudentId(p.studentEmail),
        studentName: p.studentName,
        studentEmail: p.studentEmail,
        planName: p.planName,
        amount: p.amount,
        paymentMethod: p.method,
        invoiceId: `INV-${p.daysAgo.toString().padStart(4, '0')}-${p.method.slice(0, 2).toUpperCase()}`,
        status: p.status,
        paidAt,
      },
    })
  }

  console.log(`Seeded ${SAMPLE_PAYMENTS.length} StudentPayment rows.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())

/**
 * Seed script: Creates 2 demo student accounts with active subscriptions
 * for testing the virtual classroom with BOTH Norani Qaida AND Quran.
 *
 * Both demo accounts get a "General" category plan that unlocks
 * both Qaida and Quran in the virtual classroom.
 *
 * Also creates a demo tutor and bookings so the classroom can be launched.
 *
 * Usage: npx tsx scripts/seed-demo-accounts.ts
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// Simple base64 password hashing (matches auth.ts hashPassword)
function hashPassword(pw: string): string {
  return Buffer.from(`qtuor:${pw}`).toString('base64')
}

async function main() {
  console.log('🌱 Seeding demo accounts (Norani Qaida + Quran)...\n')

  // ── 0. Clean up old demo data ──────────────────────────────────
  console.log('🧹 Cleaning up old demo data...')

  const demoStudent1 = await db.user.findUnique({ where: { email: 'noorani.demo@qtuor.com' } })
  const demoStudent2 = await db.user.findUnique({ where: { email: 'quran.demo@qtuor.com' } })

  for (const student of [demoStudent1, demoStudent2]) {
    if (student) {
      // Delete in order due to foreign keys
      await db.lessonProgress.deleteMany({ where: { studentId: student.id } })
      await db.lessonBookmark.deleteMany({ where: { studentId: student.id } })
      await db.booking.deleteMany({ where: { studentId: student.id } })
      const subs = await db.subscription.findMany({ where: { userId: student.id } })
      for (const sub of subs) {
        await db.walletSplit.deleteMany({ where: { subscriptionId: sub.id } })
        await db.subscription.delete({ where: { id: sub.id } })
      }
    }
  }
  console.log('   ✅ Old demo data cleaned\n')

  // ── 1. Create Plans ──────────────────────────────────────────────
  console.log('📋 Creating plans...')

  // Demo plan that gives access to BOTH Noorani Qaida AND Quran
  const planDemo = await db.plan.upsert({
    where: { id: 'plan-demo-combo' },
    update: {},
    create: {
      id: 'plan-demo-combo',
      name: 'Demo Full Access',
      category: 'General', // "General" unlocks both qaida + quran in classroom
      classesPerMonth: 12,
      monthlyPrice: 49,
      description: 'Demo account — full access to Noorani Qaida & Quran with virtual classroom.',
      features: '3 classes / week (30 min each)\nNoorani Qaida board\nQuran Recitation with Tajweed\nCertified tutor\nAuto-bookmark & resume\nVirtual classroom access',
      popular: false,
      active: true,
    },
  })

  const planNQ = await db.plan.upsert({
    where: { id: 'plan-nq-3' },
    update: {},
    create: {
      id: 'plan-nq-3',
      name: 'Qaida Learner',
      category: 'Noorani Qaida',
      classesPerMonth: 12,
      monthlyPrice: 39,
      description: '3 classes per week — steady progress through Arabic letters & harakat.',
      features: '3 classes / week (30 min each)\nInteractive Noorani Qaida board\nCertified Qaida tutor\nAuto-bookmark & resume\nParent safety snapshots\nHomework worksheets',
      popular: true,
      active: true,
    },
  })

  const planTW = await db.plan.upsert({
    where: { id: 'plan-tw-3' },
    update: {},
    create: {
      id: 'plan-tw-3',
      name: 'Tajweed Builder',
      category: 'Quran Recitation With Tajweed',
      classesPerMonth: 12,
      monthlyPrice: 49,
      description: '3 classes per week — solid Tajweed foundations with regular practice.',
      features: '3 classes / week (30 min each)\nWord-by-word Quran sync\nTajweed color highlighting\nIjaza-certified tutor\nAuto-bookmark & resume\nWeekly progress report',
      popular: true,
      active: true,
    },
  })

  // Also create all other plans for the plans page to render fully
  const allPlans = [
    { id: 'plan-nq-2', name: 'Qaida Starter', category: 'Noorani Qaida', classesPerMonth: 8, monthlyPrice: 29, description: '2 classes per week — ideal for young beginners.', features: '2 classes / week (30 min each)\nInteractive Noorani Qaida board\nCertified Qaida tutor\nAuto-bookmark & resume\nParent safety snapshots', popular: false },
    { id: 'plan-nq-4', name: 'Qaida Accelerator', category: 'Noorani Qaida', classesPerMonth: 16, monthlyPrice: 49, description: '4 classes per week — faster mastery.', features: '4 classes / week (30 min each)\nInteractive Noorani Qaida board\nCertified Qaida tutor\nAuto-bookmark & resume\nParent safety snapshots\nPriority tutor matching', popular: false },
    { id: 'plan-nq-5', name: 'Qaida Intensive', category: 'Noorani Qaida', classesPerMonth: 20, monthlyPrice: 59, description: '5 classes per week — intensive track.', features: '5 classes / week (30 min each)\nInteractive Noorani Qaida board\nSenior certified tutor\nAuto-bookmark & resume\nParent safety snapshots\nCloud session recording', popular: false },
    { id: 'plan-tw-2', name: 'Tajweed Explorer', category: 'Quran Recitation With Tajweed', classesPerMonth: 8, monthlyPrice: 39, description: '2 classes per week — learn at a comfortable pace.', features: '2 classes / week (30 min each)\nWord-by-word Quran sync\nTajweed color highlighting\nIjaza-certified tutor\nAuto-bookmark & resume', popular: false },
    { id: 'plan-tw-4', name: 'Tajweed Pro', category: 'Quran Recitation With Tajweed', classesPerMonth: 16, monthlyPrice: 65, description: '4 classes per week — accelerated mastery.', features: '4 classes / week (30 min each)\nWord-by-word Quran sync\nTajweed color highlighting\nSenior Ijaza-certified tutor\nAuto-bookmark & resume\nPriority scheduling', popular: false },
    { id: 'plan-tw-5', name: 'Tajweed Master', category: 'Quran Recitation With Tajweed', classesPerMonth: 20, monthlyPrice: 79, description: '5 classes per week — immersive training.', features: '5 classes / week (30 min each)\nWord-by-word Quran sync\nTajweed color highlighting\nSenior Ijaza-certified tutor\nAuto-bookmark & resume\nCloud session recording\nIjaza preparation track', popular: false },
    { id: 'plan-hf-2', name: 'Hifz Starter', category: 'Hifz', classesPerMonth: 8, monthlyPrice: 49, description: '2 classes per week — begin your Hifz journey.', features: '2 classes / week (30 min each)\nDedicated Hafiz tutor\nSabaq + Sabaq Para method\nAuto-bookmark & resume\nParent safety snapshots', popular: false },
    { id: 'plan-hf-3', name: 'Hifz Commitment', category: 'Hifz', classesPerMonth: 12, monthlyPrice: 65, description: '3 classes per week — consistent memorization.', features: '3 classes / week (30 min each)\nDedicated Hafiz tutor\nSabaq + Sabaq Para + Ammukhta\nAuto-bookmark & resume\nParent safety snapshots\nMemorization progress tracker', popular: true },
    { id: 'plan-hf-4', name: 'Hifz Accelerator', category: 'Hifz', classesPerMonth: 16, monthlyPrice: 85, description: '4 classes per week — fast-track your Hifz.', features: '4 classes / week (30 min each)\nSenior Hafiz tutor\nSabaq + Sabaq Para + Ammukhta\nAuto-bookmark & resume\nParent safety snapshots\nMemorization progress tracker\nPriority scheduling', popular: false },
    { id: 'plan-hf-5', name: 'Hifz Intensive', category: 'Hifz', classesPerMonth: 20, monthlyPrice: 99, description: '5 classes per week — full-immersion Hifz.', features: '5 classes / week (30 min each)\nSenior Hafiz tutor\nSabaq + Sabaq Para + Ammukhta\nAuto-bookmark & resume\nParent safety snapshots\nMemorization progress tracker\nCloud session recording\nIjaza preparation track', popular: false },
  ]

  for (const p of allPlans) {
    await db.plan.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, active: true, features: p.features },
    })
  }
  console.log(`   ✅ ${3 + allPlans.length} plans ready\n`)

  // ── 2. Create Demo Tutor ─────────────────────────────────────────
  console.log('👨‍🏫 Creating demo tutor...')

  const tutorUser = await db.user.upsert({
    where: { email: 'tutor.demo@qtuor.com' },
    update: {},
    create: {
      email: 'tutor.demo@qtuor.com',
      name: 'Qari Ahmad Raza',
      password: hashPassword('tutor123'),
      role: 'TUTOR',
      country: 'Pakistan',
      phone: '+923001234567',
    },
  })

  const tutorProfile = await db.tutorProfile.upsert({
    where: { userId: tutorUser.id },
    update: {},
    create: {
      userId: tutorUser.id,
      bio: 'Expert Hafiz tutor with over 20 years of experience. Specializes in Noorani Qaida, Tajweed, and Hifz. Uses proven Sabaq methodology with personalized revision plans.',
      perClassRate: 6,
      rating: 5.0,
      reviewCount: 178,
      studentCount: 50,
      lessonsCount: 3000,
      verified: true,
      nativeArabic: false,
      hafiz: true,
      ijazaCertified: true,
      specialties: 'Noorani Qaida,Quran Recitation With Tajweed,Hifz',
      languages: 'Arabic,English,Urdu',
      experienceYears: 20,
      status: 'APPROVED',
      registrationFeePaid: true,
    },
  })

  // Create wallet for tutor
  await db.wallet.upsert({
    where: { tutorId: tutorUser.id },
    update: {},
    create: { tutorId: tutorUser.id, balance: 0, escrowHeld: 0, totalEarned: 0, platformRevenue: 0 },
  })

  // Create availability for tutor (Mon-Sat, 8am-8pm PKT)
  for (let day = 1; day <= 6; day++) {
    await db.availability.upsert({
      where: { id: `avail-${tutorUser.id}-${day}` },
      update: {},
      create: {
        id: `avail-${tutorUser.id}-${day}`,
        tutorId: tutorUser.id,
        dayOfWeek: day,
        slots: JSON.stringify([['08:00', '12:00'], ['14:00', '20:00']]),
      },
    })
  }
  console.log('   ✅ Qari Ahmad Raza — tutor.demo@qtuor.com / tutor123\n')

  // ── 3. Demo Account 1: Noorani Qaida + Quran ────────────────────
  console.log('🎓 Creating Demo Account 1: Noorani Qaida + Quran...')

  const student1 = await db.user.upsert({
    where: { email: 'noorani.demo@qtuor.com' },
    update: { name: 'Fatima Noor', password: hashPassword('demo1234'), role: 'STUDENT', country: 'Pakistan', gender: 'female', age: 12, guardianName: 'Ali Noor (Father)', preferredLanguage: 'Urdu', learningGoals: 'Complete Noorani Qaida and start reading the Quran fluently' },
    create: {
      email: 'noorani.demo@qtuor.com',
      name: 'Fatima Noor',
      password: hashPassword('demo1234'),
      role: 'STUDENT',
      country: 'Pakistan',
      gender: 'female',
      age: 12,
      guardianName: 'Ali Noor (Father)',
      preferredLanguage: 'Urdu',
      learningGoals: 'Complete Noorani Qaida and start reading the Quran fluently',
    },
  })

  // Active subscription with General plan → unlocks BOTH qaida + quran
  const sub1 = await db.subscription.create({
    data: {
      userId: student1.id,
      planId: planDemo.id,
      status: 'ACTIVE',
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  // Booking 1: Noorani Qaida class — scheduled NOW
  const now1 = new Date()
  now1.setMinutes(now1.getMinutes() + 2) // 2 minutes from now

  const booking1 = await db.booking.create({
    data: {
      studentId: student1.id,
      tutorId: tutorUser.id,
      scheduledAt: now1,
      durationMins: 30,
      status: 'SCHEDULED',
      topic: 'Noorani Qaida — Lesson 5: Harakat (Fatha, Kasra, Damma)',
      meetingId: `demo-nq-${student1.id.slice(-6)}`,
    },
  })

  // Booking 2: Quran class — scheduled 1 hour from now
  const later1 = new Date()
  later1.setMinutes(later1.getMinutes() + 62)

  const booking1b = await db.booking.create({
    data: {
      studentId: student1.id,
      tutorId: tutorUser.id,
      scheduledAt: later1,
      durationMins: 30,
      status: 'SCHEDULED',
      topic: 'Quran Recitation — Surah Al-Fatihah Tajweed Practice',
      meetingId: `demo-qr-${student1.id.slice(-6)}`,
    },
  })

  // Lesson bookmark for Qaida
  await db.lessonBookmark.upsert({
    where: { studentId_tutorId: { studentId: student1.id, tutorId: tutorUser.id } },
    update: { bookType: 'qaida', pageId: 1005, pageLabel: 'Lesson 5: Harakat (Fatha, Kasra, Damma)', lastLineIndex: 3, status: 'IN_PROGRESS' },
    create: {
      studentId: student1.id,
      tutorId: tutorUser.id,
      bookType: 'qaida',
      pageId: 1005,
      pageLabel: 'Lesson 5: Harakat (Fatha, Kasra, Damma)',
      lastLineIndex: 3,
      status: 'IN_PROGRESS',
    },
  })

  // Lesson progress for Noorani Qaida
  await db.lessonProgress.create({
    data: {
      studentId: student1.id,
      tutorId: tutorUser.id,
      subject: 'Noorani Qaida',
      lessonTitle: 'Lesson 5: Harakat',
      completed: false,
      progressPct: 35,
    },
  })

  // Lesson progress for Quran
  await db.lessonProgress.create({
    data: {
      studentId: student1.id,
      tutorId: tutorUser.id,
      subject: 'Quran Recitation With Tajweed',
      lessonTitle: 'Surah Al-Fatihah',
      completed: false,
      progressPct: 15,
    },
  })

  console.log('   ✅ noorani.demo@qtuor.com / demo1234')
  console.log(`   📖 Plan: ${planDemo.name} (General — Qaida + Quran) — $${planDemo.monthlyPrice}/mo`)
  console.log(`   📅 Booking 1: Noorani Qaida Lesson 5 (NOW)`)
  console.log(`   📅 Booking 2: Quran Al-Fatihah Tajweed (1hr from now)\n`)

  // ── 4. Demo Account 2: Quran + Noorani Qaida ────────────────────
  console.log('🎓 Creating Demo Account 2: Quran + Noorani Qaida...')

  const student2 = await db.user.upsert({
    where: { email: 'quran.demo@qtuor.com' },
    update: { name: 'Ahmed Khan', password: hashPassword('demo1234'), role: 'STUDENT', country: 'United Kingdom', gender: 'male', age: 28, preferredLanguage: 'English', learningGoals: 'Improve Tajweed and learn Noorani Qaida basics' },
    create: {
      email: 'quran.demo@qtuor.com',
      name: 'Ahmed Khan',
      password: hashPassword('demo1234'),
      role: 'STUDENT',
      country: 'United Kingdom',
      gender: 'male',
      age: 28,
      preferredLanguage: 'English',
      learningGoals: 'Improve Tajweed and learn Noorani Qaida basics',
    },
  })

  // Active subscription with General plan → unlocks BOTH qaida + quran
  const sub2 = await db.subscription.create({
    data: {
      userId: student2.id,
      planId: planDemo.id,
      status: 'ACTIVE',
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  // Booking 1: Quran class — scheduled NOW
  const now2 = new Date()
  now2.setMinutes(now2.getMinutes() + 2)

  const booking2 = await db.booking.create({
    data: {
      studentId: student2.id,
      tutorId: tutorUser.id,
      scheduledAt: now2,
      durationMins: 30,
      status: 'SCHEDULED',
      topic: 'Quran Recitation — Surah Al-Baqarah (Ayah 142-152) Tajweed Focus',
      meetingId: `demo-qr2-${student2.id.slice(-6)}`,
    },
  })

  // Booking 2: Noorani Qaida class — scheduled 1 hour from now
  const later2 = new Date()
  later2.setMinutes(later2.getMinutes() + 62)

  const booking2b = await db.booking.create({
    data: {
      studentId: student2.id,
      tutorId: tutorUser.id,
      scheduledAt: later2,
      durationMins: 30,
      status: 'SCHEDULED',
      topic: 'Noorani Qaida — Lesson 8: Madd (Stretching Rules)',
      meetingId: `demo-nq2-${student2.id.slice(-6)}`,
    },
  })

  // Lesson bookmark for Quran
  await db.lessonBookmark.upsert({
    where: { studentId_tutorId: { studentId: student2.id, tutorId: tutorUser.id } },
    update: { bookType: 'quran', pageId: 10002, pageLabel: 'Surah Al-Baqarah — Ayah 142-152', lastLineIndex: 7, status: 'IN_PROGRESS' },
    create: {
      studentId: student2.id,
      tutorId: tutorUser.id,
      bookType: 'quran',
      pageId: 10002,
      pageLabel: 'Surah Al-Baqarah — Ayah 142-152',
      lastLineIndex: 7,
      status: 'IN_PROGRESS',
    },
  })

  // Lesson progress for Quran
  await db.lessonProgress.create({
    data: {
      studentId: student2.id,
      tutorId: tutorUser.id,
      subject: 'Quran Recitation With Tajweed',
      lessonTitle: 'Surah Al-Baqarah Ayah 142-152',
      completed: false,
      progressPct: 20,
    },
  })

  // Lesson progress for Noorani Qaida
  await db.lessonProgress.create({
    data: {
      studentId: student2.id,
      tutorId: tutorUser.id,
      subject: 'Noorani Qaida',
      lessonTitle: 'Lesson 8: Madd Rules',
      completed: false,
      progressPct: 55,
    },
  })

  console.log('   ✅ quran.demo@qtuor.com / demo1234')
  console.log(`   📖 Plan: ${planDemo.name} (General — Qaida + Quran) — $${planDemo.monthlyPrice}/mo`)
  console.log(`   📅 Booking 1: Quran Al-Baqarah Tajweed (NOW)`)
  console.log(`   📅 Booking 2: Noorani Qaida Lesson 8 (1hr from now)\n`)

  // ── 5. Summary ───────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════')
  console.log('✅ Demo accounts created successfully!')
  console.log('═══════════════════════════════════════════════════\n')
  console.log('🔐 LOGIN CREDENTIALS:\n')
  console.log('┌──────────────────────────────────────────────────────┐')
  console.log('│ Account 1: Noorani Qaida + Quran                     │')
  console.log('│   Email:    noorani.demo@qtuor.com                    │')
  console.log('│   Password: demo1234                                  │')
  console.log('│   Plan:     Demo Full Access (Qaida + Quran)          │')
  console.log('│   Classroom: Noorani Qaida Lesson 5 + Quran           │')
  console.log('├──────────────────────────────────────────────────────┤')
  console.log('│ Account 2: Quran + Noorani Qaida                     │')
  console.log('│   Email:    quran.demo@qtuor.com                      │')
  console.log('│   Password: demo1234                                  │')
  console.log('│   Plan:     Demo Full Access (Qaida + Quran)          │')
  console.log('│   Classroom: Quran Al-Baqarah + Noorani Qaida         │')
  console.log('├──────────────────────────────────────────────────────┤')
  console.log('│ Tutor Account (for classroom testing)                 │')
  console.log('│   Email:    tutor.demo@qtuor.com                      │')
  console.log('│   Password: tutor123                                  │')
  console.log('└──────────────────────────────────────────────────────┘\n')
  console.log('💡 Both accounts have access to BOTH Noorani Qaida AND Quran in the virtual classroom.\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })

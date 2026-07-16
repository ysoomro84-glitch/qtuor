/**
 * Seed script: Creates 2 demo student accounts with active subscriptions
 * for testing the virtual classroom.
 *
 * Demo 1: Noorani Qaida student
 * Demo 2: Quran Recitation (Tajweed) student
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
  console.log('🌱 Seeding demo accounts...\n')

  // ── 1. Create Plans ──────────────────────────────────────────────
  console.log('📋 Creating plans...')

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
  console.log(`   ✅ ${2 + allPlans.length} plans ready\n`)

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

  // ── 3. Demo Account 1: Noorani Qaida Student ─────────────────────
  console.log('🎓 Creating Demo Account 1: Noorani Qaida...')

  const student1 = await db.user.upsert({
    where: { email: 'noorani.demo@qtuor.com' },
    update: {},
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

  // Active subscription for Noorani Qaida plan
  const sub1 = await db.subscription.create({
    data: {
      userId: student1.id,
      planId: planNQ.id,
      status: 'ACTIVE',
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  })

  // Create a booking so the classroom can be launched — scheduled for RIGHT NOW
  const now1 = new Date()
  now1.setMinutes(now1.getMinutes() + 2) // 2 minutes from now so it's "upcoming"

  const booking1 = await db.booking.create({
    data: {
      studentId: student1.id,
      tutorId: tutorUser.id,
      scheduledAt: now1,
      durationMins: 30,
      status: 'SCHEDULED',
      topic: 'Noorani Qaida — Lesson 5: Harakat (Fatha, Kasra, Damma)',
    },
  })

  // Create a lesson bookmark so the classroom resumes correctly
  await db.lessonBookmark.upsert({
    where: { studentId_tutorId: { studentId: student1.id, tutorId: tutorUser.id } },
    update: {},
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

  // Lesson progress
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

  console.log('   ✅ noorani.demo@qtuor.com / demo1234')
  console.log(`   📖 Plan: ${planNQ.name} (${planNQ.category}) — $${planNQ.monthlyPrice}/mo`)
  console.log(`   📅 Booking: RIGHT NOW — Noorani Qaida Lesson 5\n`)

  // ── 4. Demo Account 2: Quran Recitation Student ──────────────────
  console.log('🎓 Creating Demo Account 2: Quran (Tajweed)...')

  const student2 = await db.user.upsert({
    where: { email: 'quran.demo@qtuor.com' },
    update: {},
    create: {
      email: 'quran.demo@qtuor.com',
      name: 'Ahmed Khan',
      password: hashPassword('demo1234'),
      role: 'STUDENT',
      country: 'United Kingdom',
      gender: 'male',
      age: 28,
      preferredLanguage: 'English',
      learningGoals: 'Improve Tajweed and work toward Ijaza certification in Hafs',
    },
  })

  // Active subscription for Quran Tajweed plan
  const sub2 = await db.subscription.create({
    data: {
      userId: student2.id,
      planId: planTW.id,
      status: 'ACTIVE',
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  // Create a booking for Quran class — scheduled for RIGHT NOW
  const now2 = new Date()
  now2.setMinutes(now2.getMinutes() + 2) // 2 minutes from now

  const booking2 = await db.booking.create({
    data: {
      studentId: student2.id,
      tutorId: tutorUser.id,
      scheduledAt: now2,
      durationMins: 30,
      status: 'SCHEDULED',
      topic: 'Quran Recitation — Surah Al-Baqarah (Ayah 142-152) Tajweed Focus',
    },
  })

  // Create a lesson bookmark for Quran
  await db.lessonBookmark.upsert({
    where: { studentId_tutorId: { studentId: student2.id, tutorId: tutorUser.id } },
    update: {},
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

  // Lesson progress
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

  console.log('   ✅ quran.demo@qtuor.com / demo1234')
  console.log(`   📖 Plan: ${planTW.name} (${planTW.category}) — $${planTW.monthlyPrice}/mo`)
  console.log(`   📅 Booking: RIGHT NOW — Surah Al-Baqarah Tajweed\n`)

  // ── 5. Summary ───────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════')
  console.log('✅ Demo accounts created successfully!')
  console.log('═══════════════════════════════════════════════════\n')
  console.log('🔐 LOGIN CREDENTIALS:\n')
  console.log('┌─────────────────────────────────────────────────┐')
  console.log('│ Account 1: Noorani Qaida                        │')
  console.log('│   Email:    noorani.demo@qtuor.com               │')
  console.log('│   Password: demo1234                             │')
  console.log('│   Plan:     Qaida Learner (3x/week)              │')
  console.log('├─────────────────────────────────────────────────┤')
  console.log('│ Account 2: Quran Recitation                      │')
  console.log('│   Email:    quran.demo@qtuor.com                 │')
  console.log('│   Password: demo1234                             │')
  console.log('│   Plan:     Tajweed Builder (3x/week)            │')
  console.log('├─────────────────────────────────────────────────┤')
  console.log('│ Tutor Account (for classroom testing)            │')
  console.log('│   Email:    tutor.demo@qtuor.com                 │')
  console.log('│   Password: tutor123                             │')
  console.log('└─────────────────────────────────────────────────┘\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })

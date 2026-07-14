import { db } from '../src/lib/db'

// Match the obfuscation in src/lib/auth.ts (demo only)
function hashPassword(pw: string) {
  return Buffer.from(`qtuor:${pw}`).toString('base64')
}

async function main() {
  console.log('🌱 Seeding Qtuor database...')

  // Clean
  await db.classroomSession.deleteMany()
  await db.lessonProgress.deleteMany()
  await db.withdrawal.deleteMany()
  await db.wallet.deleteMany()
  await db.review.deleteMany()
  await db.availability.deleteMany()
  await db.booking.deleteMany()
  await db.subscription.deleteMany()
  await db.plan.deleteMany()
  await db.tutorProfile.deleteMany()
  await db.user.deleteMany()

  // ---- Admin ----
  const admin = await db.user.create({
    data: {
      email: 'admin@qtuor.com',
      name: 'Qtuor Admin',
      password: hashPassword('admin123'),
      role: 'ADMIN',
      country: 'Global',
    },
  })

  // ---- Plans (Monthly subscription — 3 subjects × 4 class frequencies = 12 plans) ----
  // Pricing uses bulk discount: per-class cost decreases with more classes/week.
  const planSpecs = [
    // Noorani Qaida (entry-level)
    { cat: 'Noorani Qaida', classesPerWeek: 2, classesPerMonth: 8,  price: 15, popular: false },
    { cat: 'Noorani Qaida', classesPerWeek: 3, classesPerMonth: 12, price: 21, popular: false },
    { cat: 'Noorani Qaida', classesPerWeek: 4, classesPerMonth: 16, price: 27, popular: true  },
    { cat: 'Noorani Qaida', classesPerWeek: 5, classesPerMonth: 20, price: 33, popular: false },
    // Quran Recitation With Tajweed (intermediate)
    { cat: 'Quran Recitation With Tajweed', classesPerWeek: 2, classesPerMonth: 8,  price: 19, popular: false },
    { cat: 'Quran Recitation With Tajweed', classesPerWeek: 3, classesPerMonth: 12, price: 26, popular: false },
    { cat: 'Quran Recitation With Tajweed', classesPerWeek: 4, classesPerMonth: 16, price: 33, popular: true  },
    { cat: 'Quran Recitation With Tajweed', classesPerWeek: 5, classesPerMonth: 20, price: 39, popular: false },
    // Hifz (premium/intensive)
    { cat: 'Hifz', classesPerWeek: 2, classesPerMonth: 8,  price: 25, popular: false },
    { cat: 'Hifz', classesPerWeek: 3, classesPerMonth: 12, price: 34, popular: false },
    { cat: 'Hifz', classesPerWeek: 4, classesPerMonth: 16, price: 42, popular: true  },
    { cat: 'Hifz', classesPerWeek: 5, classesPerMonth: 20, price: 49, popular: false },
  ]
  const plans = await Promise.all(
    planSpecs.map((s) =>
      db.plan.create({
        data: {
          name: `${s.classesPerWeek} Classes / Week`,
          category: s.cat,
          classesPerMonth: s.classesPerMonth,
          monthlyPrice: s.price,
          description: `${s.cat} — ${s.classesPerWeek} classes per week (${s.classesPerMonth} per month). ${s.cat === 'Hifz' ? 'Dedicated memorization program with a Hafiz tutor.' : s.cat === 'Quran Recitation With Tajweed' ? 'Master the rules of beautiful Quran recitation.' : 'Build a strong foundation from the very first Arabic letter.'}`,
          features: `${s.classesPerMonth} live classes per month (${s.classesPerWeek} per week)\n${s.cat === 'Hifz' ? 'Dedicated Hafiz tutor with Ijaza' : '1-on-1 with a certified tutor'}\n${s.cat} specialization\nAccess to digital Quran viewer\nClass recordings (30 days)\nProgress tracking\nFree 30-min trial class`,
          popular: s.popular,
          active: true,
        },
      })
    )
  )

  // ---- Tutors ----
  const tutorData = [
    {
      name: 'Sheikh Abdullah Al-Rashid',
      email: 'abdullah@qtuor.com',
      country: 'Egypt',
      bio: 'Hafiz of the Quran with Ijaza in the 10 recitations. 12+ years teaching Tajweed to students worldwide. Gentle, structured, and patient.',
      specialties: 'Quran Recitation With Tajweed,Hifz,Noorani Qaida',
      languages: 'Arabic,English',
      perClassRate: 9,
      nativeArabic: true,
      hafiz: true,
      ijazaCertified: true,
      experienceYears: 12,
      rating: 4.9,
      reviewCount: 214,
      studentCount: 387,
      lessonsCount: 5400,
      audioIntroText: 'Assalamu alaikum, I am Sheikh Abdullah. I specialize in Tajweed and Hifz, and I would be honored to guide you on your journey with the Quran.',
    },
    {
      name: 'Ustadha Maryam Hassan',
      email: 'maryam@qtuor.com',
      country: 'Jordan',
      bio: 'Female Quran teacher certified in Tajweed. Specializes in teaching children and sisters with a warm, encouraging approach.',
      specialties: 'Noorani Qaida,Quran Recitation With Tajweed,Arabic Language',
      languages: 'Arabic,English',
      perClassRate: 8,
      nativeArabic: true,
      hafiz: true,
      ijazaCertified: true,
      experienceYears: 8,
      rating: 5.0,
      reviewCount: 178,
      studentCount: 256,
      lessonsCount: 3100,
      audioIntroText: 'Assalamu alaikum dear sisters and parents. I am Ustadha Maryam. I love teaching Noorani Qaida and Tajweed to beginners and children.',
    },
    {
      name: 'Sheikh Yusuf Ibrahim',
      email: 'yusuf@qtuor.com',
      country: 'Saudi Arabia',
      bio: 'Imam and graduate of Umm Al-Qura University. Expert in Hifz, Tafsir, and advanced Tajweed rules. Native Arabic speaker.',
      specialties: 'Hifz,Quran Recitation With Tajweed,Tafsir',
      languages: 'Arabic,English',
      perClassRate: 11,
      nativeArabic: true,
      hafiz: true,
      ijazaCertified: true,
      experienceYears: 15,
      rating: 4.9,
      reviewCount: 302,
      studentCount: 512,
      lessonsCount: 8200,
      audioIntroText: 'Assalamu alaikum. I am Sheikh Yusuf. With 15 years of experience, I help students memorize the Quran with perfect Tajweed.',
    },
    {
      name: 'Ustadh Omar Khan',
      email: 'omar@qtuor.com',
      country: 'Pakistan',
      bio: 'Fluent in Urdu, English and Arabic. Specializes in teaching South Asian students. Patient and methodical teaching style.',
      specialties: 'Noorani Qaida,Quran Recitation With Tajweed,Hifz',
      languages: 'Arabic,English,Urdu',
      perClassRate: 6,
      nativeArabic: false,
      hafiz: true,
      ijazaCertified: true,
      experienceYears: 10,
      rating: 4.8,
      reviewCount: 156,
      studentCount: 220,
      lessonsCount: 2800,
      audioIntroText: 'Assalamu alaikum. I am Ustadh Omar. I teach in Urdu and English, helping students master Qaida and Tajweed step by step.',
    },
    {
      name: 'Ustadha Fatima Al-Zahra',
      email: 'fatima@qtuor.com',
      country: 'Morocco',
      bio: 'Female tutor with expertise in Arabic language and Quranic sciences. Warm and engaging teaching style for all ages.',
      specialties: 'Arabic Language,Quran Recitation With Tajweed,Noorani Qaida',
      languages: 'Arabic,English,French',
      perClassRate: 7,
      nativeArabic: true,
      hafiz: true,
      ijazaCertified: false,
      experienceYears: 6,
      rating: 4.9,
      reviewCount: 98,
      studentCount: 142,
      lessonsCount: 1650,
      audioIntroText: 'Assalamu alaikum. I am Ustadha Fatima. I teach Arabic language and Tajweed, making learning joyful and effective.',
    },
    {
      name: 'Sheikh Bilal Ahmed',
      email: 'bilal@qtuor.com',
      country: 'Turkey',
      bio: 'Quran memorizer and Tajweed expert. Teaches in English, Turkish and Arabic. Known for his engaging online classes.',
      specialties: 'Hifz,Quran Recitation With Tajweed,Islamic Studies',
      languages: 'Arabic,English,Turkish',
      perClassRate: 8,
      nativeArabic: false,
      hafiz: true,
      ijazaCertified: true,
      experienceYears: 9,
      rating: 4.7,
      reviewCount: 134,
      studentCount: 198,
      lessonsCount: 2400,
      audioIntroText: 'Assalamu alaikum. I am Sheikh Bilal. Join my classes to memorize the Quran and understand Islamic studies deeply.',
    },
  ]

  for (const t of tutorData) {
    const user = await db.user.create({
      data: {
        email: t.email,
        name: t.name,
        password: hashPassword('tutor123'),
        role: 'TUTOR',
        country: t.country,
        gender: t.name.startsWith('Ustadha') || t.name.startsWith('Sheikha') ? 'female' : 'male',
      },
    })
    const profile = await db.tutorProfile.create({
      data: {
        userId: user.id,
        bio: t.bio,
        specialties: t.specialties,
        languages: t.languages,
        perClassRate: t.perClassRate,
        nativeArabic: t.nativeArabic,
        hafiz: t.hafiz,
        ijazaCertified: t.ijazaCertified,
        experienceYears: t.experienceYears,
        rating: t.rating,
        reviewCount: t.reviewCount,
        studentCount: t.studentCount,
        lessonsCount: t.lessonsCount,
        verified: true,
        status: 'APPROVED',
        audioIntroText: t.audioIntroText,
      },
    })
    await db.wallet.create({
      data: { tutorId: user.id, balance: Math.round(t.perClassRate * 20), totalEarned: Math.round(t.perClassRate * 120) },
    })

    // Availability: weekdays evenings + weekend mornings
    const days = [0, 1, 2, 3, 4, 5, 6]
    for (const day of days) {
      const slots = day === 5 || day === 6
        ? JSON.stringify([['08:00', '10:00'], ['10:00', '12:00'], ['14:00', '16:00']])
        : JSON.stringify([['16:00', '18:00'], ['18:00', '20:00'], ['20:00', '22:00']])
      await db.availability.create({ data: { tutorId: user.id, dayOfWeek: day, slots } })
    }
  }

  // ---- Demo student ----
  const student = await db.user.create({
    data: {
      email: 'student@qtuor.com',
      name: 'Ahmed Student',
      password: hashPassword('student123'),
      role: 'STUDENT',
      country: 'United Kingdom',
    },
  })
  await db.subscription.create({
    data: {
      userId: student.id,
      planId: plans[6].id,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
    },
  })

  // Lesson progress
  await db.lessonProgress.createMany({
    data: [
      { studentId: student.id, subject: 'Noorani Qaida', lessonTitle: 'Lesson 1: Arabic Alphabet', completed: true, progressPct: 100 },
      { studentId: student.id, subject: 'Noorani Qaida', lessonTitle: 'Lesson 2: Joining Letters', completed: true, progressPct: 100 },
      { studentId: student.id, subject: 'Noorani Qaida', lessonTitle: 'Lesson 3: Harakat (Vowels)', completed: true, progressPct: 100 },
      { studentId: student.id, subject: 'Noorani Qaida', lessonTitle: 'Lesson 4: Sukun & Shadda', completed: false, progressPct: 60 },
      { studentId: student.id, subject: 'Tajweed', lessonTitle: 'Rules of Noon Saakin', completed: true, progressPct: 100 },
      { studentId: student.id, subject: 'Tajweed', lessonTitle: 'Rules of Meem Saakin', completed: false, progressPct: 40 },
      { studentId: student.id, subject: 'Hifz', lessonTitle: 'Surah Al-Fatihah', completed: true, progressPct: 100, surahName: 'Al-Fatihah' },
      { studentId: student.id, subject: 'Hifz', lessonTitle: 'Surah An-Nas', completed: true, progressPct: 100, surahName: 'An-Nas' },
      { studentId: student.id, subject: 'Hifz', lessonTitle: 'Surah Al-Falaq', completed: false, progressPct: 75, surahName: 'Al-Falaq' },
    ],
  })

  // A sample upcoming booking
  const tutorUser = await db.user.findFirst({ where: { role: 'TUTOR' } })
  if (tutorUser) {
    await db.booking.create({
      data: {
        studentId: student.id,
        tutorId: tutorUser.id,
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        durationMins: 30,
        status: 'SCHEDULED',
        topic: 'Tajweed — Rules of Meem Saakin',
        meetingId: 'qtuor-' + Math.random().toString(36).slice(2, 8),
      },
    })
  }

  console.log('✅ Seed complete!')
  console.log('   Admin:    admin@qtuor.com / admin123')
  console.log('   Student:  student@qtuor.com / student123')
  console.log('   Tutors:   <name>@qtuor.com / tutor123')
  console.log(`   Plans:    ${plans.length} created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })

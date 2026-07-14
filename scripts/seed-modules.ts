/**
 * Seed: Blog posts + default PaymentGateway records for the Master Admin modules.
 * Run once after schema push. Idempotent (skips if data already exists).
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

const SEED_POSTS = [
  {
    title: '5 Essential Tajweed Rules Every Beginner Must Master',
    category: 'Tajweed Tips',
    excerpt: 'Understanding the foundations of Tajweed transforms your recitation. Here are the five rules every new student should focus on first.',
    content: `<h2>Introduction</h2><p>Tajweed is the science of reciting the Quran correctly, preserving the beauty and precision of the divine revelation. For beginners, the journey can feel overwhelming, but mastering a few foundational rules will dramatically improve your recitation.</p><h2>1. Noon Sakinah and Tanween Rules</h2><p>The rules of Noon Sakinah (the letter Noon with a sukun) and Tanween (double vowel marks) — Izhar, Idgham, Iqlab, and Ikhfa — are the cornerstone of proper recitation. Each rule dictates how the sound blends or separates based on the letter that follows.</p><h2>2. Meem Sakinah Rules</h2><p>Similar to Noon Sakinah but involving the letter Meem, these rules cover Idgham Shafawi, Ikhfa Shafawi, and Izhar Shafawi. They ensure clarity between words.</p><h2>3. Madd (Elongation) Rules</h2><p>Madd refers to the elongation of vowel sounds. Understanding the difference between Madd Tabi'i (natural), Madd Munfasil, and Madd Muttasil is essential for rhythmic recitation.</p><h2>4. Qalqalah (Echo Sound)</h2><p>The Qalqalah letters — ق ط ب ج د — produce a bouncing echo when they have a sukun. Mastering this adds a beautiful rhythm to your recitation.</p><h2>5. Makharij (Points of Articulation)</h2><p>Knowing where each Arabic letter originates — throat, tongue, lips, or nasal cavity — is the foundation of correct pronunciation. A qualified tutor can help you refine these.</p><h2>Conclusion</h2><p>These five rules form the bedrock of Tajweed. Working with a certified tutor, even for just 30 minutes a week, accelerates your progress enormously. Start your journey on Qtuor today.</p>`,
    featuredImage: '/subjects/quran-recitation.png',
    readingTime: 6,
    tags: 'tajweed,beginners,quran,recitation',
  },
  {
    title: "A Parent's Guide to Starting Your Child's Quran Journey",
    category: 'Parent Guides',
    excerpt: 'How to introduce Quran learning to children with patience, consistency, and joy. Practical tips for parents of young learners.',
    content: `<h2>Introduction</h2><p>As a parent, introducing your child to the Quran is one of the most meaningful gifts you can give. But how do you make it engaging, consistent, and joyful? This guide walks you through the essentials.</p><h2>Start with Noorani Qaida</h2><p>Noorani Qaida is the traditional primer that teaches Arabic letters and their sounds step by step. It builds the foundation for all future recitation. Children as young as 4 or 5 can begin with short, playful sessions.</p><h2>Keep Sessions Short and Consistent</h2><p>For young children, 15–20 minutes of focused practice daily is far more effective than one long weekly session. Consistency builds habit and retention.</p><h2>Choose the Right Tutor</h2><p>A patient, child-friendly tutor makes all the difference. Look for tutors experienced with children who use interactive methods — reward charts, games, and positive reinforcement. Qtuor lets you filter tutors by "Child-friendly" teaching style.</p><h2>Create a Sacred Routine</h2><p>Designate a quiet, clean space and a regular time — perhaps after Fajr or before bed. This signals to the child that Quran time is special.</p><h2>Conclusion</h2><p>Your child's Quran journey is a marathon, not a sprint. With the right tutor, a consistent routine, and lots of encouragement, they will develop a lifelong bond with the Book of Allah.</p>`,
    featuredImage: '/subjects/noorani-qaida.png',
    readingTime: 5,
    tags: 'parents,children,noorani-qaida,learning',
  },
  {
    title: 'Understanding Hifz: A Roadmap to Memorizing the Quran',
    category: 'Hifz',
    excerpt: 'Memorizing the Quran is a noble ambition. Here is a structured roadmap covering technique, revision, and the mindset needed to succeed.',
    content: `<h2>Introduction</h2><p>Hifz — memorizing the entire Quran — is a journey of years. It requires discipline, a systematic method, and most importantly, sincerity. This roadmap breaks down the process.</p><h2>1. Perfect Your Recitation First</h2><p>Before memorizing, ensure you can recite with correct Tajweed. Memorizing mistakes is far harder to undo than learning correctly the first time.</p><h2>2. The Sabaq Method (New Lesson)</h2><p>Begin with a small, manageable portion — 3 to 5 lines daily. Read it to your tutor, repeat throughout the day during prayers and downtime, until it flows effortlessly.</p><h2>3. The Sabaq Para (Recent Revision)</h2><p>Daily, revise the last 7 days of new memorization. This keeps recent pages fresh and catches errors early.</p><h2>4. The Ammukhta (Old Revision)</h2><p>Rotate through older sections weekly. A common rule: the older the portion, the less frequent the revision, but never skip it entirely.</p><h2>5. Consistency Over Speed</h2><p>It is better to memorize 3 lines every single day than 20 lines once a week. The brain consolidates memory through daily repetition.</p><h2>Conclusion</h2><p>Hifz is a spiritual commitment as much as an intellectual one. With a dedicated Hafiz tutor guiding your child or yourself, the journey becomes structured and achievable.</p>`,
    featuredImage: '/subjects/hifz.png',
    readingTime: 7,
    tags: 'hifz,memorization,quran,revision',
  },
  {
    title: 'Arabic Grammar Essentials: Understanding the Basics of Nahw',
    category: 'Arabic Grammar',
    excerpt: 'A gentle introduction to Arabic grammar (Nahw) for Quran students. Learn how sentence structure reveals meaning in the Quran.',
    content: `<h2>Introduction</h2><p>Arabic grammar — Nahw — is the key that unlocks deeper understanding of the Quran. While you can recite beautifully without it, grasping the basics transforms reading into comprehension.</p><h2>The Three Cases: Rafa, Nasb, Jarr</h2><p>Every Arabic noun takes one of three case endings based on its role: Rafa (subject), Nasb (object), or Jarr (after prepositions). These endings, marked by harakat, tell you who is doing what.</p><h2>Sentence Types</h2><p>Arabic has two sentence types: nominal (starting with a noun) and verbal (starting with a verb). Recognizing the difference helps you parse meaning quickly.</p><h2>The Value of I'rab</h2><p>I'rab — grammatical analysis — shows how each word functions. Even basic I'rab of short surahs builds an intuitive feel for the language.</p><h2>Conclusion</h2><p>You don't need to become a grammarian to benefit. Even a basic grasp of Nahw enriches your connection with the Quran. Start with a tutor who can explain concepts in your language.</p>`,
    featuredImage: '/subjects/arabic-language.png',
    readingTime: 6,
    tags: 'arabic,grammar,nahw,language',
  },
  {
    title: 'The Spiritual and Scientific Benefits of Daily Quran Recitation',
    category: 'Islamic Education',
    excerpt: 'Reciting the Quran daily brings tranquility to the heart and mind. Explore both the spiritual rewards and the documented psychological benefits.',
    content: `<h2>Introduction</h2><p>The Quran describes itself as "a healing and a mercy for the believers." Beyond the spiritual reward, modern research confirms what Muslims have always felt: regular Quran recitation calms the mind.</p><h2>Spiritual Rewards</h2><p>The Prophet (peace be upon him) said that for every letter recited, a good deed is recorded. Daily recitation keeps the heart connected to Allah and softens it against the noise of dunya.</p><h2>Psychological Calm</h2><p>Studies show that rhythmic recitation of the Quran lowers cortisol, reduces anxiety, and promotes a meditative state. The measured breathing required mirrors mindfulness techniques.</p><h2>Building a Habit</h2><p>Start small — even a few verses after each prayer. Pair it with a fixed time and place. Over weeks, it becomes as natural as brushing your teeth.</p><h2>Conclusion</h2><p>The Quran is a companion for this life and the next. Make recitation a daily anchor, and watch how it transforms your days.</p>`,
    featuredImage: '/subjects/islamic-studies.png',
    readingTime: 5,
    tags: 'spirituality,daily-recitation,benefits,mindfulness',
  },
  {
    title: 'How to Choose the Right Quran Tutor for Your Learning Style',
    category: 'Parent Guides',
    excerpt: 'Not every tutor fits every student. Learn how to identify the teaching style, gender preference, and specialty that matches your goals.',
    content: `<h2>Introduction</h2><p>Finding the right tutor is the single biggest factor in your Quran learning success. A great tutor for one student may not suit another. Here's how to choose wisely.</p><h2>Identify Your Goal</h2><p>Are you starting Noorani Qaida, perfecting Tajweed, memorizing (Hifz), or learning Arabic? Different goals call for different specialties. Qtuor lets you filter tutors by specialty.</p><h2>Consider Teaching Style</h2><p>Some tutors are patient and gentle (ideal for children and beginners). Others are structured and methodical (good for serious adult learners). Read each tutor's teaching style and listen to their audio intro.</p><h2>Gender Preferences</h2><p>Many students and parents prefer a tutor of the same gender, especially for children and sisters. Qtuor supports filtering by gender to ensure comfort and modesty.</p><h2>Take a Free Trial</h2><p>Every Qtuor tutor offers a free trial class. Use it to assess rapport, communication, and teaching pace before committing to a monthly plan.</p><h2>Conclusion</h2><p>The right tutor turns learning from a chore into a joy. Take advantage of free trials, and don't be afraid to switch until you find your perfect match.</p>`,
    featuredImage: '/subjects/quran-recitation.png',
    readingTime: 5,
    tags: 'tutor,choosing,learning-style,trial',
  },
]

async function main() {
  for (const p of SEED_POSTS) {
    const slug = slugify(p.title)
    await db.blogPost.upsert({
      where: { slug },
      update: {},
      create: { ...p, slug, author: 'Qtuor Editorial', source: 'AUTO', status: 'PUBLISHED' },
    })
  }
  console.log(`Seeded ${SEED_POSTS.length} blog posts`)

  const gatewaySeeds: Array<{ provider: string; displayName: string }> = [
    { provider: 'STRIPE', displayName: 'Stripe Connect' },
    { provider: 'PAYPAL', displayName: 'PayPal Payouts' },
    { provider: 'JAZZCASH', displayName: 'JazzCash' },
    { provider: 'EASYPAISA', displayName: 'EasyPaisa' },
  ]
  for (const g of gatewaySeeds) {
    const existing = await db.paymentGateway.findFirst({ where: { provider: g.provider } })
    if (!existing) {
      await db.paymentGateway.create({
        data: {
          provider: g.provider,
          displayName: g.displayName,
          isActive: false,
          sandbox: true,
        },
      })
      console.log(`Seeded ${g.provider} payment gateway`)
    }
  }

  const bankCount = await db.bankAccount.count()
  if (bankCount === 0) {
    await db.bankAccount.create({
      data: {
        bankName: 'Default Operating Account',
        accountHolder: 'Qtuor Platform',
        iban: 'GB00QTUR00000000000000',
        swiftCode: 'QTURGB2L',
        country: 'United Kingdom',
        currency: 'USD',
        isDefault: true,
        notes: 'Default platform receiving account. Update with real details.',
      },
    })
    console.log('Seeded default bank account')
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())

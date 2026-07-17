/**
 * Fallback data for Vercel deployment.
 *
 * When the SQLite database is unavailable (e.g. on Vercel's serverless
 * environment where the filesystem is ephemeral), these static datasets
 * are returned instead so the site renders correctly with demo content.
 *
 * Once you connect a cloud database (Neon, Turso, PlanetScale, etc.),
 * the API routes will use real data from the DB instead.
 */

// ─── Plans ───────────────────────────────────────────────────────────

export interface FallbackPlan {
  id: string
  name: string
  category: string
  classesPerMonth: number
  monthlyPrice: number
  description: string
  features: string[]
  popular: boolean
  active: boolean
  createdAt: string
}

export const FALLBACK_PLANS: FallbackPlan[] = [
  // ── Noorani Qaida ──
  {
    id: 'plan-nq-2',
    name: 'Qaida Starter',
    category: 'Noorani Qaida',
    classesPerMonth: 8,
    monthlyPrice: 29,
    description: '2 classes per week — ideal for young beginners starting their Quran journey.',
    features: ['2 classes / week (30 min each)', 'Interactive Noorani Qaida board', 'Certified Qaida tutor', 'Auto-bookmark & resume', 'Parent safety snapshots'],
    popular: false,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'plan-nq-3',
    name: 'Qaida Learner',
    category: 'Noorani Qaida',
    classesPerMonth: 12,
    monthlyPrice: 39,
    description: '3 classes per week — steady progress through Arabic letters & harakat.',
    features: ['3 classes / week (30 min each)', 'Interactive Noorani Qaida board', 'Certified Qaida tutor', 'Auto-bookmark & resume', 'Parent safety snapshots', 'Homework worksheets'],
    popular: true,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'plan-nq-4',
    name: 'Qaida Accelerator',
    category: 'Noorani Qaida',
    classesPerMonth: 16,
    monthlyPrice: 49,
    description: '4 classes per week — faster mastery of joining letters and basic recitation.',
    features: ['4 classes / week (30 min each)', 'Interactive Noorani Qaida board', 'Certified Qaida tutor', 'Auto-bookmark & resume', 'Parent safety snapshots', 'Priority tutor matching'],
    popular: false,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'plan-nq-5',
    name: 'Qaida Intensive',
    category: 'Noorani Qaida',
    classesPerMonth: 20,
    monthlyPrice: 59,
    description: '5 classes per week — intensive track to complete Qaida in record time.',
    features: ['5 classes / week (30 min each)', 'Interactive Noorani Qaida board', 'Senior certified tutor', 'Auto-bookmark & resume', 'Parent safety snapshots', 'Cloud session recording'],
    popular: false,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ── Quran Recitation With Tajweed ──
  {
    id: 'plan-tw-2',
    name: 'Tajweed Explorer',
    category: 'Quran Recitation With Tajweed',
    classesPerMonth: 8,
    monthlyPrice: 39,
    description: '2 classes per week — learn Tajweed rules at a comfortable pace.',
    features: ['2 classes / week (30 min each)', 'Word-by-word Quran sync', 'Tajweed color highlighting', 'Ijaza-certified tutor', 'Auto-bookmark & resume'],
    popular: false,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'plan-tw-3',
    name: 'Tajweed Builder',
    category: 'Quran Recitation With Tajweed',
    classesPerMonth: 12,
    monthlyPrice: 49,
    description: '3 classes per week — solid Tajweed foundations with regular practice.',
    features: ['3 classes / week (30 min each)', 'Word-by-word Quran sync', 'Tajweed color highlighting', 'Ijaza-certified tutor', 'Auto-bookmark & resume', 'Weekly progress report'],
    popular: true,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'plan-tw-4',
    name: 'Tajweed Pro',
    category: 'Quran Recitation With Tajweed',
    classesPerMonth: 16,
    monthlyPrice: 65,
    description: '4 classes per week — accelerated Tajweed mastery for serious students.',
    features: ['4 classes / week (30 min each)', 'Word-by-word Quran sync', 'Tajweed color highlighting', 'Senior Ijaza-certified tutor', 'Auto-bookmark & resume', 'Priority scheduling'],
    popular: false,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'plan-tw-5',
    name: 'Tajweed Master',
    category: 'Quran Recitation With Tajweed',
    classesPerMonth: 20,
    monthlyPrice: 79,
    description: '5 classes per week — immersive Tajweed training toward Ijaza-level recitation.',
    features: ['5 classes / week (30 min each)', 'Word-by-word Quran sync', 'Tajweed color highlighting', 'Senior Ijaza-certified tutor', 'Auto-bookmark & resume', 'Cloud session recording', 'Ijaza preparation track'],
    popular: false,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ── Hifz ──
  {
    id: 'plan-hf-2',
    name: 'Hifz Starter',
    category: 'Hifz',
    classesPerMonth: 8,
    monthlyPrice: 49,
    description: '2 classes per week — begin your Quran memorization journey.',
    features: ['2 classes / week (30 min each)', 'Dedicated Hafiz tutor', 'Sabaq + Sabaq Para method', 'Auto-bookmark & resume', 'Parent safety snapshots'],
    popular: false,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'plan-hf-3',
    name: 'Hifz Commitment',
    category: 'Hifz',
    classesPerMonth: 12,
    monthlyPrice: 65,
    description: '3 classes per week — consistent memorization with regular revision cycles.',
    features: ['3 classes / week (30 min each)', 'Dedicated Hafiz tutor', 'Sabaq + Sabaq Para + Ammukhta', 'Auto-bookmark & resume', 'Parent safety snapshots', 'Memorization progress tracker'],
    popular: true,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'plan-hf-4',
    name: 'Hifz Accelerator',
    category: 'Hifz',
    classesPerMonth: 16,
    monthlyPrice: 85,
    description: '4 classes per week — fast-track your Hifz with intensive daily revision.',
    features: ['4 classes / week (30 min each)', 'Senior Hafiz tutor', 'Sabaq + Sabaq Para + Ammukhta', 'Auto-bookmark & resume', 'Parent safety snapshots', 'Memorization progress tracker', 'Priority scheduling'],
    popular: false,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'plan-hf-5',
    name: 'Hifz Intensive',
    category: 'Hifz',
    classesPerMonth: 20,
    monthlyPrice: 99,
    description: '5 classes per week — full-immersion Hifz program for dedicated students.',
    features: ['5 classes / week (30 min each)', 'Senior Hafiz tutor', 'Sabaq + Sabaq Para + Ammukhta', 'Auto-bookmark & resume', 'Parent safety snapshots', 'Memorization progress tracker', 'Cloud session recording', 'Ijaza preparation track'],
    popular: false,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

// ─── Tutors ──────────────────────────────────────────────────────────

export interface FallbackTutor {
  id: string
  name: string
  country: string
  avatar: string | null
  profile: {
    id: string
    bio: string
    hourlyRate: number
    perClassRate: number
    rating: number
    reviewCount: number
    studentCount: number
    lessonsCount: number
    verified: boolean
    nativeArabic: boolean
    hafiz: boolean
    ijazaCertified: boolean
    audioIntroText: string | null
    specialties: string[]
    languages: string[]
    experienceYears: number
  } | null
}

export const FALLBACK_TUTORS: FallbackTutor[] = [
  {
    id: 'tutor-1',
    name: 'Sheikh Abdullah Al-Rashid',
    country: 'Egypt',
    avatar: null,
    profile: {
      id: 'tp-1',
      bio: 'Ijaza-certified Quran reciter with 12+ years of teaching Tajweed and Hifz. Specializes in helping adult learners master proper recitation with beautiful voice training.',
      hourlyRate: 8,
      perClassRate: 8,
      rating: 4.9,
      reviewCount: 127,
      studentCount: 45,
      lessonsCount: 1200,
      verified: true,
      nativeArabic: true,
      hafiz: true,
      ijazaCertified: true,
      audioIntroText: null,
      specialties: ['Quran Recitation With Tajweed', 'Hifz'],
      languages: ['Arabic', 'English'],
      experienceYears: 12,
    },
  },
  {
    id: 'tutor-2',
    name: 'Ustadha Fatima Hassan',
    country: 'Saudi Arabia',
    avatar: null,
    profile: {
      id: 'tp-2',
      bio: 'Female Quran tutor specializing in Noorani Qaida and Tajweed for children and sisters. Patient, nurturing teaching style with 8 years of experience.',
      hourlyRate: 7,
      perClassRate: 7,
      rating: 5.0,
      reviewCount: 89,
      studentCount: 32,
      lessonsCount: 800,
      verified: true,
      nativeArabic: true,
      hafiz: true,
      ijazaCertified: true,
      audioIntroText: null,
      specialties: ['Noorani Qaida', 'Quran Recitation With Tajweed'],
      languages: ['Arabic', 'English', 'Urdu'],
      experienceYears: 8,
    },
  },
  {
    id: 'tutor-3',
    name: 'Qari Muhammad Usman',
    country: 'Pakistan',
    avatar: null,
    profile: {
      id: 'tp-3',
      bio: 'Hafiz-e-Quran with Sanad in Hafs. Expert in Hifz methodology using Sabaq, Sabaq Para, and Ammukhta revision system. 15+ years teaching students of all ages.',
      hourlyRate: 6,
      perClassRate: 6,
      rating: 4.8,
      reviewCount: 203,
      studentCount: 58,
      lessonsCount: 2100,
      verified: true,
      nativeArabic: false,
      hafiz: true,
      ijazaCertified: true,
      audioIntroText: null,
      specialties: ['Hifz', 'Quran Recitation With Tajweed'],
      languages: ['Arabic', 'English', 'Urdu'],
      experienceYears: 15,
    },
  },
  {
    id: 'tutor-4',
    name: 'Ustadh Yusuf Ibrahim',
    country: 'Jordan',
    avatar: null,
    profile: {
      id: 'tp-4',
      bio: 'Specialist in Noorani Qaida for young learners (ages 4+). Uses interactive methods and the Qtuor digital Qaida board to make learning fun and engaging for children.',
      hourlyRate: 7,
      perClassRate: 7,
      rating: 4.9,
      reviewCount: 156,
      studentCount: 40,
      lessonsCount: 1500,
      verified: true,
      nativeArabic: true,
      hafiz: false,
      ijazaCertified: true,
      audioIntroText: null,
      specialties: ['Noorani Qaida', 'Arabic'],
      languages: ['Arabic', 'English'],
      experienceYears: 10,
    },
  },
  {
    id: 'tutor-5',
    name: 'Ustadha Aisha Mahmoud',
    country: 'Egypt',
    avatar: null,
    profile: {
      id: 'tp-5',
      bio: 'Female tutor with Ijaza in Hafs & Shu\'ba. Specializes in teaching Tajweed to sisters and young girls. Known for her clear, methodical teaching approach.',
      hourlyRate: 7,
      perClassRate: 7,
      rating: 4.7,
      reviewCount: 67,
      studentCount: 25,
      lessonsCount: 600,
      verified: true,
      nativeArabic: true,
      hafiz: true,
      ijazaCertified: true,
      audioIntroText: null,
      specialties: ['Quran Recitation With Tajweed', 'Hifz'],
      languages: ['Arabic', 'English', 'French'],
      experienceYears: 7,
    },
  },
  {
    id: 'tutor-6',
    name: 'Sheikh Omar Farooq',
    country: 'United Kingdom',
    avatar: null,
    profile: {
      id: 'tp-6',
      bio: 'British-Pakistani Hafiz tutor fluent in English and Urdu. Specializes in teaching Quran to students in Western countries with a focus on proper Makharij and Tajweed application.',
      hourlyRate: 9,
      perClassRate: 9,
      rating: 4.8,
      reviewCount: 94,
      studentCount: 35,
      lessonsCount: 900,
      verified: true,
      nativeArabic: false,
      hafiz: true,
      ijazaCertified: true,
      audioIntroText: null,
      specialties: ['Hifz', 'Quran Recitation With Tajweed'],
      languages: ['Arabic', 'English', 'Urdu'],
      experienceYears: 11,
    },
  },
  {
    id: 'tutor-7',
    name: 'Ustadha Khadija Ali',
    country: 'Morocco',
    avatar: null,
    profile: {
      id: 'tp-7',
      bio: 'Native Arabic speaker specializing in Noorani Qaida and Arabic language basics for non-Arab students. Child-friendly and patient teaching approach.',
      hourlyRate: 5,
      perClassRate: 5,
      rating: 4.9,
      reviewCount: 112,
      studentCount: 38,
      lessonsCount: 950,
      verified: true,
      nativeArabic: true,
      hafiz: false,
      ijazaCertified: true,
      audioIntroText: null,
      specialties: ['Noorani Qaida', 'Arabic'],
      languages: ['Arabic', 'English', 'French'],
      experienceYears: 6,
    },
  },
  {
    id: 'tutor-8',
    name: 'Qari Ahmad Raza',
    country: 'Pakistan',
    avatar: null,
    profile: {
      id: 'tp-8',
      bio: 'Expert Hifz tutor with over 20 years of experience. Has guided 50+ students to complete Quran memorization. Uses proven Sabaq methodology with personalized revision plans.',
      hourlyRate: 6,
      perClassRate: 6,
      rating: 5.0,
      reviewCount: 178,
      studentCount: 50,
      lessonsCount: 3000,
      verified: true,
      nativeArabic: false,
      hafiz: true,
      ijazaCertified: true,
      audioIntroText: null,
      specialties: ['Hifz', 'Quran Recitation With Tajweed'],
      languages: ['Arabic', 'English', 'Urdu'],
      experienceYears: 20,
    },
  },
  {
    id: 'tutor-9',
    name: 'Hafiza Madiha Yasir',
    country: 'Pakistan',
    avatar: null,
    profile: {
      id: 'tp-9',
      bio: 'Dedicated and certified female Quran tutor with over a decade of experience. Specializing in making Noorani Qaida engaging for young kids and teaching advanced Tajweed to female students globally. Structured lessons based on the student\'s pace, ensuring perfect pronunciation (Makharij) from day one.',
      hourlyRate: 7,
      perClassRate: 7,
      rating: 4.9,
      reviewCount: 120,
      studentCount: 310,
      lessonsCount: 4200,
      verified: true,
      nativeArabic: false,
      hafiz: true,
      ijazaCertified: true,
      audioIntroText: 'Assalamu alaikum, I am Hafiza Madiha Yasir. With more than 10 years of experience, I help students build a lifelong, correct, and beautiful relationship with the Quran. I specialize in Noorani Qaida for kids and Tajweed for sisters.',
      specialties: ['Noorani Qaida', 'Quran Recitation With Tajweed', 'Hifz'],
      languages: ['Urdu', 'English'],
      experienceYears: 10,
    },
  },
]

// ─── Blog Posts ──────────────────────────────────────────────────────

export const FALLBACK_BLOG_POSTS = [
  {
    id: 'blog-1',
    title: '5 Essential Tajweed Rules Every Beginner Must Know',
    slug: '5-essential-tajweed-rules-beginners',
    excerpt: 'Master the fundamental Tajweed rules that form the foundation of beautiful Quran recitation.',
    content: '<p>Learning Tajweed is essential for every Muslim who wants to recite the Quran correctly...</p>',
    category: 'Tajweed Tips',
    tags: 'tajweed,beginners,quran recitation',
    featuredImage: null,
    readingTime: 5,
    author: 'Qtuor Editorial',
    source: 'AUTO',
    status: 'PUBLISHED',
    publishedAt: '2026-06-15T00:00:00.000Z',
    createdAt: '2026-06-15T00:00:00.000Z',
    updatedAt: '2026-06-15T00:00:00.000Z',
  },
  {
    id: 'blog-2',
    title: 'How to Help Your Child Memorize the Quran: A Parent\'s Guide',
    slug: 'help-child-memorize-quran-parents-guide',
    excerpt: 'Practical tips for parents to support their children on their Hifz journey at home.',
    content: '<p>Memorizing the Quran is a noble goal, and as a parent, you play a crucial role...</p>',
    category: 'Parent Guides',
    tags: 'hifz,children,parenting,quran memorization',
    featuredImage: null,
    readingTime: 7,
    author: 'Qtuor Editorial',
    source: 'AUTO',
    status: 'PUBLISHED',
    publishedAt: '2026-06-20T00:00:00.000Z',
    createdAt: '2026-06-20T00:00:00.000Z',
    updatedAt: '2026-06-20T00:00:00.000Z',
  },
  {
    id: 'blog-3',
    title: 'Understanding the Noorani Qaida: Your First Step to Reading the Quran',
    slug: 'understanding-noorani-qaida-first-step',
    excerpt: 'Why Noorani Qaida is the proven starting point for learning to read the Quran in Arabic.',
    content: '<p>The Noorani Qaida is a time-tested method for learning to read Arabic...</p>',
    category: 'Quran Learning',
    tags: 'noorani qaida,beginners,arabic,quran reading',
    featuredImage: null,
    readingTime: 4,
    author: 'Qtuor Editorial',
    source: 'AUTO',
    status: 'PUBLISHED',
    publishedAt: '2026-07-01T00:00:00.000Z',
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
  },
  {
    id: 'blog-4',
    title: 'The Science of Makharij: Perfecting Your Quran Pronunciation',
    slug: 'science-of-makharij-quran-pronunciation',
    excerpt: 'Discover the 17 articulation points that give every Arabic letter its unique sound.',
    content: '<p>Makharij al-Huruf refers to the points of articulation in the mouth and throat...</p>',
    category: 'Tajweed Tips',
    tags: 'makharij,tajweed,pronunciation,articulation',
    featuredImage: null,
    readingTime: 6,
    author: 'Qtuor Editorial',
    source: 'AUTO',
    status: 'PUBLISHED',
    publishedAt: '2026-07-10T00:00:00.000Z',
    createdAt: '2026-07-10T00:00:00.000Z',
    updatedAt: '2026-07-10T00:00:00.000Z',
  },
]

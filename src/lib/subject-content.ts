// Rich content for each subject landing page.

export interface SubjectContent {
  key: string
  label: string
  shortLabel: string
  arabic: string
  tagline: string
  heroImage: string
  accentColor: string
  icon: string // lucide icon name
  overview: string
  whoIsItFor: string
  whatYouWillLearn: string[]
  curriculum: { title: string; desc: string; duration: string }[]
  outcomes: string[]
  faqs: { q: string; a: string }[]
  stats: { value: string; label: string }[]
}

export const SUBJECT_CONTENT: SubjectContent[] = [
  {
    key: 'Noorani Qaida',
    label: 'Noorani Qaida',
    shortLabel: 'Noorani Qaida',
    arabic: 'القاعدة النورانية',
    tagline: 'Build a strong foundation from the very first Arabic letter.',
    heroImage: '/subjects/noorani-qaida.png',
    accentColor: 'oklch(0.62 0.14 230)',
    icon: 'BookOpen',
    overview:
      'Noorani Qaida is the essential first step for every beginner. This foundational course teaches the Arabic alphabet, letter recognition, vowel sounds (harakat), and the rules of joining letters. Through 17 structured lessons, you will progress from recognizing individual letters to reading complete words and verses with confidence. It is the time-tested methodology used across the Muslim world for children and adults alike.',
    whoIsItFor:
      'Perfect for absolute beginners — children aged 4+ and adults starting their Quran journey. No prior knowledge of Arabic is required. Also ideal for parents who want to build a solid base before their children move on to Tajweed and Hifz.',
    whatYouWillLearn: [
      'The 28 Arabic letters — their names, shapes, and sounds',
      'Harakat (vowel movements): Fatha, Kasra, Damma',
      'Sukun (no vowel) and Shaddah (doubling)',
      'Tanween (double vowels) and their pronunciation',
      'Madd (prolongation) and Leen (soft letters)',
      'Rules of Nun Sakin and Mim Sakin',
      'Qalqalah (echoing) and Saktah (pause)',
      'Reading full Quranic words and short verses',
    ],
    curriculum: [
      { title: 'Lesson 1–2: Single & Compound Letters', desc: 'Learn all 28 Arabic letters and how they join to form words.', duration: '2 weeks' },
      { title: 'Lesson 3–4: Harakat & Tanween', desc: 'Master vowel sounds (Fatha, Kasra, Damma) and double vowels.', duration: '2 weeks' },
      { title: 'Lesson 5–6: Small Letters & Sukun', desc: 'Standing vowels, small Alif/Ya/Waw, and the sukun (no vowel).', duration: '2 weeks' },
      { title: 'Lesson 7–9: Shaddah & Combinations', desc: 'Doubling letters, shaddah with harakat and tanween.', duration: '3 weeks' },
      { title: 'Lesson 10–11: Madd & Leen', desc: 'Natural prolongation and soft letters (Waw/Ya with sukun).', duration: '2 weeks' },
      { title: 'Lesson 12–13: Nun Sakin & Mim Sakin Rules', desc: 'Izhar, Idgham, Iqlab, Ikhha — the four rules of Nun Sakin.', duration: '3 weeks' },
      { title: 'Lesson 14–15: Advanced Madd & Qalqalah', desc: 'Madd Muttasil, Munfasil, Lazim, and the echoing Qalqalah letters.', duration: '2 weeks' },
      { title: 'Lesson 16–17: Application & Practice', desc: 'Apply all rules to actual Quran verses with guided practice.', duration: '2 weeks' },
    ],
    outcomes: [
      'Read any Arabic word with correct pronunciation',
      'Recognize and apply all basic Tajweed rules',
      'Transition smoothly to full Quran recitation',
      'Build the confidence to start Hifz',
    ],
    faqs: [
      { q: 'Do I need any prior knowledge?', a: 'No. Noorani Qaida starts from absolute zero — you will learn each letter from scratch.' },
      { q: 'How long does the full course take?', a: 'With 2–3 classes per week, most students complete all 17 lessons in 3–4 months.' },
      { q: 'Is this suitable for young children?', a: 'Yes. Noorani Qaida is specifically designed for beginners aged 4 and above. Our tutors use a gentle, engaging approach for children.' },
      { q: 'Can I take a free trial class first?', a: 'Absolutely. Every new student gets one free 30-minute trial class with any verified tutor.' },
    ],
    stats: [
      { value: '17', label: 'Structured lessons' },
      { value: '4+', label: 'Age to start' },
      { value: '3–4', label: 'Months to complete' },
      { value: '100%', label: 'Beginner friendly' },
    ],
  },
  {
    key: 'Quran Recitation With Tajweed',
    label: 'Quran Recitation With Tajweed',
    shortLabel: 'Quran Recitation',
    arabic: 'التجويد',
    tagline: 'Recite the Quran beautifully with perfect Tajweed rules.',
    heroImage: '/subjects/quran-recitation.png',
    accentColor: 'oklch(0.40 0.11 258)',
    icon: 'Sparkles',
    overview:
      'Tajweed is the science of reciting the Quran exactly as it was revealed to Prophet Muhammad (peace be upon him). This course takes you beyond basic reading into the beautiful, precise art of Quranic recitation. You will learn the rules of pronunciation, articulation points (Makharij), and the characteristics (Sifat) of each letter — so every word flows with the melody and accuracy that the Quran deserves.',
    whoIsItFor:
      'For students who can already read Arabic letters and want to perfect their recitation. Whether you are a beginner who just finished Noorani Qaida or an advanced reader looking to refine your Tajweed, our certified tutors will meet you at your level.',
    whatYouWillLearn: [
      'Makharij — the 17 articulation points of Arabic letters',
      'Sifat — the characteristics of each letter (heavy/light, whispered/voiced)',
      'Rules of Noon Sakin & Tanween (Izhar, Idgham, Iqlab, Ikhfa)',
      'Rules of Meem Sakin (Ikhfa Shafawi, Idgham Shafawi, Izhar Shafawi)',
      'Madd rules — Natural, Muttasil, Munfasil, Lazim, Leen',
      'Qalqalah — the echoing sound on ق ط ب ج د',
      'Waqf — rules of stopping and pausing in recitation',
      'Beautiful recitation with proper rhythm and melody',
    ],
    curriculum: [
      { title: 'Module 1: Makharij & Sifat', desc: 'Learn the 17 articulation points and the characteristics of every Arabic letter.', duration: '4 weeks' },
      { title: 'Module 2: Noon Sakin & Tanween Rules', desc: 'Master the four rules: Izhar (clear), Idgham (merge), Iqlab (convert), Ikhfa (hide).', duration: '3 weeks' },
      { title: 'Module 3: Meem Sakin Rules', desc: 'The three Shafawi rules for Meem with sukun.', duration: '2 weeks' },
      { title: 'Module 4: Madd (Prolongation)', desc: 'Natural Madd, Muttasil, Munfasil, Lazim, and Leen — when and how long to stretch.', duration: '3 weeks' },
      { title: 'Module 5: Qalqalah & Special Rules', desc: 'The echoing Qalqalah letters, Saktah, and other special recitation rules.', duration: '2 weeks' },
      { title: 'Module 6: Waqf & Recitation Practice', desc: 'Rules of stopping, breath control, and applying everything to full Surah recitation.', duration: '4 weeks' },
    ],
    outcomes: [
      'Recite the Quran with correct Tajweed rules',
      'Pronounce every letter from its proper articulation point',
      'Apply Madd, Qalqalah, and Ghunnah naturally',
      'Develop a beautiful, confident recitation style',
    ],
    faqs: [
      { q: 'Do I need to know Noorani Qaida first?', a: 'Yes, basic Arabic reading is required. If you are a complete beginner, we recommend starting with Noorani Qaida.' },
      { q: 'Will I get an Ijaza certification?', a: 'Advanced students who demonstrate mastery may be eligible for Ijaza recommendation from our Ijaza-certified tutors.' },
      { q: 'Can I focus on a specific Juz or Surah?', a: 'Yes. After the foundational modules, you can choose to practice specific Surahs or Juz with your tutor.' },
      { q: 'How do I know which tutor is right for Tajweed?', a: 'Look for tutors with the Ijaza badge and Native Arabic speaker badge — they have the highest level of Tajweed certification.' },
    ],
    stats: [
      { value: '6', label: 'Structured modules' },
      { value: '17', label: 'Articulation points' },
      { value: '4–6', label: 'Months to master' },
      { value: 'Ijaza', label: 'Certified tutors' },
    ],
  },
  {
    key: 'Hifz',
    label: 'Hifz',
    shortLabel: 'Hifz',
    arabic: 'الحفظ',
    tagline: 'Memorize the Holy Quran with a dedicated Hafiz tutor.',
    heroImage: '/subjects/hifz.png',
    accentColor: 'oklch(0.78 0.15 85)',
    icon: 'Brain',
    overview:
      'Hifz — the memorization of the entire Quran — is one of the most noble achievements a Muslim can pursue. This intensive program pairs you with a dedicated Hafiz tutor who will guide you through a personalized memorization and revision plan. Using proven techniques of repetition (Tikrar), scheduled revision (Muraja\'ah), and gradual progression, you will memorize the Quran with confidence and retention.',
    whoIsItFor:
      'For dedicated students who can recite the Quran with basic Tajweed and want to memorize — whether a few Surahs, a Juz, or the entire Quran. Requires commitment to daily practice and revision.',
    whatYouWillLearn: [
      'Effective memorization techniques (Tikrar & repetition)',
      'Structured daily revision schedule (Muraja\'ah)',
      'Memorizing short Surahs from Juz Amma first',
      'Progressive memorization through longer Surahs',
      'Connecting new memorization with previously learned verses',
      'Maintaining perfect Tajweed while memorizing',
      'Revision strategies for long-term retention',
      'Preparing for Hifz completion (Khatm)',
    ],
    curriculum: [
      { title: 'Phase 1: Juz Amma (Juz 30)', desc: 'Start with the short Surahs — An-Nas to An-Naba. Build your memorization muscle.', duration: '2–4 months' },
      { title: 'Phase 2: Juz Tabarak (Juz 29)', desc: 'Progress to medium-length Surahs with more complex verses.', duration: '2–3 months' },
      { title: 'Phase 3: Selected Surahs', desc: 'Memorize popular Surahs like Al-Kahf, Yaseen, Al-Mulk, and Ar-Rahman.', duration: '3–5 months' },
      { title: 'Phase 4: Progressive Memorization', desc: 'Continue with longer Surahs, building toward full Quran memorization.', duration: 'Ongoing' },
      { title: 'Daily Muraja\'ah', desc: 'Structured revision of previously memorized portions to ensure retention.', duration: 'Ongoing' },
      { title: 'Phase 5: Khatm & Ijaza', desc: 'Final review and completion. Eligible students may receive Ijaza recommendation.', duration: 'Final phase' },
    ],
    outcomes: [
      'Memorize the Quran with strong retention',
      'Develop a sustainable daily Hifz routine',
      'Maintain Tajweed while reciting from memory',
      'Build a lifelong connection with the Quran',
    ],
    faqs: [
      { q: 'How long does it take to memorize the entire Quran?', a: 'With 4–5 classes per week and daily practice, most students complete full Hifz in 3–5 years. Partial memorization (Juz Amma) can be done in 2–4 months.' },
      { q: 'Do I need to know Tajweed before starting Hifz?', a: 'Yes, basic Tajweed is essential. You will be memorizing with correct pronunciation, so we recommend completing at least a basic Tajweed course first.' },
      { q: 'How much daily practice is required?', a: 'For serious Hifz students, 30–60 minutes of daily memorization plus 15–30 minutes of revision is recommended. Your tutor will create a personalized schedule.' },
      { q: 'Are the Hifz tutors qualified?', a: 'Yes. All Hifz tutors are Hafiz themselves (have memorized the entire Quran) and many hold Ijaza certifications. Look for the Hafiz and Ijaza badges.' },
    ],
    stats: [
      { value: '30', label: 'Juz to memorize' },
      { value: '6236', label: 'Verses in total' },
      { value: '3–5', label: 'Years for full Hifz' },
      { value: 'Daily', label: 'Revision routine' },
    ],
  },
  {
    key: 'Arabic Language',
    label: 'Arabic Language',
    shortLabel: 'Arabic',
    arabic: 'اللغة العربية',
    tagline: 'Understand the language of the Quran directly.',
    heroImage: '/subjects/arabic-language.png',
    accentColor: 'oklch(0.55 0.18 150)',
    icon: 'Languages',
    overview:
      'Arabic is the language of the Quran and the key to unlocking its deeper meanings. This course teaches Modern Standard Arabic (Fusha) with a focus on Quranic vocabulary and classical Arabic. You will learn grammar (Nahw), morphology (Sarf), reading, writing, and conversation — enabling you to understand the Quran directly without relying on translations.',
    whoIsItFor:
      'For anyone who wants to understand Arabic — from beginners who want to comprehend basic Quranic phrases to advanced students studying classical Arabic literature. No prior Arabic knowledge is required for beginner levels.',
    whatYouWillLearn: [
      'Arabic alphabet and reading fluency',
      'Essential Quranic vocabulary (most frequent words)',
      'Grammar (Nahw) — sentence structure, verb conjugation',
      'Morphology (Sarf) — word patterns and root letters',
      'Reading and writing in Arabic script',
      'Conversational Arabic for daily use',
      'Understanding Quranic verses directly',
      'Classical Arabic (Fusha) for advanced study',
    ],
    curriculum: [
      { title: 'Level 1: Reading & Writing Foundation', desc: 'Master the alphabet, reading, and writing in Arabic script.', duration: '4 weeks' },
      { title: 'Level 2: Essential Vocabulary', desc: 'Learn the 500 most frequent Quranic words (covering ~80% of Quran text).', duration: '6 weeks' },
      { title: 'Level 3: Basic Grammar (Nahw)', desc: 'Sentence structure, noun types, verb conjugation (past/present/future).', duration: '8 weeks' },
      { title: 'Level 4: Morphology (Sarf)', desc: 'Word patterns, root letters (Jadr), and derived forms.', duration: '6 weeks' },
      { title: 'Level 5: Quranic Comprehension', desc: 'Read and understand Quranic verses directly in Arabic.', duration: '8 weeks' },
      { title: 'Level 6: Conversation & Classical Texts', desc: 'Spoken Arabic practice and reading classical Islamic literature.', duration: 'Ongoing' },
    ],
    outcomes: [
      'Read and write Arabic fluently',
      'Understand Quranic verses without translation',
      'Converse in Modern Standard Arabic',
      'Build a foundation for advanced Islamic studies',
    ],
    faqs: [
      { q: 'Is this Modern Standard Arabic or Quranic Arabic?', a: 'Both. We teach Modern Standard Arabic (Fusha) with a strong emphasis on Quranic vocabulary and classical texts, so you can understand the Quran and converse formally.' },
      { q: 'Do I need to know the alphabet?', a: 'No. Level 1 starts with the alphabet. If you already know it, you can start at Level 2.' },
      { q: 'How long until I can understand the Quran?', a: 'With consistent study (3–4 classes/week), most students begin understanding basic Quranic verses within 3–4 months, and achieve intermediate comprehension in 6–9 months.' },
      { q: 'Can my children take this course?', a: 'Yes. We have tutors who specialize in teaching Arabic to children with an engaging, age-appropriate approach.' },
    ],
    stats: [
      { value: '500+', label: 'Quranic words' },
      { value: '6', label: 'Structured levels' },
      { value: '3–9', label: 'Months to comprehend' },
      { value: 'Fusha', label: 'Modern Standard' },
    ],
  },
  {
    key: 'Tafsir',
    label: 'Tafsir',
    shortLabel: 'Tafsir',
    arabic: 'التفسير',
    tagline: 'Understand the meaning and wisdom behind every verse.',
    heroImage: '/subjects/tafsir.png',
    accentColor: 'oklch(0.50 0.20 300)',
    icon: 'ScrollText',
    overview:
      'Tafsir is the science of explaining and interpreting the meanings of the Quran. While recitation tells you how to read the words, Tafsir reveals what they mean — the context of revelation (Asbab al-Nuzul), the historical background, the legal rulings, and the spiritual wisdom. This course takes you on a journey through selected Surahs, unpacking their meanings verse by verse using authentic classical Tafsir sources.',
    whoIsItFor:
      'For students who can read the Quran and want to go deeper — to understand the message, context, and application of the verses in their daily lives. Some basic Arabic knowledge is helpful but not required (instruction is in English/Urdu/Arabic).',
    whatYouWillLearn: [
      'Asbab al-Nuzul — the context and reasons for revelation',
      'Verse-by-verse explanation of selected Surahs',
      'Classical Tafsir sources (Ibn Kathir, Al-Jalalayn, Al-Tabari)',
      'Legal rulings (Ahkam) derived from the Quran',
      'Linguistic analysis of key Arabic terms',
      'Historical context of Meccan and Medinan Surahs',
      'Practical application of Quranic teachings today',
      'Spiritual and moral lessons from the verses',
    ],
    curriculum: [
      { title: 'Unit 1: Introduction to Tafsir Sciences', desc: 'What is Tafsir? The major classical Tafsir sources and methodologies.', duration: '2 weeks' },
      { title: 'Unit 2: Surah Al-Fatihah — The Opening', desc: 'Deep dive into the seven oft-repeated verses — the foundation of prayer.', duration: '2 weeks' },
      { title: 'Unit 3: Juz Amma Tafsir', desc: 'Verse-by-verse explanation of the short Surahs (An-Naba to An-Nas).', duration: '8 weeks' },
      { title: 'Unit 4: Selected Surahs', desc: 'In-depth Tafsir of Al-Kahf, Yaseen, Al-Mulk, Ar-Rahman, and Al-Waqi\'ah.', duration: '10 weeks' },
      { title: 'Unit 5: Meccan vs Medinan Revelations', desc: 'Understanding the difference, context, and themes of Meccan and Medinan Surahs.', duration: '3 weeks' },
      { title: 'Unit 6: Thematic Tafsir', desc: 'Study by theme: stories of the Prophets, Paradise & Hell, rulings, and morals.', duration: 'Ongoing' },
    ],
    outcomes: [
      'Understand the meaning of the verses you recite',
      'Apply Quranic teachings to daily life',
      'Connect deeply with the message of the Quran',
      'Build a foundation for advanced Islamic scholarship',
    ],
    faqs: [
      { q: 'Do I need to know Arabic for Tafsir?', a: 'No. Our Tafsir classes are conducted in English, Urdu, and Arabic. While Arabic helps, it is not required — the tutor will explain the Arabic meanings.' },
      { q: 'Which Surahs will we study?', a: 'The curriculum starts with Juz Amma (short Surahs) and progresses to popular Surahs like Al-Kahf, Yaseen, and Al-Mulk. You can also request specific Surahs.' },
      { q: 'Is this suitable for beginners?', a: 'Yes, if you can read the Quran. The introduction unit assumes no prior Tafsir knowledge. Your tutor will explain everything from the basics.' },
      { q: 'Which Tafsir sources are used?', a: 'Our tutors reference authentic classical sources including Tafsir Ibn Kathir, Tafsir Al-Jalalayn, and Tafsir Al-Tabari, adapted for modern students.' },
    ],
    stats: [
      { value: '6', label: 'Study units' },
      { value: '114', label: 'Surahs to explore' },
      { value: 'Classical', label: 'Authentic sources' },
      { value: 'Verse', label: 'By verse' },
    ],
  },
  {
    key: 'Islamic Studies',
    label: 'Islamic Studies',
    shortLabel: 'Islamic Studies',
    arabic: 'الدراسات الإسلامية',
    tagline: 'Learn Fiqh, Seerah, Aqeedah, and daily Islamic etiquette.',
    heroImage: '/subjects/islamic-studies.png',
    accentColor: 'oklch(0.65 0.18 200)',
    icon: 'Moon',
    overview:
      'Islamic Studies is a comprehensive course covering the essential knowledge every Muslim needs — beyond Quran recitation. You will learn Fiqh (jurisprudence), Seerah (the life of Prophet Muhammad ﷺ), Aqeedah (Islamic beliefs), Hadith sciences, and the daily etiquette (Adab) of a Muslim. This course connects the Quran\'s teachings to practical daily life.',
    whoIsItFor:
      'For Muslims of all ages who want to deepen their understanding of Islam — children learning the basics, new Muslims building their foundation, and lifelong students seeking structured knowledge. Suitable for all levels.',
    whatYouWillLearn: [
      'Fiqh — rulings on purification (Wudu), prayer (Salah), fasting, Zakat, and Hajj',
      'Seerah — the life and character of Prophet Muhammad ﷺ',
      'Aqeedah — the six pillars of Iman (faith)',
      'Hadith — the 40 Hadith of Imam Nawawi and key prophetic traditions',
      'Daily Adab — Islamic etiquette for eating, sleeping, greeting, and interacting',
      'Halal & Haram — understanding what is permitted and forbidden',
      'Islamic history — the Rightly Guided Caliphs and key events',
      'Character building — Akhlaq and Muslim personality',
    ],
    curriculum: [
      { title: 'Module 1: Aqeedah (Beliefs)', desc: 'The five pillars of Islam, six pillars of Iman, and Tawheed (Oneness of Allah).', duration: '4 weeks' },
      { title: 'Module 2: Fiqh of Worship (Ibadat)', desc: 'Detailed rulings on Wudu, Salah, Sawm (fasting), Zakat, and Hajj.', duration: '8 weeks' },
      { title: 'Module 3: Seerah (Prophetic Biography)', desc: 'The life of Prophet Muhammad ﷺ from birth to passing — lessons and wisdom.', duration: '8 weeks' },
      { title: 'Module 4: Hadith Studies', desc: 'The 40 Hadith of Imam Nawawi and key prophetic traditions with explanations.', duration: '6 weeks' },
      { title: 'Module 5: Daily Adab & Akhlaq', desc: 'Islamic etiquette for daily life — eating, sleeping, greeting, family, and community.', duration: '4 weeks' },
      { title: 'Module 6: Halal, Haram & Contemporary Issues', desc: 'Understanding Islamic rulings on food, finance, relationships, and modern questions.', duration: 'Ongoing' },
    ],
    outcomes: [
      'Practice daily worship with correct knowledge',
      'Understand the life and lessons of the Prophet ﷺ',
      'Apply Islamic etiquette in daily life',
      'Answer common questions about Islam confidently',
    ],
    faqs: [
      { q: 'Is this course only for children?', a: 'No. While many parents enroll their children, the course covers advanced topics suitable for adults and new Muslims as well. Tutors adapt the level to each student.' },
      { q: 'Which school of thought (Madhhab) is followed?', a: 'Our tutors teach from authentic sources. You can request a specific Madhhab (Hanafi, Shafi\'i, Maliki, Hanbali) when selecting a tutor, as many specialize in one school.' },
      { q: 'Can new Muslims take this course?', a: 'Absolutely. This is one of the best courses for new Muslims — it covers all the essentials of faith and practice in a structured, welcoming way.' },
      { q: 'Do you cover contemporary issues?', a: 'Yes. Module 6 addresses modern questions about finance, relationships, technology, and daily life from an Islamic perspective.' },
    ],
    stats: [
      { value: '6', label: 'Core modules' },
      { value: '5', label: 'Pillars of Islam' },
      { value: '6', label: 'Pillars of Iman' },
      { value: 'All', label: 'Ages welcome' },
    ],
  },
]

export function getSubjectContent(key: string): SubjectContent | undefined {
  return SUBJECT_CONTENT.find((s) => s.key === key)
}

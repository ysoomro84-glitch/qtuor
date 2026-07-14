export const SUBJECTS = [
  { key: 'Noorani Qaida', label: 'Noorani Qaida', desc: 'Foundations of Arabic letters & pronunciation', icon: 'BookOpen' },
  { key: 'Quran Recitation With Tajweed', label: 'Quran Recitation With Tajweed', desc: 'Rules of beautiful, correct Quran recitation', icon: 'Sparkles' },
  { key: 'Hifz', label: 'Hifz', desc: 'Memorization of the Holy Quran with revision', icon: 'Brain' },
  { key: 'Arabic Language', label: 'Arabic Language', desc: 'Modern Standard & Classical Arabic fluency', icon: 'Languages' },
  { key: 'Tafsir', label: 'Tafsir', desc: 'Understanding the meaning of the verses', icon: 'ScrollText' },
  { key: 'Islamic Studies', label: 'Islamic Studies', desc: 'Fiqh, Seerah, Aqeedah & daily etiquette', icon: 'Moon' },
] as const

export const CATEGORIES = [
  { key: 'all', label: 'All Subjects' },
  { key: 'Noorani Qaida', label: 'Noorani Qaida' },
  { key: 'Quran Recitation With Tajweed', label: 'Quran Recitation' },
  { key: 'Hifz', label: 'Hifz' },
  { key: 'Arabic Language', label: 'Arabic' },
] as const

export function classNames(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

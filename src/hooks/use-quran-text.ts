'use client'

import { useQuery } from '@tanstack/react-query'
import type { LibraryPage, QuranWord, QuranLine } from '@/components/classroom/quran-data'
import { getSurah } from '@/lib/quran-metadata'

// ============ Types ============

interface QuranComWord {
  id: number
  position: number
  text: string          // Arabic text (Uthmani font code or readable text)
  char_type_name: string // "word" or "end"
  audio_url: string
  transliteration?: { text: string }
  translation?: { text: string }
}
interface QuranComVerse {
  id: number
  verse_key: string     // e.g. "1:1", "2:255"
  verse_number: number  // ayah number within the surah
  text_uthmani?: string // Full verse text in readable Uthmani Arabic
  words: QuranComWord[]
}
interface QuranComResponse {
  verses: QuranComVerse[]
}

interface AlQuranAyah {
  text: string
  numberInSurah: number
}

const SURAHS_WITHOUT_BISMILLAH = new Set([9])

// ============ Quran.com API v4 — Primary Data Source ============

/**
 * Fetch word-by-word data from Quran.com API v4.
 * Each word has a unique ID, position, text, transliteration, translation, and audio URL.
 */
async function fetchQuranComVerses(surahNumber: number): Promise<QuranComVerse[]> {
  const res = await fetch(
    `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?words=true&fields=text_uthmani&per_page=300`,
    { cache: 'force-cache' }
  )
  if (!res.ok) throw new Error(`Quran.com API failed for surah ${surahNumber}`)
  const json: QuranComResponse = await res.json()
  // CRITICAL FIX: Sort verses by their unique ID to ensure perfect Quranic order
  return json.verses.sort((a, b) => a.id - b.id)
}

// ============ AlQuran.cloud — Fallback Arabic Text ============

/**
 * Fetch Arabic text from AlQuran.cloud (used only as fallback if Quran.com fails).
 */
async function fetchAlQuranText(surahNumber: number): Promise<AlQuranAyah[]> {
  const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`, { cache: 'force-cache' })
  if (!res.ok) throw new Error(`AlQuran.cloud API failed for surah ${surahNumber}`)
  const json = await res.json()
  // Sort ayahs by their numberInSurah to ensure correct order
  return json.data.ayahs.sort((a: AlQuranAyah, b: AlQuranAyah) => a.numberInSurah - b.numberInSurah)
}

// ============ Combined Fetch ============

/**
 * Fetch a complete surah with word-by-word data.
 *
 * PRIMARY: Quran.com API v4 (unique word IDs, translations, transliteration, audio)
 * FALLBACK: AlQuran.cloud (Arabic text only, if Quran.com fails)
 *
 * CRITICAL: Verses are sorted by verse_number, words within each verse are sorted by position.
 * This ensures the Quranic text is always in the correct order (Tartib).
 */
export async function fetchSurahAsPage(surahNumber: number): Promise<LibraryPage> {
  const meta = getSurah(surahNumber)
  if (!meta) throw new Error('Unknown surah')

  const hasBismillah = !SURAHS_WITHOUT_BISMILLAH.has(surahNumber)
  const skipFirstAyahBismillah = surahNumber === 1

  // Try Quran.com first (primary source — has word-by-word data)
  const quranComVerses = await fetchQuranComVerses(surahNumber).catch(() => null)

  const lines: QuranLine[] = []

  if (quranComVerses && quranComVerses.length > 0) {
    // ===== PRIMARY: Quran.com API v4 =====
    // Sort verses by verse_number to ensure correct ayah order
    const sortedVerses = [...quranComVerses].sort((a, b) => a.verse_number - b.verse_number)

    for (const verse of sortedVerses) {
      // Skip Bismillah for Al-Fatihah (it's handled via the bismillah flag on the page)
      if (skipFirstAyahBismillah && verse.verse_number === 1) continue

      // CRITICAL FIX: Sort words by position within the verse
      const sortedWords = verse.words
        .filter((w) => w.char_type_name === 'word')
        .sort((a, b) => a.position - b.position)

      if (sortedWords.length === 0) continue

      // Use verse-level text_uthmani for readable Arabic text (Quran.com word text is font-code glyphs)
      // Split the verse text into tokens and pair with Quran.com word IDs
      let arabicTokens: string[] | null = null
      if (verse.text_uthmani) {
        // Strip Bismillah from first ayah (except Al-Fatihah)
        let verseText = verse.text_uthmani.replace(/\s+/g, ' ').trim()
        if (verse.verse_number === 1 && hasBismillah && surahNumber !== 1) {
          const bismillahRegex = /^بِسْمِ\s+ٱللَّهِ\s+ٱلرَّحْمَـٰنِ\s+ٱلرَّحِيمِ\s*/i
          verseText = verseText.replace(bismillahRegex, '').trim()
        }
        arabicTokens = verseText.split(' ').filter(Boolean)
      }

      const words: QuranWord[] = []
      for (let i = 0; i < sortedWords.length; i++) {
        const w = sortedWords[i]
        // If we have readable Arabic from text_uthmani, use it; otherwise use Quran.com text
        const arabicText = arabicTokens && arabicTokens[i] ? arabicTokens[i] : w.text
        words.push({
          id: `w${w.id}`,  // Use Quran.com's unique word ID for WebSocket sync
          text: arabicText,
          translation: w.translation?.text,
          transliteration: w.transliteration?.text,
          audioUrl: w.audio_url ? `https://audio.qurancdn.com/${w.audio_url}` : undefined,
        })
      }

      // Ayah-end marker (۝ with ayah number in Arabic-Indic digits)
      const ayahNumArabic = toArabicNumber(verse.verse_number)
      words.push({ id: `s${surahNumber}a${verse.verse_number}-end`, text: `${ayahNumArabic}` })

      lines.push({ words })
    }
  } else {
    // ===== FALLBACK: AlQuran.cloud =====
    const alQuranAyahs = await fetchAlQuranText(surahNumber).catch(() => null)
    if (alQuranAyahs && alQuranAyahs.length > 0) {
      for (const ayah of alQuranAyahs) {
        if (skipFirstAyahBismillah && ayah.numberInSurah === 1) continue

        let text = ayah.text.replace(/\s+/g, ' ').trim()
        // Strip Bismillah from first ayah (except Al-Fatihah)
        if (ayah.numberInSurah === 1 && hasBismillah && surahNumber !== 1) {
          const bismillahRegex = /^بِسْمِ\s+اللَّهِ\s+الرَّحْمَٰنِ\s+الرَّحِيمِ\s*/i
          text = text.replace(bismillahRegex, '').trim()
        }
        if (!text) continue

        // Split Arabic text into individual words
        const tokens = text.split(' ').filter(Boolean)
        const words: QuranWord[] = tokens.map((tok, i) => ({
          id: `s${surahNumber}a${ayah.numberInSurah}w${i}`,
          text: tok,
        }))
        const ayahNumArabic = toArabicNumber(ayah.numberInSurah)
        words.push({ id: `s${surahNumber}a${ayah.numberInSurah}-end`, text: `${ayahNumArabic}` })
        lines.push({ words })
      }
    }
  }

  return {
    id: 10000 + surahNumber,
    type: 'quran',
    surahNumber,
    surah: meta.name,
    surahArabic: meta.arabicName,
    ayahRange: `1–${meta.ayahCount}`,
    juz: String(meta.startJuz),
    bismillah: hasBismillah,
    lines,
  }
}

function toArabicNumber(n: number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  return String(n).split('').map((d) => arabicDigits[parseInt(d)] || d).join('')
}

/** React Query hook */
export function useSurahText(surahNumber: number | null) {
  return useQuery({
    queryKey: ['surah-text', surahNumber],
    queryFn: () => fetchSurahAsPage(surahNumber as number),
    enabled: !!surahNumber && surahNumber >= 1 && surahNumber <= 114,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

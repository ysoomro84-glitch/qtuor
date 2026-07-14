// ============================================================
// Qtuor — Complete Quran Metadata
// 30 Juz (Para) + 114 Surahs with full metadata.
// The actual verse text is fetched at runtime from alquran.cloud
// so the complete 6,236-verse Uthmani Quran is available on demand.
// ============================================================

export interface Juz {
  number: number
  arabicName: string   // traditional name (e.g. "آلَم")
  transliteration: string
  englishMeaning: string
  startSurah: number   // surah number where this juz begins
  startAyah: number    // ayah number where this juz begins
}

export interface SurahMeta {
  number: number
  name: string             // transliteration (e.g. "Al-Baqarah")
  arabicName: string       // Arabic (e.g. "البقرة")
  englishMeaning: string   // (e.g. "The Cow")
  ayahCount: number
  revelationType: 'Meccan' | 'Medinan'
  startJuz: number         // juz where the surah begins
}

// ============== 30 JUZ (PARA) ==============
export const JUZ_LIST: Juz[] = [
  { number: 1, arabicName: 'آلَم', transliteration: 'Alif Lam Mim', englishMeaning: 'Alif Lam Mim', startSurah: 1, startAyah: 1 },
  { number: 2, arabicName: 'سَيَقُولُ', transliteration: 'Sayaqul', englishMeaning: 'They will say', startSurah: 2, startAyah: 142 },
  { number: 3, arabicName: 'تِلْكَ الرُّسُل', transliteration: 'Tilka ar-Rusul', englishMeaning: 'Those messengers', startSurah: 2, startAyah: 253 },
  { number: 4, arabicName: 'لَنْ تَنَالُوا', transliteration: 'Lan Tanaalu', englishMeaning: 'You will not attain', startSurah: 3, startAyah: 92 },
  { number: 5, arabicName: 'وَالْمُحْصَنَات', transliteration: 'Wal-Muhsanat', englishMeaning: 'And the protected women', startSurah: 4, startAyah: 24 },
  { number: 6, arabicName: 'لَا يُحِبُّ اللَّهُ', transliteration: 'La Yuhibbullah', englishMeaning: 'Allah does not love', startSurah: 4, startAyah: 148 },
  { number: 7, arabicName: 'وَإِذَا سَمِعُوا', transliteration: 'Wa Iza Samiu', englishMeaning: 'And when they hear', startSurah: 5, startAyah: 82 },
  { number: 8, arabicName: 'وَلَوْ أَنَّنَا', transliteration: 'Wa Law Annana', englishMeaning: 'And if We', startSurah: 6, startAyah: 111 },
  { number: 9, arabicName: 'قَالَ الْمَلَأُ', transliteration: 'Qalal-Mala', englishMeaning: 'Said the chiefs', startSurah: 7, startAyah: 88 },
  { number: 10, arabicName: 'وَاعْلَمُوا', transliteration: 'Wa Aʿlamu', englishMeaning: 'And know', startSurah: 8, startAyah: 41 },
  { number: 11, arabicName: 'يَعْتَذِرُونَ', transliteration: 'Yaʿtadhiroon', englishMeaning: 'They make excuses', startSurah: 9, startAyah: 93 },
  { number: 12, arabicName: 'وَمَا مِنْ دَابَّةٍ', transliteration: 'Wa Ma Min Dabbah', englishMeaning: 'And there is no creature', startSurah: 11, startAyah: 6 },
  { number: 13, arabicName: 'وَمَا أُبَرِّئُ', transliteration: 'Wa Ma Ubarrir', englishMeaning: 'And I do not acquit', startSurah: 12, startAyah: 53 },
  { number: 14, arabicName: 'رُبَمَا', transliteration: 'Rubama', englishMeaning: 'Perhaps', startSurah: 15, startAyah: 1 },
  { number: 15, arabicName: 'سُبْحَانَ الَّذِي', transliteration: 'Subhan Alladhi', englishMeaning: 'Glory to Him', startSurah: 17, startAyah: 1 },
  { number: 16, arabicName: 'قَالَ أَلَمْ', transliteration: 'Qala Alam', englishMeaning: 'He said, Did he not', startSurah: 18, startAyah: 75 },
  { number: 17, arabicName: 'اقْتَرَبَ لِلنَّاسِ', transliteration: 'Aqtaraba Linnaas', englishMeaning: 'Mankind approached', startSurah: 21, startAyah: 1 },
  { number: 18, arabicName: 'قَدْ أَفْلَحَ', transliteration: 'Qad Aflaha', englishMeaning: 'Certainly he succeeded', startSurah: 23, startAyah: 1 },
  { number: 19, arabicName: 'وَقَالَ الَّذِينَ', transliteration: 'Wa Qalal-Ladhina', englishMeaning: 'And those who said', startSurah: 25, startAyah: 21 },
  { number: 20, arabicName: 'أَمَّنْ خَلَقَ', transliteration: 'A-man Khalaq', englishMeaning: 'He who created', startSurah: 27, startAyah: 56 },
  { number: 21, arabicName: 'اتْلُ مَا أُوحِيَ', transliteration: 'Utlou Ma Uhiya', englishMeaning: 'Recite what is revealed', startSurah: 29, startAyah: 46 },
  { number: 22, arabicName: 'وَمَنْ يَقْنُتْ', transliteration: 'Wa Man Yaqnut', englishMeaning: 'And whoever is devout', startSurah: 33, startAyah: 31 },
  { number: 23, arabicName: 'وَمَا لِيَ', transliteration: 'Wa Ma Liya', englishMeaning: 'And why should I not', startSurah: 36, startAyah: 22 },
  { number: 24, arabicName: 'فَمَنْ أَظْلَمُ', transliteration: 'Faman Azlam', englishMeaning: 'So who is more unjust', startSurah: 39, startAyah: 32 },
  { number: 25, arabicName: 'إِلَيْهِ يُرَدُّ', transliteration: 'Ilayhi Yuradd', englishMeaning: 'To Him it is returned', startSurah: 41, startAyah: 47 },
  { number: 26, arabicName: 'حَمَّ', transliteration: 'Ha Meem', englishMeaning: 'Ha Meem', startSurah: 46, startAyah: 1 },
  { number: 27, arabicName: 'قَالَ فَمَا خَطْبُكُمْ', transliteration: 'Qala Fama Khatbukum', englishMeaning: 'He said, what is your matter', startSurah: 51, startAyah: 31 },
  { number: 28, arabicName: 'قَدْ سَمِعَ اللَّهُ', transliteration: 'Qad SamiʿAllah', englishMeaning: 'Allah has heard', startSurah: 58, startAyah: 1 },
  { number: 29, arabicName: 'تَبَارَكَ الَّذِي', transliteration: 'Tabarak Alladhi', englishMeaning: 'Blessed is He', startSurah: 67, startAyah: 1 },
  { number: 30, arabicName: 'عَمَّ', transliteration: 'Amma', englishMeaning: 'About what', startSurah: 78, startAyah: 1 },
]

// ============== 114 SURAHS ==============
export const SURAHS: SurahMeta[] = [
  { number: 1, name: 'Al-Fatihah', arabicName: 'الفاتحة', englishMeaning: 'The Opening', ayahCount: 7, revelationType: 'Meccan', startJuz: 1 },
  { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة', englishMeaning: 'The Cow', ayahCount: 286, revelationType: 'Medinan', startJuz: 1 },
  { number: 3, name: 'Aal-i-Imran', arabicName: 'آل عمران', englishMeaning: 'The Family of Imran', ayahCount: 200, revelationType: 'Medinan', startJuz: 3 },
  { number: 4, name: 'An-Nisa', arabicName: 'النساء', englishMeaning: 'The Women', ayahCount: 176, revelationType: 'Medinan', startJuz: 4 },
  { number: 5, name: 'Al-Ma\'idah', arabicName: 'المائدة', englishMeaning: 'The Table Spread', ayahCount: 120, revelationType: 'Medinan', startJuz: 6 },
  { number: 6, name: 'Al-An\'am', arabicName: 'الأنعام', englishMeaning: 'The Cattle', ayahCount: 165, revelationType: 'Meccan', startJuz: 7 },
  { number: 7, name: 'Al-A\'raf', arabicName: 'الأعراف', englishMeaning: 'The Heights', ayahCount: 206, revelationType: 'Meccan', startJuz: 8 },
  { number: 8, name: 'Al-Anfal', arabicName: 'الأنفال', englishMeaning: 'The Spoils of War', ayahCount: 75, revelationType: 'Medinan', startJuz: 9 },
  { number: 9, name: 'At-Tawbah', arabicName: 'التوبة', englishMeaning: 'The Repentance', ayahCount: 129, revelationType: 'Medinan', startJuz: 10 },
  { number: 10, name: 'Yunus', arabicName: 'يونس', englishMeaning: 'Jonah', ayahCount: 109, revelationType: 'Meccan', startJuz: 11 },
  { number: 11, name: 'Hud', arabicName: 'هود', englishMeaning: 'Hud', ayahCount: 123, revelationType: 'Meccan', startJuz: 11 },
  { number: 12, name: 'Yusuf', arabicName: 'يوسف', englishMeaning: 'Joseph', ayahCount: 111, revelationType: 'Meccan', startJuz: 12 },
  { number: 13, name: 'Ar-Ra\'d', arabicName: 'الرعد', englishMeaning: 'The Thunder', ayahCount: 43, revelationType: 'Medinan', startJuz: 13 },
  { number: 14, name: 'Ibrahim', arabicName: 'إبراهيم', englishMeaning: 'Abraham', ayahCount: 52, revelationType: 'Meccan', startJuz: 13 },
  { number: 15, name: 'Al-Hijr', arabicName: 'الحجر', englishMeaning: 'The Rocky Tract', ayahCount: 99, revelationType: 'Meccan', startJuz: 14 },
  { number: 16, name: 'An-Nahl', arabicName: 'النحل', englishMeaning: 'The Bee', ayahCount: 128, revelationType: 'Meccan', startJuz: 14 },
  { number: 17, name: 'Al-Isra', arabicName: 'الإسراء', englishMeaning: 'The Night Journey', ayahCount: 111, revelationType: 'Meccan', startJuz: 15 },
  { number: 18, name: 'Al-Kahf', arabicName: 'الكهف', englishMeaning: 'The Cave', ayahCount: 110, revelationType: 'Meccan', startJuz: 15 },
  { number: 19, name: 'Maryam', arabicName: 'مريم', englishMeaning: 'Mary', ayahCount: 98, revelationType: 'Meccan', startJuz: 16 },
  { number: 20, name: 'Ta-Ha', arabicName: 'طه', englishMeaning: 'Ta-Ha', ayahCount: 135, revelationType: 'Meccan', startJuz: 16 },
  { number: 21, name: 'Al-Anbiya', arabicName: 'الأنبياء', englishMeaning: 'The Prophets', ayahCount: 112, revelationType: 'Meccan', startJuz: 17 },
  { number: 22, name: 'Al-Hajj', arabicName: 'الحج', englishMeaning: 'The Pilgrimage', ayahCount: 78, revelationType: 'Medinan', startJuz: 17 },
  { number: 23, name: 'Al-Mu\'minun', arabicName: 'المؤمنون', englishMeaning: 'The Believers', ayahCount: 118, revelationType: 'Meccan', startJuz: 18 },
  { number: 24, name: 'An-Nur', arabicName: 'النور', englishMeaning: 'The Light', ayahCount: 64, revelationType: 'Medinan', startJuz: 18 },
  { number: 25, name: 'Al-Furqan', arabicName: 'الفرقان', englishMeaning: 'The Criterion', ayahCount: 77, revelationType: 'Meccan', startJuz: 18 },
  { number: 26, name: 'Ash-Shu\'ara', arabicName: 'الشعراء', englishMeaning: 'The Poets', ayahCount: 227, revelationType: 'Meccan', startJuz: 19 },
  { number: 27, name: 'An-Naml', arabicName: 'النمل', englishMeaning: 'The Ant', ayahCount: 93, revelationType: 'Meccan', startJuz: 19 },
  { number: 28, name: 'Al-Qasas', arabicName: 'القصص', englishMeaning: 'The Stories', ayahCount: 88, revelationType: 'Meccan', startJuz: 20 },
  { number: 29, name: 'Al-Ankabut', arabicName: 'العنكبوت', englishMeaning: 'The Spider', ayahCount: 69, revelationType: 'Meccan', startJuz: 20 },
  { number: 30, name: 'Ar-Rum', arabicName: 'الروم', englishMeaning: 'The Romans', ayahCount: 60, revelationType: 'Meccan', startJuz: 21 },
  { number: 31, name: 'Luqman', arabicName: 'لقمان', englishMeaning: 'Luqman', ayahCount: 34, revelationType: 'Meccan', startJuz: 21 },
  { number: 32, name: 'As-Sajdah', arabicName: 'السجدة', englishMeaning: 'The Prostration', ayahCount: 30, revelationType: 'Meccan', startJuz: 21 },
  { number: 33, name: 'Al-Ahzab', arabicName: 'الأحزاب', englishMeaning: 'The Combined Forces', ayahCount: 73, revelationType: 'Medinan', startJuz: 21 },
  { number: 34, name: 'Saba', arabicName: 'سبأ', englishMeaning: 'Sheba', ayahCount: 54, revelationType: 'Meccan', startJuz: 22 },
  { number: 35, name: 'Fatir', arabicName: 'فاطر', englishMeaning: 'Originator', ayahCount: 45, revelationType: 'Meccan', startJuz: 22 },
  { number: 36, name: 'Ya-Sin', arabicName: 'يس', englishMeaning: 'Ya Sin', ayahCount: 83, revelationType: 'Meccan', startJuz: 22 },
  { number: 37, name: 'As-Saffat', arabicName: 'الصافات', englishMeaning: 'Those Who Set The Ranks', ayahCount: 182, revelationType: 'Meccan', startJuz: 23 },
  { number: 38, name: 'Sad', arabicName: 'ص', englishMeaning: 'The Letter Saad', ayahCount: 88, revelationType: 'Meccan', startJuz: 23 },
  { number: 39, name: 'Az-Zumar', arabicName: 'الزمر', englishMeaning: 'The Troops', ayahCount: 75, revelationType: 'Meccan', startJuz: 23 },
  { number: 40, name: 'Ghafir', arabicName: 'غافر', englishMeaning: 'The Forgiver', ayahCount: 85, revelationType: 'Meccan', startJuz: 24 },
  { number: 41, name: 'Fussilat', arabicName: 'فصلت', englishMeaning: 'Explained in Detail', ayahCount: 54, revelationType: 'Meccan', startJuz: 24 },
  { number: 42, name: 'Ash-Shura', arabicName: 'الشورى', englishMeaning: 'The Consultation', ayahCount: 53, revelationType: 'Meccan', startJuz: 25 },
  { number: 43, name: 'Az-Zukhruf', arabicName: 'الزخرف', englishMeaning: 'The Ornaments of Gold', ayahCount: 89, revelationType: 'Meccan', startJuz: 25 },
  { number: 44, name: 'Ad-Dukhan', arabicName: 'الدخان', englishMeaning: 'The Smoke', ayahCount: 59, revelationType: 'Meccan', startJuz: 25 },
  { number: 45, name: 'Al-Jathiyah', arabicName: 'الجاثية', englishMeaning: 'The Crouching', ayahCount: 37, revelationType: 'Meccan', startJuz: 25 },
  { number: 46, name: 'Al-Ahqaf', arabicName: 'الأحقاف', englishMeaning: 'The Wind-Curved Sandhills', ayahCount: 35, revelationType: 'Meccan', startJuz: 26 },
  { number: 47, name: 'Muhammad', arabicName: 'محمد', englishMeaning: 'Muhammad', ayahCount: 38, revelationType: 'Medinan', startJuz: 26 },
  { number: 48, name: 'Al-Fath', arabicName: 'الفتح', englishMeaning: 'The Victory', ayahCount: 29, revelationType: 'Medinan', startJuz: 26 },
  { number: 49, name: 'Al-Hujurat', arabicName: 'الحجرات', englishMeaning: 'The Rooms', ayahCount: 18, revelationType: 'Medinan', startJuz: 26 },
  { number: 50, name: 'Qaf', arabicName: 'ق', englishMeaning: 'The Letter Qaf', ayahCount: 45, revelationType: 'Meccan', startJuz: 26 },
  { number: 51, name: 'Adh-Dhariyat', arabicName: 'الذاريات', englishMeaning: 'The Winnowing Winds', ayahCount: 60, revelationType: 'Meccan', startJuz: 26 },
  { number: 52, name: 'At-Tur', arabicName: 'الطور', englishMeaning: 'The Mount', ayahCount: 49, revelationType: 'Meccan', startJuz: 27 },
  { number: 53, name: 'An-Najm', arabicName: 'النجم', englishMeaning: 'The Star', ayahCount: 62, revelationType: 'Meccan', startJuz: 27 },
  { number: 54, name: 'Al-Qamar', arabicName: 'القمر', englishMeaning: 'The Moon', ayahCount: 55, revelationType: 'Meccan', startJuz: 27 },
  { number: 55, name: 'Ar-Rahman', arabicName: 'الرحمن', englishMeaning: 'The Beneficent', ayahCount: 78, revelationType: 'Medinan', startJuz: 27 },
  { number: 56, name: 'Al-Waqi\'ah', arabicName: 'الواقعة', englishMeaning: 'The Inevitable', ayahCount: 96, revelationType: 'Meccan', startJuz: 27 },
  { number: 57, name: 'Al-Hadid', arabicName: 'الحديد', englishMeaning: 'The Iron', ayahCount: 29, revelationType: 'Medinan', startJuz: 27 },
  { number: 58, name: 'Al-Mujadila', arabicName: 'المجادلة', englishMeaning: 'The Pleading Woman', ayahCount: 22, revelationType: 'Medinan', startJuz: 28 },
  { number: 59, name: 'Al-Hashr', arabicName: 'الحشر', englishMeaning: 'The Exile', ayahCount: 24, revelationType: 'Medinan', startJuz: 28 },
  { number: 60, name: 'Al-Mumtahanah', arabicName: 'الممتحنة', englishMeaning: 'She That Is To Be Examined', ayahCount: 13, revelationType: 'Medinan', startJuz: 28 },
  { number: 61, name: 'As-Saff', arabicName: 'الصف', englishMeaning: 'The Ranks', ayahCount: 14, revelationType: 'Medinan', startJuz: 28 },
  { number: 62, name: 'Al-Jumu\'ah', arabicName: 'الجمعة', englishMeaning: 'The Congregation, Friday', ayahCount: 11, revelationType: 'Medinan', startJuz: 28 },
  { number: 63, name: 'Al-Munafiqun', arabicName: 'المنافقون', englishMeaning: 'The Hypocrites', ayahCount: 11, revelationType: 'Medinan', startJuz: 28 },
  { number: 64, name: 'At-Taghabun', arabicName: 'التغابن', englishMeaning: 'The Mutual Disillusion', ayahCount: 18, revelationType: 'Medinan', startJuz: 28 },
  { number: 65, name: 'At-Talaq', arabicName: 'الطلاق', englishMeaning: 'The Divorce', ayahCount: 12, revelationType: 'Medinan', startJuz: 28 },
  { number: 66, name: 'At-Tahrim', arabicName: 'التحريم', englishMeaning: 'The Prohibition', ayahCount: 12, revelationType: 'Medinan', startJuz: 28 },
  { number: 67, name: 'Al-Mulk', arabicName: 'الملك', englishMeaning: 'The Sovereignty', ayahCount: 30, revelationType: 'Meccan', startJuz: 29 },
  { number: 68, name: 'Al-Qalam', arabicName: 'القلم', englishMeaning: 'The Pen', ayahCount: 52, revelationType: 'Meccan', startJuz: 29 },
  { number: 69, name: 'Al-Haqqah', arabicName: 'الحاقة', englishMeaning: 'The Reality', ayahCount: 52, revelationType: 'Meccan', startJuz: 29 },
  { number: 70, name: 'Al-Ma\'arij', arabicName: 'المعارج', englishMeaning: 'The Ascending Stairways', ayahCount: 44, revelationType: 'Meccan', startJuz: 29 },
  { number: 71, name: 'Nuh', arabicName: 'نوح', englishMeaning: 'Noah', ayahCount: 28, revelationType: 'Meccan', startJuz: 29 },
  { number: 72, name: 'Al-Jinn', arabicName: 'الجن', englishMeaning: 'The Jinn', ayahCount: 28, revelationType: 'Meccan', startJuz: 29 },
  { number: 73, name: 'Al-Muzzammil', arabicName: 'المزمل', englishMeaning: 'The Enshrouded One', ayahCount: 20, revelationType: 'Meccan', startJuz: 29 },
  { number: 74, name: 'Al-Muddaththir', arabicName: 'المدثر', englishMeaning: 'The Cloaked One', ayahCount: 56, revelationType: 'Meccan', startJuz: 29 },
  { number: 75, name: 'Al-Qiyamah', arabicName: 'القيامة', englishMeaning: 'The Resurrection', ayahCount: 40, revelationType: 'Meccan', startJuz: 29 },
  { number: 76, name: 'Al-Insan', arabicName: 'الإنسان', englishMeaning: 'The Man', ayahCount: 31, revelationType: 'Medinan', startJuz: 29 },
  { number: 77, name: 'Al-Mursalat', arabicName: 'المرسلات', englishMeaning: 'The Emissaries', ayahCount: 50, revelationType: 'Meccan', startJuz: 29 },
  { number: 78, name: 'An-Naba', arabicName: 'النبأ', englishMeaning: 'The Tidings', ayahCount: 40, revelationType: 'Meccan', startJuz: 30 },
  { number: 79, name: 'An-Nazi\'at', arabicName: 'النازعات', englishMeaning: 'Those Who Drag Forth', ayahCount: 46, revelationType: 'Meccan', startJuz: 30 },
  { number: 80, name: 'Abasa', arabicName: 'عبس', englishMeaning: 'He Frowned', ayahCount: 42, revelationType: 'Meccan', startJuz: 30 },
  { number: 81, name: 'At-Takwir', arabicName: 'التكوير', englishMeaning: 'The Overthrowing', ayahCount: 29, revelationType: 'Meccan', startJuz: 30 },
  { number: 82, name: 'Al-Infitar', arabicName: 'الانفطار', englishMeaning: 'The Cleaving', ayahCount: 19, revelationType: 'Meccan', startJuz: 30 },
  { number: 83, name: 'Al-Mutaffifin', arabicName: 'المطففين', englishMeaning: 'The Defrauding', ayahCount: 36, revelationType: 'Meccan', startJuz: 30 },
  { number: 84, name: 'Al-Inshiqaq', arabicName: 'الانشقاق', englishMeaning: 'The Sundering', ayahCount: 25, revelationType: 'Meccan', startJuz: 30 },
  { number: 85, name: 'Al-Buruj', arabicName: 'البروج', englishMeaning: 'The Mansions of the Stars', ayahCount: 22, revelationType: 'Meccan', startJuz: 30 },
  { number: 86, name: 'At-Tariq', arabicName: 'الطارق', englishMeaning: 'The Morning Star', ayahCount: 17, revelationType: 'Meccan', startJuz: 30 },
  { number: 87, name: 'Al-A\'la', arabicName: 'الأعلى', englishMeaning: 'The Most High', ayahCount: 19, revelationType: 'Meccan', startJuz: 30 },
  { number: 88, name: 'Al-Ghashiyah', arabicName: 'الغاشية', englishMeaning: 'The Overwhelming', ayahCount: 26, revelationType: 'Meccan', startJuz: 30 },
  { number: 89, name: 'Al-Fajr', arabicName: 'الفجر', englishMeaning: 'The Dawn', ayahCount: 30, revelationType: 'Meccan', startJuz: 30 },
  { number: 90, name: 'Al-Balad', arabicName: 'البلد', englishMeaning: 'The City', ayahCount: 20, revelationType: 'Meccan', startJuz: 30 },
  { number: 91, name: 'Ash-Shams', arabicName: 'الشمس', englishMeaning: 'The Sun', ayahCount: 15, revelationType: 'Meccan', startJuz: 30 },
  { number: 92, name: 'Al-Layl', arabicName: 'الليل', englishMeaning: 'The Night', ayahCount: 21, revelationType: 'Meccan', startJuz: 30 },
  { number: 93, name: 'Ad-Duha', arabicName: 'الضحى', englishMeaning: 'The Morning Hours', ayahCount: 11, revelationType: 'Meccan', startJuz: 30 },
  { number: 94, name: 'Ash-Sharh', arabicName: 'الشرح', englishMeaning: 'The Relief', ayahCount: 8, revelationType: 'Meccan', startJuz: 30 },
  { number: 95, name: 'At-Tin', arabicName: 'التين', englishMeaning: 'The Fig', ayahCount: 8, revelationType: 'Meccan', startJuz: 30 },
  { number: 96, name: 'Al-Alaq', arabicName: 'العلق', englishMeaning: 'The Clot', ayahCount: 19, revelationType: 'Meccan', startJuz: 30 },
  { number: 97, name: 'Al-Qadr', arabicName: 'القدر', englishMeaning: 'The Power', ayahCount: 5, revelationType: 'Meccan', startJuz: 30 },
  { number: 98, name: 'Al-Bayyinah', arabicName: 'البينة', englishMeaning: 'The Clear Proof', ayahCount: 8, revelationType: 'Medinan', startJuz: 30 },
  { number: 99, name: 'Az-Zalzalah', arabicName: 'الزلزلة', englishMeaning: 'The Earthquake', ayahCount: 8, revelationType: 'Medinan', startJuz: 30 },
  { number: 100, name: 'Al-Adiyat', arabicName: 'العاديات', englishMeaning: 'The Courser', ayahCount: 11, revelationType: 'Meccan', startJuz: 30 },
  { number: 101, name: 'Al-Qari\'ah', arabicName: 'القارعة', englishMeaning: 'The Calamity', ayahCount: 11, revelationType: 'Meccan', startJuz: 30 },
  { number: 102, name: 'At-Takathur', arabicName: 'التكاثر', englishMeaning: 'The Rivalry in Worldly Increase', ayahCount: 8, revelationType: 'Meccan', startJuz: 30 },
  { number: 103, name: 'Al-Asr', arabicName: 'العصر', englishMeaning: 'The Declining Day', ayahCount: 3, revelationType: 'Meccan', startJuz: 30 },
  { number: 104, name: 'Al-Humazah', arabicName: 'الهمزة', englishMeaning: 'The Traducer', ayahCount: 9, revelationType: 'Meccan', startJuz: 30 },
  { number: 105, name: 'Al-Fil', arabicName: 'الفيل', englishMeaning: 'The Elephant', ayahCount: 5, revelationType: 'Meccan', startJuz: 30 },
  { number: 106, name: 'Quraysh', arabicName: 'قريش', englishMeaning: 'Quraysh', ayahCount: 4, revelationType: 'Meccan', startJuz: 30 },
  { number: 107, name: 'Al-Ma\'un', arabicName: 'الماعون', englishMeaning: 'The Small Kindnesses', ayahCount: 7, revelationType: 'Meccan', startJuz: 30 },
  { number: 108, name: 'Al-Kawthar', arabicName: 'الكوثر', englishMeaning: 'The Abundance', ayahCount: 3, revelationType: 'Meccan', startJuz: 30 },
  { number: 109, name: 'Al-Kafirun', arabicName: 'الكافرون', englishMeaning: 'The Disbelievers', ayahCount: 6, revelationType: 'Meccan', startJuz: 30 },
  { number: 110, name: 'An-Nasr', arabicName: 'النصر', englishMeaning: 'The Divine Support', ayahCount: 3, revelationType: 'Medinan', startJuz: 30 },
  { number: 111, name: 'Al-Masad', arabicName: 'المسد', englishMeaning: 'The Palm Fiber', ayahCount: 5, revelationType: 'Meccan', startJuz: 30 },
  { number: 112, name: 'Al-Ikhlas', arabicName: 'الإخلاص', englishMeaning: 'The Sincerity', ayahCount: 4, revelationType: 'Meccan', startJuz: 30 },
  { number: 113, name: 'Al-Falaq', arabicName: 'الفلق', englishMeaning: 'The Daybreak', ayahCount: 5, revelationType: 'Meccan', startJuz: 30 },
  { number: 114, name: 'An-Nas', arabicName: 'الناس', englishMeaning: 'Mankind', ayahCount: 6, revelationType: 'Meccan', startJuz: 30 },
]

// ============== HELPERS ==============

/** Get all surahs that appear in a given Juz. */
export function surahsInJuz(juzNumber: number): SurahMeta[] {
  // A surah appears in a Juz if the Juz starts within or before the surah,
  // and the next Juz starts in the same or later surah.
  const juzIdx = juzNumber - 1
  const juz = JUZ_LIST[juzIdx]
  const nextJuz = JUZ_LIST[juzIdx + 1]
  const startSurah = juz.startSurah
  const endSurah = nextJuz ? nextJuz.startSurah : 114
  return SURAHS.filter((s) => s.number >= startSurah && s.number <= endSurah)
}

/** Total ayah count across all 114 surahs. */
export const TOTAL_AYAHS = SURAHS.reduce((sum, s) => sum + s.ayahCount, 0) // 6236

/** Get a surah by number. */
export function getSurah(num: number): SurahMeta | undefined {
  return SURAHS.find((s) => s.number === num)
}

/** Get a Juz by number. */
export function getJuz(num: number): Juz | undefined {
  return JUZ_LIST.find((j) => j.number === num)
}

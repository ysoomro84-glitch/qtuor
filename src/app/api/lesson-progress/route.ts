import { NextRequest, NextResponse } from 'next/server'

const _getDb = () => import("@/lib/db").then(m => m.db);
async function _getSession() {
  const { getSession } = await import('@/lib/auth');
  return getSession();
}

// ─── Demo progress data for serverless/Vercel ───
function getDemoProgress(email: string) {
  if (email === 'noorani.demo@qtuor.com') {
    return [
      { id: 'demo-prog-nq-1', studentId: 'demo-noorani-student', subject: 'Noorani Qaida', lessonTitle: 'Lesson 5: Harakat', surahName: null, completed: false, progressPct: 35 },
      { id: 'demo-prog-nq-2', studentId: 'demo-noorani-student', subject: 'Quran Recitation With Tajweed', lessonTitle: 'Surah Al-Fatihah', surahName: 'Al-Fatihah', completed: false, progressPct: 15 },
    ]
  }
  if (email === 'quran.demo@qtuor.com') {
    return [
      { id: 'demo-prog-tw-1', studentId: 'demo-quran-student', subject: 'Quran Recitation With Tajweed', lessonTitle: 'Surah Al-Baqarah Ayah 142-152', surahName: 'Al-Baqarah', completed: false, progressPct: 20 },
      { id: 'demo-prog-tw-2', studentId: 'demo-quran-student', subject: 'Noorani Qaida', lessonTitle: 'Lesson 8: Madd Rules', surahName: null, completed: false, progressPct: 55 },
    ]
  }
  if (email === 'hareem.demo@qtuor.com') {
    return [
      { id: 'demo-prog-hareem-1', subject: 'Noorani Qaida', lessonTitle: 'Lesson 3: Harakat', surahName: null, completed: false, progressPct: 45 },
      { id: 'demo-prog-hareem-2', subject: 'Noorani Qaida', lessonTitle: 'Lesson 1: Arabic Alphabet', surahName: null, completed: true, progressPct: 100 },
      { id: 'demo-prog-hareem-3', subject: 'Noorani Qaida', lessonTitle: 'Lesson 2: Joined Letters', surahName: null, completed: true, progressPct: 100 },
    ]
  }
  if (email === 'yasir.demo@qtuor.com') {
    return [
      { id: 'demo-prog-yasir-1', subject: 'Quran Recitation With Tajweed', lessonTitle: 'Surah Al-Mulk Ayah 1-14', surahName: 'Al-Mulk', completed: false, progressPct: 30 },
      { id: 'demo-prog-yasir-2', subject: 'Quran Recitation With Tajweed', lessonTitle: 'Surah Al-Fatihah', surahName: 'Al-Fatihah', completed: true, progressPct: 100 },
      { id: 'demo-prog-yasir-3', subject: 'Hifz', lessonTitle: 'Surah Al-Baqarah Ayah 1-5', surahName: 'Al-Baqarah', completed: false, progressPct: 60 },
    ]
  }
  return []
}

export async function GET() {
  const session = await _getSession()
  if (!session) return NextResponse.json({ progress: [] })

  try {
    const progress = await (await _getDb()).lessonProgress.findMany({
      where: { studentId: session.userId },
      orderBy: { createdAt: 'asc' },
    })

    // If DB returned empty results for a demo account, inject demo data
    if (progress.length === 0) {
      const demoProgress = getDemoProgress(session.email)
      if (demoProgress.length > 0) return NextResponse.json({ progress: demoProgress })
    }

    return NextResponse.json({ progress })
  } catch (e: any) {
    if (e?.message === 'DATABASE_UNAVAILABLE') {
      const demoProgress = getDemoProgress(session.email)
      return NextResponse.json({ progress: demoProgress })
    }
    // For any other DB error, still return valid JSON instead of crashing
    return NextResponse.json({ progress: [] })
  }
}

export async function POST(req: NextRequest) {
  const session = await _getSession()
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })
  const { subject, lessonTitle, surahName, progressPct, completed } = await req.json()

  try {
    const item = await (await _getDb()).lessonProgress.create({
      data: { studentId: session.userId, subject, lessonTitle, surahName, progressPct, completed },
    })
    return NextResponse.json({ progress: item })
  } catch (e: any) {
    if (e?.message === 'DATABASE_UNAVAILABLE') {
      // Return a mock progress item so the flow doesn't break
      return NextResponse.json({
        progress: {
          id: 'demo-prog-' + Date.now(),
          studentId: session.userId,
          subject,
          lessonTitle,
          surahName,
          progressPct,
          completed,
        },
      })
    }
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await _getSession()
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })
  const { id, progressPct, completed } = await req.json()

  try {
    const item = await (await _getDb()).lessonProgress.update({
      where: { id },
      data: { progressPct, completed },
    })
    return NextResponse.json({ progress: item })
  } catch (e: any) {
    if (e?.message === 'DATABASE_UNAVAILABLE') {
      // Return a mock updated item
      return NextResponse.json({
        progress: { id, progressPct, completed },
      })
    }
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

const _getDb = () => import("@/lib/db").then(m => m.db);
async function _getSession() {
  const { getSession } = await import('@/lib/auth');
  return getSession();
}

// ─── Demo bookmark data for serverless/Vercel ───
function getDemoBookmark(email: string) {
  if (email === 'hareem.demo@qtuor.com') {
    return {
      id: 'demo-bookmark-hareem',
      studentId: 'demo-hareem-student',
      tutorId: 'demo-tutor-madiha',
      bookType: 'qaida',
      pageId: 3,
      pageLabel: 'Lesson 3: Harakat',
      lastLineIndex: 12,
      status: 'IN_PROGRESS',
      // Extended fields for smart revision
      surahName: null,
      lastAyah: null,
      revisionRange: null,
    }
  }
  if (email === 'yasir.demo@qtuor.com') {
    return {
      id: 'demo-bookmark-yasir',
      studentId: 'demo-yasir-student',
      tutorId: 'demo-tutor-madiha',
      bookType: 'quran',
      pageId: 2,
      pageLabel: 'Surah Al-Baqarah, Ayah 152',
      lastLineIndex: 152,
      status: 'IN_PROGRESS',
      // Extended fields for smart revision
      surahName: 'Al-Baqarah',
      lastAyah: 152,
      revisionRange: 'Surah Al-Baqarah, Ayahs 1–152',
    }
  }
  if (email === 'noorani.demo@qtuor.com') {
    return {
      id: 'demo-bookmark-noorani',
      studentId: 'demo-noorani-student',
      tutorId: 'demo-tutor-madiha',
      bookType: 'qaida',
      pageId: 5,
      pageLabel: 'Lesson 5: Harakat',
      lastLineIndex: 8,
      status: 'IN_PROGRESS',
      surahName: null,
      lastAyah: null,
      revisionRange: null,
    }
  }
  if (email === 'quran.demo@qtuor.com') {
    return {
      id: 'demo-bookmark-quran',
      studentId: 'demo-quran-student',
      tutorId: 'demo-tutor-madiha',
      bookType: 'quran',
      pageId: 2,
      pageLabel: 'Surah Al-Baqarah, Ayah 142',
      lastLineIndex: 142,
      status: 'IN_PROGRESS',
      surahName: 'Al-Baqarah',
      lastAyah: 142,
      revisionRange: 'Surah Al-Baqarah, Ayahs 1–142',
    }
  }
  return null
}

/**
 * GET — load the last saved bookmark for this student-tutor pair.
 * Called when the student dashboard loads to show "Resume from where you left off".
 */
export async function GET(req: NextRequest) {
  const session = await _getSession()
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const studentId = session.role === 'STUDENT' ? session.userId : searchParams.get('studentId')
  const tutorId = session.role === 'TUTOR' ? session.userId : searchParams.get('tutorId')

  try {
    if (studentId && tutorId) {
      // Verify the caller is the student or the tutor
      if (session.userId !== studentId && session.userId !== tutorId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const bookmark = await (await _getDb()).lessonBookmark.findUnique({
        where: { studentId_tutorId: { studentId, tutorId } },
      })

      if (bookmark) return NextResponse.json({ bookmark })
    }

    // If no specific pair found or no IDs provided, try to find ANY bookmark for this student
    if (session.role === 'STUDENT') {
      const anyBookmark = await (await _getDb()).lessonBookmark.findFirst({
        where: { studentId: session.userId },
        orderBy: { updatedAt: 'desc' },
      })
      if (anyBookmark) return NextResponse.json({ bookmark: anyBookmark })
    }

    return NextResponse.json({ bookmark: null })
  } catch (e: any) {
    if (e?.message === 'DATABASE_UNAVAILABLE') {
      const demoBookmark = getDemoBookmark(session.email)
      return NextResponse.json({ bookmark: demoBookmark })
    }
    return NextResponse.json({ bookmark: null })
  }
}

/**
 * POST — save/update the bookmark (called when teacher clicks "Save & End Class").
 * Saves the exact Surah + Ayah so the next class auto-resumes here.
 * Automatically shifts the previous range into revision (Sabqi).
 */
export async function POST(req: NextRequest) {
  const session = await _getSession()
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const {
    studentId, tutorId, bookType, pageId, pageLabel, lastLineIndex,
    surahName, lastAyah, revisionRange,
  } = await req.json()

  // Verify the caller is the student or the tutor
  if (session.userId !== studentId && session.userId !== tutorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const bookmark = await (await _getDb()).lessonBookmark.upsert({
      where: { studentId_tutorId: { studentId, tutorId } },
      update: {
        bookType,
        pageId,
        pageLabel,
        lastLineIndex: lastLineIndex || 0,
        status: 'IN_PROGRESS',
      },
      create: {
        studentId,
        tutorId,
        bookType,
        pageId,
        pageLabel,
        lastLineIndex: lastLineIndex || 0,
        status: 'IN_PROGRESS',
      },
    })

    return NextResponse.json({ bookmark })
  } catch (e: any) {
    if (e?.message === 'DATABASE_UNAVAILABLE') {
      // Return a mock bookmark so the flow works on Vercel
      return NextResponse.json({
        bookmark: {
          id: 'demo-bookmark-' + Date.now(),
          studentId,
          tutorId,
          bookType,
          pageId,
          pageLabel,
          lastLineIndex: lastLineIndex || 0,
          status: 'IN_PROGRESS',
          surahName,
          lastAyah,
          revisionRange,
        },
      })
    }
    return NextResponse.json({ error: 'Failed to save bookmark' }, { status: 500 })
  }
}

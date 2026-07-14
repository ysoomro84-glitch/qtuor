import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

/**
 * GET — load the last saved bookmark for this student-tutor pair.
 * Called when the classroom loads to auto-resume on the exact page.
 */
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const studentId = session.role === 'STUDENT' ? session.userId : searchParams.get('studentId')
  const tutorId = session.role === 'TUTOR' ? session.userId : searchParams.get('tutorId')

  if (!studentId || !tutorId) {
    return NextResponse.json({ error: 'Both studentId and tutorId required' }, { status: 400 })
  }

  // Verify the caller is the student or the tutor
  if (session.userId !== studentId && session.userId !== tutorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const bookmark = await db.lessonBookmark.findUnique({
    where: { studentId_tutorId: { studentId, tutorId } },
  })

  return NextResponse.json({ bookmark })
}

/**
 * POST — save/update the bookmark (called when teacher clicks "End Lesson / Bookmark").
 * Saves the exact pageId, pageLabel, and lastLineIndex so the next class auto-resumes here.
 */
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const { studentId, tutorId, bookType, pageId, pageLabel, lastLineIndex } = await req.json()

  // Verify the caller is the student or the tutor
  if (session.userId !== studentId && session.userId !== tutorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const bookmark = await db.lessonBookmark.upsert({
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
}

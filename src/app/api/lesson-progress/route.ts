import { NextRequest, NextResponse } from 'next/server'

const _getDb = () => import("@/lib/db").then(m => m.db);
const _getAuth = () => import("@/lib/auth").then(m => m.getSession);

export async function GET() {
  const session = (await _getAuth())
  if (!session) return NextResponse.json({ progress: [] })
  const progress = await (await _getDb()).lessonProgress.findMany({
    where: { studentId: session.userId },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ progress })
}

export async function POST(req: NextRequest) {
  const session = (await _getAuth())
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })
  const { subject, lessonTitle, surahName, progressPct, completed } = await req.json()
  const item = await (await _getDb()).lessonProgress.create({
    data: { studentId: session.userId, subject, lessonTitle, surahName, progressPct, completed },
  })
  return NextResponse.json({ progress: item })
}

export async function PATCH(req: NextRequest) {
  const session = (await _getAuth())
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })
  const { id, progressPct, completed } = await req.json()
  const item = await (await _getDb()).lessonProgress.update({
    where: { id },
    data: { progressPct, completed },
  })
  return NextResponse.json({ progress: item })
}

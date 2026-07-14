import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ progress: [] })
  const progress = await db.lessonProgress.findMany({
    where: { studentId: session.userId },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ progress })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })
  const { subject, lessonTitle, surahName, progressPct, completed } = await req.json()
  const item = await db.lessonProgress.create({
    data: { studentId: session.userId, subject, lessonTitle, surahName, progressPct, completed },
  })
  return NextResponse.json({ progress: item })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 })
  const { id, progressPct, completed } = await req.json()
  const item = await db.lessonProgress.update({
    where: { id },
    data: { progressPct, completed },
  })
  return NextResponse.json({ progress: item })
}

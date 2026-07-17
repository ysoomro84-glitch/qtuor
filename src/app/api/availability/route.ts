import { NextRequest, NextResponse } from 'next/server'

const _getDb = () => import("@/lib/db").then(m => m.db);
async function _getSession() {
  const { getSession } = await import('@/lib/auth');
  return getSession();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tutorId = searchParams.get('tutorId')
  const avail = await (await _getDb()).availability.findMany({ where: tutorId ? { tutorId } : {} })
  return NextResponse.json({ availabilities: avail })
}

export async function POST(req: NextRequest) {
  const session = await _getSession()
  if (!session || session.role !== 'TUTOR') {
    return NextResponse.json({ error: 'Tutor login required' }, { status: 401 })
  }
  const { slots } = await req.json() // slots: { [dayOfWeek]: [["hh:mm","hh:mm"]] }
  // Replace all availability for tutor
  await (await _getDb()).availability.deleteMany({ where: { tutorId: session.userId } })
  const created: any[] = []
  for (const dayStr of Object.keys(slots)) {
    const day = parseInt(dayStr)
    if (slots[day].length > 0) {
      created.push(
        (await _getDb()).availability.create({
          data: { tutorId: session.userId, dayOfWeek: day, slots: JSON.stringify(slots[day]) },
        })
      )
    }
  }
  await Promise.all(created)
  return NextResponse.json({ ok: true })
}

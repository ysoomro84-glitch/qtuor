import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

/** Admin-only: list + update message templates. */
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }
  const templates = await db.whatsAppTemplate.findMany({ orderBy: { key: 'asc' } })
  return NextResponse.json({ templates })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }
  const { id, template, enabled } = await req.json()
  const updated = await db.whatsAppTemplate.update({
    where: { id },
    data: {
      ...(typeof template === 'string' ? { template } : {}),
      ...(typeof enabled === 'boolean' ? { enabled } : {}),
    },
  })
  return NextResponse.json({ template: updated })
}

import { NextRequest, NextResponse } from 'next/server'

const _getDb = () => import("@/lib/db").then(m => m.db);
const _getAuth = () => import("@/lib/auth").then(m => m.getSession);

/** Admin-only: list + update message templates. */
export async function GET() {
  const session = (await _getAuth())
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }
  const templates = await (await _getDb()).whatsAppTemplate.findMany({ orderBy: { key: 'asc' } })
  return NextResponse.json({ templates })
}

export async function PATCH(req: NextRequest) {
  const session = (await _getAuth())
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }
  const { id, template, enabled } = await req.json()
  const updated = await (await _getDb()).whatsAppTemplate.update({
    where: { id },
    data: {
      ...(typeof template === 'string' ? { template } : {}),
      ...(typeof enabled === 'boolean' ? { enabled } : {}),
    },
  })
  return NextResponse.json({ template: updated })
}

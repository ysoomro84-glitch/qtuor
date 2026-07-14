import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const GATEWAY = 'http://localhost:3004'

/** Internal: send a WhatsApp message via the baileys gateway. Admin-only (for testing). */
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }
  const { to, message } = await req.json()
  try {
    const res = await fetch(`${GATEWAY}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message }),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.ok ? 200 : 502 })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Gateway offline' }, { status: 503 })
  }
}

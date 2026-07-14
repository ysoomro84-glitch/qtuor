import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const GATEWAY = 'http://localhost:3004'

/** Admin-only proxy to the whatsapp-gateway mini-service status endpoint. */
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }
  try {
    const res = await fetch(`${GATEWAY}/status`, { cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ connected: false, state: 'OFFLINE', phone: null, error: 'Gateway offline' }, { status: 200 })
  }
}

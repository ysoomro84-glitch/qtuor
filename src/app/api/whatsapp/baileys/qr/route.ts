import { NextResponse } from 'next/server'

const GATEWAY = 'http://localhost:3004'

/** Admin-only proxy to the whatsapp-gateway mini-service QR endpoint. */
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }
  try {
    const res = await fetch(`${GATEWAY}/qr`, { cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ qr: null, state: 'OFFLINE', error: 'Gateway offline' }, { status: 200 })
  }
}

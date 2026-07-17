import { NextRequest, NextResponse } from 'next/server'

async function _getSession() {
  const { getSession } = await import('@/lib/auth')
  return getSession()
}

const GATEWAY = 'http://localhost:3004'

/** Admin-only: disconnect the baileys session and clear auth. */
export async function POST() {
  const session = await _getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }
  try {
    const res = await fetch(`${GATEWAY}/disconnect`, { method: 'POST' })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Gateway offline' }, { status: 503 })
  }
}

import { NextResponse } from 'next/server'
import { getSession, clearSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ user: null })
  try {
    const { db } = await import('@/lib/db')
    const user = await db.user.findUnique({ where: { id: session.userId } })
    if (!user) {
      await clearSession()
      return NextResponse.json({ user: null })
    }
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        country: user.country,
        avatar: user.avatar,
      },
    })
  } catch (e) {
    // DB unavailable — return session info without DB lookup
    return NextResponse.json({ user: null })
  }
}

export async function DELETE() {
  await clearSession()
  return NextResponse.json({ ok: true })
}

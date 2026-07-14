import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { getSession, clearSession } = await import('@/lib/auth')
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
    } catch (dbErr: any) {
      // DB unavailable — return session info without DB lookup
      if (dbErr?.message === 'DATABASE_UNAVAILABLE') {
        return NextResponse.json({
          user: {
            id: session.userId,
            email: session.email,
            name: session.name,
            role: session.role,
            country: null,
            avatar: null,
          },
        })
      }
      return NextResponse.json({ user: null })
    }
  } catch {
    return NextResponse.json({ user: null })
  }
}

export async function DELETE() {
  try {
    const { clearSession } = await import('@/lib/auth')
    await clearSession()
  } catch {
    // ignore
  }
  return NextResponse.json({ ok: true })
}

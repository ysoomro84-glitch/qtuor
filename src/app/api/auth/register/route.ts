import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const { hashPassword, setSession } = await import('@/lib/auth')
    const body = await req.json()
    const { email, password, name, role = 'STUDENT' } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 })
    }

    const hashed = await hashPassword(password)
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashed,
        role,
        ...(body.country ? { country: body.country } : {}),
        ...(body.phone ? { phone: body.phone } : {}),
        ...(body.gender ? { gender: body.gender } : {}),
      },
    })

    await setSession({ userId: user.id, role: user.role as any, email: user.email, name: user.name })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }, { status: 201 })
  } catch (e: any) {
    const msg = e?.message || 'Registration failed.'
    if (msg === 'DATABASE_UNAVAILABLE') {
      return NextResponse.json({ error: 'Registration is temporarily unavailable. Please try again later.' }, { status: 503 })
    }
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

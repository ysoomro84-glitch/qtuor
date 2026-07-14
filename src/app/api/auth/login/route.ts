import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, setSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true, role: true, country: true, avatar: true },
    })
    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }
    await setSession({ userId: user.id, role: user.role as any, email: user.email, name: user.name })
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      country: user.country,
      avatar: user.avatar,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Login failed.' }, { status: 400 })
  }
}

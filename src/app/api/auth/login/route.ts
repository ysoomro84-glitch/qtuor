import { NextRequest, NextResponse } from 'next/server'

// Demo accounts for Vercel deployment (when DB is unavailable)
const DEMO_ACCOUNTS: Record<string, { password: string; id: string; name: string; role: string; country: string }> = {
  'student@qtuor.com': { password: 'student123', id: 'demo-student-1', name: 'Demo Student', role: 'STUDENT', country: 'Pakistan' },
  'abdullah@qtuor.com': { password: 'tutor123', id: 'demo-tutor-1', name: 'Sheikh Abdullah', role: 'TUTOR', country: 'Egypt' },
  'admin@qtuor.com': { password: 'admin123', id: 'demo-admin-1', name: 'Admin', role: 'ADMIN', country: 'Global' },
  'noorani.demo@qtuor.com': { password: 'demo1234', id: 'demo-noorani-student', name: 'Fatima Noor', role: 'STUDENT', country: 'Pakistan' },
  'quran.demo@qtuor.com': { password: 'demo1234', id: 'demo-quran-student', name: 'Ahmed Khan', role: 'STUDENT', country: 'United Kingdom' },
  'tutor.demo@qtuor.com': { password: 'tutor123', id: 'demo-tutor-ahmad', name: 'Qari Ahmad Raza', role: 'TUTOR', country: 'Pakistan' },
}

export async function POST(req: NextRequest) {
  let body: any = {}
  try {
    body = await req.json()
  } catch {
    // empty body
  }

  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  try {
    const { db } = await import('@/lib/db')
    const { verifyPassword, setSession } = await import('@/lib/auth')

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
    const msg = e?.message || 'Login failed.'

    // On Vercel (no SQLite), fall back to demo accounts
    if (msg === 'DATABASE_UNAVAILABLE') {
      const demo = DEMO_ACCOUNTS[email]
      if (demo && demo.password === password) {
        try {
          const { setSession } = await import('@/lib/auth')
          await setSession({ userId: demo.id, role: demo.role as any, email, name: demo.name })
        } catch {
          // setSession may fail on Vercel edge — still return success
        }
        return NextResponse.json({
          id: demo.id,
          email,
          name: demo.name,
          role: demo.role,
          country: demo.country,
          avatar: null,
        })
      }
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

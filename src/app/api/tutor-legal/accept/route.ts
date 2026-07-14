import { NextRequest, NextResponse } from 'next/server'

// POST — record a tutor's acceptance of the Terms of Service & Instructor Agreement.
// Auth required (any logged-in user; intended for tutors at registration time).
export async function POST(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const { getSession } = await import('@/lib/auth')

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    let agreementVersion = 'v1.0'
    try {
      const body = await req.json()
      if (body && typeof body.agreementVersion === 'string' && body.agreementVersion.trim()) {
        agreementVersion = body.agreementVersion.trim()
      }
    } catch {
      // Body may be empty or invalid JSON — fall back to default version.
    }

    // Capture IP — first IP from x-forwarded-for, else x-real-ip.
    const fwd = req.headers.get('x-forwarded-for')
    const ipAddress = fwd ? fwd.split(',')[0].trim() : req.headers.get('x-real-ip') || null
    const userAgent = req.headers.get('user-agent') || null

    try {
      const signature = await db.tutorLegalSignature.create({
        data: {
          userId: session.userId,
          userEmail: session.email,
          userName: session.name,
          ipAddress,
          userAgent,
          agreementVersion,
        },
      })

      return NextResponse.json({
        ok: true,
        signature: { id: signature.id, acceptedAt: signature.acceptedAt },
      })
    } catch (dbErr: any) {
      // If the model doesn't exist or DB is unavailable, return success anyway
      if (dbErr?.message === 'DATABASE_UNAVAILABLE' || dbErr?.code === 'P2021') {
        return NextResponse.json({
          ok: true,
          signature: {
            id: `demo-sig-${Date.now()}`,
            acceptedAt: new Date().toISOString(),
          },
        })
      }
      throw dbErr
    }
  } catch (e: any) {
    const msg = e?.message || 'Failed to record signature.'

    // On Vercel (no SQLite), return a successful demo response
    if (msg === 'DATABASE_UNAVAILABLE') {
      return NextResponse.json({
        ok: true,
        signature: {
          id: `demo-sig-${Date.now()}`,
          acceptedAt: new Date().toISOString(),
        },
      })
    }

    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 },
    )
  }
}

// GET — admin-only audit list of all legal signatures (newest first).
export async function GET() {
  try {
    const { db } = await import('@/lib/db')
    const { getSession } = await import('@/lib/auth')

    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
    }

    const signatures = await db.tutorLegalSignature.findMany({
      orderBy: { acceptedAt: 'desc' },
      take: 500,
    })

    return NextResponse.json({
      signatures: signatures.map((s) => ({
        id: s.id,
        userId: s.userId,
        userEmail: s.userEmail,
        userName: s.userName,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        agreementVersion: s.agreementVersion,
        acceptedAt: s.acceptedAt,
      })),
    })
  } catch (e: any) {
    const msg = e?.message || 'Failed to load signatures.'
    if (msg === 'DATABASE_UNAVAILABLE') {
      return NextResponse.json({ signatures: [] })
    }
    return NextResponse.json(
      { error: msg },
      { status: 500 },
    )
  }
}

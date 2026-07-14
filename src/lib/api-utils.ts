/**
 * Utility for API routes to handle database unavailability gracefully.
 *
 * On Vercel's serverless environment, the SQLite database is unavailable
 * (ephemeral filesystem). This helper catches Prisma errors and returns
 * fallback responses so the site still renders with demo content.
 */

import { NextResponse } from 'next/server'

export function isDbError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error)
  return msg === 'DATABASE_UNAVAILABLE' || msg.includes('prisma') || msg.includes('PrismaClient') || msg.includes('Can\'t reach database server')
}

/**
 * Wrap an API handler with a try/catch that returns a fallback response
 * when the database is unavailable.
 */
export function withFallback(
  handler: () => Promise<NextResponse>,
  fallback: () => NextResponse
): Promise<NextResponse> {
  return handler().catch((e) => {
    if (isDbError(e)) {
      console.warn('[API] Database unavailable, using fallback:', e?.message)
      return fallback()
    }
    console.error('[API] Unexpected error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  })
}

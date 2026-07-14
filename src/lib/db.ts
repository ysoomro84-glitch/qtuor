import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let _db: PrismaClient

// Check if DATABASE_URL is available before attempting to create PrismaClient.
// On Vercel's serverless environment, SQLite won't work and DATABASE_URL won't exist,
// so we proactively create a proxy that throws a consistent error.
if (!process.env.DATABASE_URL) {
  console.warn('[db] DATABASE_URL not set — creating DATABASE_UNAVAILABLE proxy')
  _db = new Proxy({} as PrismaClient, {
    get() {
      throw new Error('DATABASE_UNAVAILABLE')
    },
  }) as PrismaClient
} else {
  try {
    _db =
      globalForPrisma.prisma ??
      new PrismaClient({
        log: ['error', 'warn'],
      })
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = _db
  } catch (e) {
    console.warn('[db] PrismaClient initialization failed:', e)
    // Create a proxy that throws a consistent error for any method call
    _db = new Proxy({} as PrismaClient, {
      get() {
        throw new Error('DATABASE_UNAVAILABLE')
      },
    }) as PrismaClient
  }
}

export const db = _db

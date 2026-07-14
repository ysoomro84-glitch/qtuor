import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let _db: PrismaClient

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

export const db = _db

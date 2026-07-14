import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

/* ---------- GET admin list (all statuses) ---------- */
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }

  const posts = await db.blogPost.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      category: true,
      tags: true,
      featuredImage: true,
      readingTime: true,
      author: true,
      source: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ posts })
}

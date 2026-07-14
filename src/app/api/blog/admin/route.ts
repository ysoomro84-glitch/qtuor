import { NextResponse } from 'next/server'

const _getDb = () => import("@/lib/db").then(m => m.db);
const _getAuth = () => import("@/lib/auth").then(m => m.getSession);

/* ---------- GET admin list (all statuses) ---------- */
export async function GET() {
  const session = (await _getAuth())
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }

  const posts = await (await _getDb()).blogPost.findMany({
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

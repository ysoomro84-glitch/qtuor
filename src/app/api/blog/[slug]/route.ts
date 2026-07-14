import { NextRequest, NextResponse } from 'next/server'
import { FALLBACK_BLOG_POSTS } from '@/lib/fallback-data'

/* ---------- GET single post by slug ---------- */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  try {
    const { db } = await import('@/lib/db')
    const post = await db.blogPost.findUnique({ where: { slug } })
    if (post && post.status === 'PUBLISHED') {
      return NextResponse.json({ post })
    }
  } catch (e) {
    console.warn('[/api/blog/slug] Database unavailable, using fallback data:', (e as Error)?.message)
  }

  // Fallback
  const fallbackPost = FALLBACK_BLOG_POSTS.find((p) => p.slug === slug)
  if (fallbackPost) {
    return NextResponse.json({ post: fallbackPost })
  }
  return NextResponse.json({ error: 'Post not found' }, { status: 404 })
}

/* ---------- PATCH admin update ---------- */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { db } = await import('@/lib/db')
    const { getSession } = await import('@/lib/auth')
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
    }
    const { slug } = await ctx.params
    const existing = await db.blogPost.findUnique({ where: { slug } })
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    let body: unknown
    try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }
    const d = body as any
    const updated = await db.blogPost.update({
      where: { slug },
      data: {
        ...(d.title ? { title: d.title } : {}),
        ...(d.excerpt ? { excerpt: d.excerpt } : {}),
        ...(d.content ? { content: d.content } : {}),
        ...(d.category ? { category: d.category } : {}),
        ...(d.tags !== undefined ? { tags: d.tags || null } : {}),
        ...(d.featuredImage !== undefined ? { featuredImage: d.featuredImage || null } : {}),
        ...(d.readingTime ? { readingTime: d.readingTime } : {}),
        ...(d.status ? { status: d.status } : {}),
        ...(d.author ? { author: d.author } : {}),
      },
    })
    return NextResponse.json({ post: updated })
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}

/* ---------- DELETE admin ---------- */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { db } = await import('@/lib/db')
    const { getSession } = await import('@/lib/auth')
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
    }
    const { slug } = await ctx.params
    const existing = await db.blogPost.findUnique({ where: { slug }, select: { id: true } })
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    await db.blogPost.delete({ where: { slug } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}

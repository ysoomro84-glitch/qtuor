import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

function slugify(input: string): string {
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

async function uniqueSlug(base: string, excludeSlug?: string): Promise<string> {
  const slug = slugify(base) || `post-${Date.now()}`
  if (slug === excludeSlug) return slug
  const exists = await db.blogPost.findUnique({ where: { slug }, select: { id: true } })
  if (!exists) return slug
  const suffix = Math.random().toString(36).slice(2, 8)
  const candidate = `${slug}-${suffix}`
  const retry = await db.blogPost.findUnique({ where: { slug: candidate }, select: { id: true } })
  if (!retry) return candidate
  return `${slug}-${Date.now().toString(36)}`
}

/* ---------- GET single post by slug ---------- */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const post = await db.blogPost.findUnique({ where: { slug } })
  if (!post || post.status !== 'PUBLISHED') {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }
  return NextResponse.json({ post })
}

/* ---------- PATCH admin update ---------- */
const patchSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  excerpt: z.string().min(10).max(500).optional(),
  content: z.string().min(20).optional(),
  category: z.string().min(2).optional(),
  tags: z.string().optional().nullable(),
  featuredImage: z.string().optional().nullable(),
  readingTime: z.number().int().min(1).max(120).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  author: z.string().optional(),
})

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
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
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
  }
  const d = parsed.data

  // Regenerate slug only when the title actually changed
  let newSlug = existing.slug
  if (d.title && d.title !== existing.title) {
    newSlug = await uniqueSlug(d.title, existing.slug)
  }

  const updated = await db.blogPost.update({
    where: { slug },
    data: {
      ...(d.title !== undefined ? { title: d.title } : {}),
      ...(newSlug !== existing.slug ? { slug: newSlug } : {}),
      ...(d.excerpt !== undefined ? { excerpt: d.excerpt } : {}),
      ...(d.content !== undefined ? { content: d.content } : {}),
      ...(d.category !== undefined ? { category: d.category } : {}),
      ...(d.tags !== undefined ? { tags: d.tags || null } : {}),
      ...(d.featuredImage !== undefined ? { featuredImage: d.featuredImage || null } : {}),
      ...(d.readingTime !== undefined ? { readingTime: d.readingTime } : {}),
      ...(d.status !== undefined ? { status: d.status } : {}),
      ...(d.author !== undefined ? { author: d.author } : {}),
      ...(d.status === 'PUBLISHED' && existing.status !== 'PUBLISHED' ? { publishedAt: new Date() } : {}),
    },
  })

  return NextResponse.json({ post: updated })
}

/* ---------- DELETE admin ---------- */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
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
}

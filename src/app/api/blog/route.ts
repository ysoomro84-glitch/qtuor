import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

/* ---------- helpers ---------- */
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

/* ---------- GET public list ---------- */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')?.trim() || ''
  const search = searchParams.get('search')?.trim() || ''
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 100)

  const where: any = { status: 'PUBLISHED' }
  if (category && category !== 'all') where.category = category
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
    ]
  }

  const posts = await db.blogPost.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    take: limit,
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
      publishedAt: true,
    },
  })

  return NextResponse.json({ posts })
}

/* ---------- POST admin create ---------- */
const createSchema = z.object({
  title: z.string().min(3).max(200),
  excerpt: z.string().min(10).max(500),
  content: z.string().min(20),
  category: z.string().min(2),
  tags: z.string().optional().nullable(),
  featuredImage: z.string().optional().nullable(),
  readingTime: z.number().int().min(1).max(120).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  author: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
  }
  const d = parsed.data

  const slug = await uniqueSlug(d.title)
  const status = d.status || 'PUBLISHED'

  const post = await db.blogPost.create({
    data: {
      title: d.title,
      slug,
      excerpt: d.excerpt,
      content: d.content,
      category: d.category,
      tags: d.tags || null,
      featuredImage: d.featuredImage || null,
      readingTime: d.readingTime ?? 5,
      author: d.author || 'Qtuor Editorial',
      source: 'MANUAL',
      status,
      publishedAt: new Date(),
    },
  })

  return NextResponse.json({ post }, { status: 201 })
}

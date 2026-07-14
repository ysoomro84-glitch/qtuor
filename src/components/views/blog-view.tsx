'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { IslamicPatternBand, StarMedallion, BismillahHeader } from '@/components/brand/patterns'
import { useBlogPosts, useBlogPost } from '@/lib/queries'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  Clock,
  Search,
  Newspaper,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Tag,
  Loader2,
  PenLine,
} from 'lucide-react'

/* ---------- Types ---------- */
interface BlogPostCard {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  tags?: string | null
  featuredImage?: string | null
  readingTime: number
  author: string
  publishedAt: string
}

interface BlogPostFull extends BlogPostCard {
  content: string
  source: string
  status: string
}

/* ---------- Categories ---------- */
const CATEGORIES = [
  'All',
  'Tajweed Tips',
  'Parent Guides',
  'Quran Learning',
  'Arabic Grammar',
  'Hifz',
  'Islamic Education',
] as const

const CATEGORY_IMAGE: Record<string, string> = {
  'Tajweed Tips': '/subjects/quran-recitation.png',
  'Parent Guides': '/subjects/islamic-studies.png',
  'Quran Learning': '/subjects/quran-recitation.png',
  'Arabic Grammar': '/subjects/arabic-language.png',
  'Hifz': '/subjects/hifz.png',
  'Islamic Education': '/subjects/islamic-studies.png',
}

const FALLBACK_IMAGE = '/subjects/quran-recitation.png'

function imageForCategory(category: string, featured?: string | null): string {
  if (featured) return featured
  return CATEGORY_IMAGE[category] || FALLBACK_IMAGE
}

/* ============================================================
 * Article Card
 * ============================================================ */
function ArticleCard({ post, onOpen }: { post: BlogPostCard; onOpen: (slug: string) => void }) {
  return (
    <Card
      onClick={() => onOpen(post.slug)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(post.slug)
        }
      }}
      className="group relative flex cursor-pointer flex-col overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[oklch(0.34_0.13_256/0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.14_256)]"
    >
      {/* Featured image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <img
          src={imageForCategory(post.category, post.featuredImage)}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.20_0.10_258/0.35)] via-transparent to-transparent" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[oklch(0.78_0.15_85/0.95)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-md backdrop-blur">
          <Tag className="h-3 w-3" /> {post.category}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-[oklch(0.30_0.10_258)] transition-colors group-hover:text-[oklch(0.40_0.11_258)]">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[oklch(0.62_0.14_230)]" />
            {post.readingTime} min read
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[oklch(0.62_0.14_230)]" />
            {format(new Date(post.publishedAt), 'MMM d, yyyy')}
          </span>
        </div>
      </div>
    </Card>
  )
}

/* ============================================================
 * Skeleton card
 * ============================================================ */
function SkeletonCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="aspect-[16/10] w-full animate-pulse bg-muted" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-5 w-full animate-pulse rounded bg-muted" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
        <div className="flex justify-between border-t border-border/60 pt-3">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </Card>
  )
}

/* ============================================================
 * Post Detail Dialog
 * ============================================================ */
function PostDetailDialog({ slug, open, onOpenChange }: { slug: string | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data, isLoading, isError } = useBlogPost(open ? slug : null)

  const post: BlogPostFull | undefined = data?.post

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-3xl">
        {isLoading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[oklch(0.62_0.14_230)]" />
          </div>
        ) : isError || !post ? (
          <div className="flex h-72 flex-col items-center justify-center gap-2 px-6 text-center">
            <Newspaper className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Article not found</p>
            <p className="text-xs text-muted-foreground">This article may have been removed or unpublished.</p>
          </div>
        ) : (
          <div className="flex max-h-[92vh] flex-col">
            {/* Hero image */}
            <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden">
              <img
                src={imageForCategory(post.category, post.featuredImage)}
                alt={post.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.20_0.10_258/0.6)] via-transparent to-transparent" />
              <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-[oklch(0.78_0.15_85/0.95)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
                <Tag className="h-3.5 w-3.5" /> {post.category}
              </span>
            </div>

            {/* Scrollable body */}
            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-quran px-6 py-6 sm:px-8">
              <DialogHeader className="space-y-3 p-0 text-left">
                <DialogTitle className="text-2xl font-extrabold leading-tight text-[oklch(0.30_0.10_258)] sm:text-3xl">
                  {post.title}
                </DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <PenLine className="h-3.5 w-3.5" /> {post.author}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {post.readingTime} min read
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <p className="mt-5 border-l-2 border-[oklch(0.78_0.15_85)] bg-[oklch(0.78_0.15_85/0.08)] px-4 py-3 text-sm font-medium italic text-[oklch(0.40_0.11_258)]">
                {post.excerpt}
              </p>

              {/* Render the HTML content from the LLM/admin */}
              <article
                className="blog-content mt-6 text-[15px] leading-relaxed text-foreground/90"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Footer back button */}
              <div className="mt-8 border-t border-border/60 pt-5">
                <Button
                  variant="outline"
                  className="gap-1.5 border-[oklch(0.62_0.14_230/0.3)] text-[oklch(0.40_0.11_258)] hover:bg-[oklch(0.62_0.14_230/0.06)]"
                  onClick={() => onOpenChange(false)}
                >
                  <ArrowLeft className="h-4 w-4" /> Back to all articles
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ============================================================
 * Main view
 * ============================================================ */
export function BlogView() {
  const setView = useAppStore((s) => s.setView)
  const [category, setCategory] = React.useState<string>('All')
  const [searchInput, setSearchInput] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [activeSlug, setActiveSlug] = React.useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  // debounce search input
  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading, isError } = useBlogPosts({
    category: category === 'All' ? undefined : category,
    search: search || undefined,
  })
  const posts: BlogPostCard[] = data?.posts || []

  const openPost = (slug: string) => {
    setActiveSlug(slug)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col">
      {/* ===== Hero header ===== */}
      <section className="relative overflow-hidden border-b border-border/60 bg-[oklch(0.34_0.13_256)] text-white">
        <IslamicPatternBand opacity={0.14} />
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.30_0.10_258/0.65)] via-[oklch(0.34_0.13_256/0.4)] to-[oklch(0.78_0.15_85/0.18)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <BismillahHeader className="mb-4 text-white/85" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/85 ring-1 ring-white/15">
            <Newspaper className="h-3.5 w-3.5" /> Qtuor Blog
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Learn · Reflect · Excel
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/75 sm:text-lg">
            Insights, tips, and reflections on Tajweed, Hifz, Arabic and Quranic learning — curated
            for students, parents, and educators across the global Ummah.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2 text-white/60">
            <StarMedallion className="h-4 w-4 text-[oklch(0.78_0.15_85)]" />
            <span className="font-arabic text-sm" dir="rtl">رَبِّ زِدْنِي عِلْمًا</span>
            <StarMedallion className="h-4 w-4 text-[oklch(0.78_0.15_85)]" />
          </div>
        </div>
      </section>

      {/* ===== Controls + Grid ===== */}
      <section className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {/* Search + Category pills */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                  category === c
                    ? 'border-transparent bg-[oklch(0.34_0.13_256)] text-white shadow-sm'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted/60 hover:text-[oklch(0.40_0.11_258)]'
                )}
              >
                {c === 'All' && <Newspaper className="h-3.5 w-3.5" />}
                {c}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setSearch(searchInput.trim())
              }}
              placeholder="Search articles by title or excerpt…"
              className="h-10 rounded-full border-border bg-card pl-10 pr-4 text-sm"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : isError ? (
            <Card className="flex flex-col items-center gap-2 p-12 text-center">
              <Newspaper className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Couldn&apos;t load articles.</p>
              <p className="text-xs text-muted-foreground">Please try again shortly.</p>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 p-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(0.62_0.14_230/0.1)] text-[oklch(0.40_0.11_258)]">
                <Newspaper className="h-7 w-7" />
              </div>
              <p className="text-base font-bold text-foreground">No articles yet — check back soon.</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Our editors and AI engine are crafting new content. Try a different category or search term.
              </p>
            </Card>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Showing <strong className="text-foreground">{posts.length}</strong>{' '}
                  article{posts.length !== 1 ? 's' : ''}
                  {category !== 'All' && <> in <strong className="text-foreground">{category}</strong></>}
                  {search && <> matching <strong className="text-foreground">&ldquo;{search}&rdquo;</strong></>}
                </span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((p) => (
                  <ArticleCard key={p.id} post={p} onOpen={openPost} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* "Browse plans" CTA at the bottom */}
        <Card className="mt-12 overflow-hidden p-0">
          <div className="relative flex flex-col items-start gap-4 bg-gradient-to-br from-[oklch(0.34_0.13_256)] to-[oklch(0.40_0.11_258)] p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <IslamicPatternBand opacity={0.12} />
            <div className="relative">
              <h3 className="text-xl font-extrabold text-white sm:text-2xl">
                Ready to begin your Quran journey?
              </h3>
              <p className="mt-1 text-sm text-white/75">
                Explore subscription plans and book a free trial with a verified tutor today.
              </p>
            </div>
            <Button
              onClick={() => setView('plans')}
              className="relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[oklch(0.78_0.15_85)] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[oklch(0.72_0.15_85)]"
            >
              Browse plans <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </section>

      {/* ===== Detail dialog ===== */}
      <PostDetailDialog slug={activeSlug} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}

export default BlogView

/**
 * Qtuor — Auto-Blog Cron Service
 *
 * Generates SEO-friendly blog articles on a daily schedule using the
 * z-ai-web-dev-sdk LLM, and inserts them into the BlogPost table.
 *
 * Architecture:
 *  • Connects to the same SQLite database as the main app (via the main
 *    app's generated PrismaClient).
 *  • No HTTP server — pure setInterval cron.
 *  • Runs once on startup if no post has been created in the last 20 hours,
 *    then every 24 hours thereafter.
 *  • Each run picks ONE topic from the rotation, asks the LLM to write a
 *    600-900 word HTML article, parses the JSON response and creates a
 *    BlogPost with source='AUTO', status='PUBLISHED'.
 *
 * Logs to stdout with timestamps — visible in /home/z/my-project/blog-cron.log.
 */

// Use the main app's generated Prisma client (mirrors class-reminder-cron pattern)
import { PrismaClient } from '/home/z/my-project/node_modules/@prisma/client'
import ZAI from 'z-ai-web-dev-sdk'

const db = new PrismaClient()

const RUN_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 hours
const SKIP_IF_NEWER_THAN_MS = 20 * 60 * 60 * 1000 // skip startup run if a post exists from the last 20h

/* ---------- Topic catalogue ---------- */
interface TopicDef {
  category: string
  prompt: string
  featuredImage: string
}

const TOPICS: TopicDef[] = [
  {
    category: 'Tajweed Tips',
    featuredImage: '/subjects/quran-recitation.png',
    prompt:
      'Write an SEO-friendly article titled "5 Common Tajweed Mistakes Beginners Make (And How to Fix Them)". Cover: silent letters, madd rules, ghunnah, and idgham. Give concrete examples using short surahs. Tone: warm, encouraging, for non-Arabic-speaking students.',
  },
  {
    category: 'Tajweed Tips',
    featuredImage: '/subjects/quran-recitation.png',
    prompt:
      'Write an SEO-friendly article titled "Understanding the Rules of Madd: A Beginner\'s Guide". Explain natural madd (2 harakat) vs extended madd, with examples. Tone: clear, educational.',
  },
  {
    category: 'Parent Guides',
    featuredImage: '/subjects/islamic-studies.png',
    prompt:
      'Write an SEO-friendly article titled "How to Choose the Right Quran Tutor for Your Child". Discuss verification, trial classes, learning style, parental monitoring, and age-appropriate pedagogy. Tone: reassuring, practical for Muslim parents worldwide.',
  },
  {
    category: 'Parent Guides',
    featuredImage: '/subjects/islamic-studies.png',
    prompt:
      'Write an SEO-friendly article titled "Building a Daily Quran Routine for Kids at Home". Discuss 10-minute habit stacking, rewards, and consistency. Tone: gentle, motivational.',
  },
  {
    category: 'Quran Learning',
    featuredImage: '/subjects/quran-recitation.png',
    prompt:
      'Write an SEO-friendly article titled "How Long Does It Take to Learn to Read the Quran?". Break down realistic timelines for Noorani Qaida, recitation, and basic Tajweed across age groups. Tone: encouraging and realistic.',
  },
  {
    category: 'Quran Learning',
    featuredImage: '/subjects/quran-recitation.png',
    prompt:
      'Write an SEO-friendly article titled "Online vs In-Person Quran Classes: Which Is Right for You?". Compare flexibility, cost, accountability, and tech tools. Tone: balanced, informative.',
  },
  {
    category: 'Arabic Grammar',
    featuredImage: '/subjects/arabic-language.png',
    prompt:
      'Write an SEO-friendly article titled "Arabic Pronouns Demystified: A Quick Reference for Quran Students". Cover detached and attached pronouns with examples from short surahs. Tone: structured, scholarly but accessible.',
  },
  {
    category: 'Arabic Grammar',
    featuredImage: '/subjects/arabic-language.png',
    prompt:
      'Write an SEO-friendly article titled "The Three Cases of the Arabic Noun: Nominative, Accusative, Genitive". Explain with simple examples. Tone: clear, beginner-friendly.',
  },
  {
    category: 'Hifz',
    featuredImage: '/subjects/hifz.png',
    prompt:
      'Write an SEO-friendly article titled "Memorizing the Quran: 7 Proven Techniques That Actually Work". Cover repetition schedules, the 3x method, listening, and revision plans. Tone: motivational and practical.',
  },
  {
    category: 'Hifz',
    featuredImage: '/subjects/hifz.png',
    prompt:
      'Write an SEO-friendly article titled "How to Maintain Your Hifz After Ramadan". Discuss morning revision, parent involvement, and avoiding burnout. Tone: warm, encouraging.',
  },
  {
    category: 'Islamic Education',
    featuredImage: '/subjects/islamic-studies.png',
    prompt:
      'Write an SEO-friendly article titled "The Etiquette (Adab) of Learning the Quran". Cover intention, respect for the Mushaf, wudu, and listening attentively. Tone: reflective, spiritual.',
  },
  {
    category: 'Islamic Education',
    featuredImage: '/subjects/islamic-studies.png',
    prompt:
      'Write an SEO-friendly article titled "Why Every Muslim Family Should Prioritize Quran Education". Discuss spiritual, social, and intergenerational benefits. Tone: inspirational, community-oriented.',
  },
]

/* ---------- Helpers ---------- */
function ts(): string {
  return new Date().toISOString()
}

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

function pickTopic(): TopicDef {
  // Rotate topic based on current post count for variety
  return TOPICS[Math.floor(Math.random() * TOPICS.length)]
}

/**
 * Extract the JSON object from the LLM's raw response. The LLM may wrap
 * the JSON in ```json ... ``` fences or prefix it with text — we try a few
 * strategies before giving up.
 */
function extractJson(raw: string): unknown | null {
  if (!raw) return null
  // Try direct parse first
  try {
    return JSON.parse(raw)
  } catch {
    /* keep trying */
  }
  // Strip ``` fences
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1])
    } catch {
      /* keep trying */
    }
  }
  // Find the first { ... } block
  const first = raw.indexOf('{')
  const last = raw.lastIndexOf('}')
  if (first !== -1 && last !== -1 && last > first) {
    try {
      return JSON.parse(raw.slice(first, last + 1))
    } catch {
      /* give up */
    }
  }
  return null
}

function coerceArticle(parsed: any, fallbackCategory: string, fallbackImage: string) {
  if (!parsed || typeof parsed !== 'object') return null
  const title = typeof parsed.title === 'string' ? parsed.title.trim() : ''
  const excerpt = typeof parsed.excerpt === 'string' ? parsed.excerpt.trim() : ''
  const content = typeof parsed.content === 'string' ? parsed.content.trim() : ''
  const category =
    typeof parsed.category === 'string' && parsed.category.trim().length > 0
      ? parsed.category.trim()
      : fallbackCategory
  const readingTime =
    typeof parsed.readingTime === 'number' && parsed.readingTime > 0
      ? Math.min(Math.max(Math.round(parsed.readingTime), 1), 60)
      : Math.max(3, Math.round(content.split(/\s+/).length / 200))

  if (!title || !excerpt || !content || content.length < 100) {
    return null
  }
  return { title, excerpt, content, category, readingTime, featuredImage: fallbackImage }
}

/* ---------- Main generation routine ---------- */
async function generateAndStoreArticle(): Promise<boolean> {
  const topic = pickTopic()
  console.log(`[blog-cron] [${ts()}] Starting article generation — category: "${topic.category}"`)

  let zai: ZAI | null = null
  try {
    zai = await ZAI.create()
  } catch (err) {
    console.error(`[blog-cron] [${ts()}] Failed to initialize ZAI SDK:`, err)
    return false
  }

  const systemPrompt =
    'You are a thoughtful SEO content writer for Qtuor, a global online Quran learning platform. ' +
    'You write clear, accurate, respectful articles for Muslim students and parents worldwide. ' +
    'Always respond with STRICT JSON — no prose, no markdown fences, no commentary.'

  const userPrompt = `${topic.prompt}

Respond with STRICT JSON in EXACTLY this shape (no extra keys, no markdown):
{
  "title": "string (max 90 chars)",
  "excerpt": "string (1-2 sentence summary, max 220 chars)",
  "category": "${topic.category}",
  "content": "<h2>Section Title</h2><p>...</p><h2>...</h2><p>...</p>... (HTML only, 600-900 words, 3-5 H2 sections, no inline styles, no scripts, no images)",
  "readingTime": <integer minutes, 4-12>
}

Important:
- The "content" field MUST be valid HTML using only <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote> tags.
- Do NOT wrap the response in markdown fences.
- Do NOT include any commentary outside the JSON object.`

  let completion: any
  try {
    completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      thinking: { type: 'disabled' },
    })
  } catch (err) {
    console.error(`[blog-cron] [${ts()}] LLM call failed:`, err)
    return false
  }

  // Extract text content from the completion response
  const raw: string =
    completion?.choices?.[0]?.message?.content ??
    completion?.message?.content ??
    completion?.content ??
    ''
  if (!raw) {
    console.error(`[blog-cron] [${ts()}] LLM returned empty content. Full response:`, JSON.stringify(completion).slice(0, 500))
    return false
  }

  const parsed = extractJson(raw)
  if (!parsed) {
    console.error(`[blog-cron] [${ts()}] Failed to parse JSON from LLM response. Raw (first 500 chars):`, raw.slice(0, 500))
    return false
  }

  const article = coerceArticle(parsed, topic.category, topic.featuredImage)
  if (!article) {
    console.error(`[blog-cron] [${ts()}] Parsed JSON missing required fields. Parsed:`, JSON.stringify(parsed).slice(0, 500))
    return false
  }

  // Build a unique slug — append a short timestamp suffix to avoid collisions
  const baseSlug = slugify(article.title) || `article-${Date.now()}`
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  // Sanity check the slug is unique (extremely likely, but just in case)
  const existing = await db.blogPost.findUnique({ where: { slug }, select: { id: true } })
  if (existing) {
    console.warn(`[blog-cron] [${ts()}] Slug collision (very unlikely) — skipping this run.`)
    return false
  }

  try {
    const post = await db.blogPost.create({
      data: {
        title: article.title.slice(0, 200),
        slug,
        excerpt: article.excerpt.slice(0, 500),
        content: article.content,
        category: article.category,
        tags: topic.category.toLowerCase(),
        featuredImage: article.featuredImage,
        readingTime: article.readingTime,
        author: 'Qtuor Editorial',
        source: 'AUTO',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    })
    console.log(`[blog-cron] [${ts()}] ✓ Created blog post "${post.title}" (slug=${post.slug}, ${article.readingTime} min read)`)
    return true
  } catch (err) {
    console.error(`[blog-cron] [${ts()}] DB insert failed:`, err)
    return false
  }
}

/* ---------- Scheduler ---------- */
async function maybeRun(reason: 'startup' | 'interval'): Promise<void> {
  console.log(`[blog-cron] [${ts()}] Tick (${reason}) — checking if a new article should be generated…`)

  // On startup, skip if a post was created within the last 20h (avoid duplicate runs on restart)
  if (reason === 'startup') {
    const cutoff = new Date(Date.now() - SKIP_IF_NEWER_THAN_MS)
    const recent = await db.blogPost.findFirst({
      where: { publishedAt: { gte: cutoff } },
      orderBy: { publishedAt: 'desc' },
      select: { title: true, publishedAt: true },
    })
    if (recent) {
      console.log(
        `[blog-cron] [${ts()}] Skipping startup run — most recent post "${recent.title}" was published at ${recent.publishedAt.toISOString()} (within the 20h window).`
      )
      return
    }
  }

  try {
    await generateAndStoreArticle()
  } catch (err) {
    console.error(`[blog-cron] [${ts()}] Unhandled error in generateAndStoreArticle:`, err)
  }
}

// Run on startup
maybeRun('startup').then(() => {
  console.log(`[blog-cron] [${ts()}] Startup run complete. Scheduling next runs every 24h.`)
})

// Schedule every 24h
setInterval(() => {
  maybeRun('interval').catch((err) => {
    console.error(`[blog-cron] [${ts()}] Interval run failed:`, err)
  })
}, RUN_INTERVAL_MS)

console.log(`[blog-cron] [${ts()}] Service started — generating 1 article per 24h (interval ${RUN_INTERVAL_MS / 1000 / 3600}h)`)

process.on('SIGTERM', () => { process.exit(0) })
process.on('SIGINT', () => { process.exit(0) })

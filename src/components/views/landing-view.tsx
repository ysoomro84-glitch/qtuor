'use client'

import * as React from 'react'
import { useAppStore } from '@/lib/store'
import { useTutors } from '@/lib/queries'
import { CATEGORIES, SUBJECTS } from '@/lib/constants'
import { SUBJECT_CONTENT } from '@/lib/subject-content'
import { TutorRowCard, SectionHeading } from '@/components/shared/tutor-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/shared/avatar'
import { StarMedallion, IslamicPatternBand } from '@/components/brand/patterns'
import { StarRating } from '@/components/brand/badges'
import {
  Search, Sparkles, BookOpen, Brain, Languages, Moon, ScrollText, Video, PenTool, Mic,
  ShieldCheck, Globe2, Users, GraduationCap, ArrowRight, Play, Calendar, Wallet, Lock, Star, Quote
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const SUBJECT_ICONS: Record<string, any> = {
  'Noorani Qaida': BookOpen,
  'Quran Recitation With Tajweed': Sparkles,
  Hifz: Brain,
  'Arabic Language': Languages,
  Tafsir: ScrollText,
  'Islamic Studies': Moon,
}

export function LandingView() {
  const { setView, setCategory, setSearch, openAuth, setActiveSubject } = useAppStore()
  const { data } = useTutors({ sort: 'rating' })
  const [heroSearch, setHeroSearch] = React.useState('')
  const [activeCat, setActiveCat] = React.useState('all')

  const topTutors = (data?.tutors || []).slice(0, 4)

  const goToMarket = (cat?: string, search?: string) => {
    if (cat) {
      setActiveCat(cat)
      setCategory(cat)
    }
    if (typeof search === 'string') setSearch(search)
    setView('marketplace')
  }

  const goToSubject = (key: string) => {
    setActiveSubject(key)
    setView('subject')
  }

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(heroSearch)
    setCategory(activeCat)
    setView('marketplace')
  }

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh" />
        <IslamicPatternBand opacity={0.06} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 flex justify-center">
              <div className="flex items-center gap-3">
                <StarMedallion className="h-5 w-5 text-primary/50" />
                <span
                  className="text-2xl text-primary/80 sm:text-3xl"
                  style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}
                  dir="rtl"
                >
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </span>
                <StarMedallion className="h-5 w-5 text-primary/50" />
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.62_0.14_230/0.3)] bg-[oklch(0.62_0.14_230/0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[oklch(0.40_0.11_258)]">
              <Globe2 className="h-3.5 w-3.5" /> 500+ Certified Tutors · 60+ Countries
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Connect with Certified <span className="text-gradient-blue">Quran Tutors</span> Globally
            </h1>
            <p className="mt-5 text-lg text-muted-foreground sm:text-xl">
              Learn Noorani Qaida, Quran Recitation With Tajweed, Hifz, and Arabic in a real-time interactive virtual classroom.
              Book a <span className="font-semibold text-primary">free 30-minute trial</span> today.
            </p>

            {/* Search bar */}
            <form onSubmit={handleHeroSearch} className="mx-auto mt-8 flex max-w-2xl items-stretch gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search tutors by name, subject, or language..."
                  className="rounded-xl border-2 border-border bg-white pl-11 pr-4 py-3 text-base shadow-sm focus-visible:border-[oklch(0.62_0.14_230)]"
                  style={{ height: '52px' }}
                />
              </div>
              <Button
                type="submit"
                className="rounded-xl bg-primary px-7 text-base text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                style={{ height: '52px', boxShadow: '0 4px 14px rgba(11, 37, 69, 0.2)' }}
              >
                <Search className="mr-1.5 h-4 w-4" /> Search
              </Button>
            </form>

            {/* Quick category filters — link to subject pages */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => (c.key === 'all' ? goToMarket() : goToSubject(c.key))}
                  className={cn(
                    'cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-300',
                    activeCat === c.key
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-white/70 text-foreground hover:border-[oklch(0.62_0.14_230)] hover:bg-[oklch(0.62_0.14_230/0.08)] hover:text-[oklch(0.40_0.11_258)]'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[oklch(0.62_0.14_230)]" /> Verified & Ijaza-certified</span>
              <span className="inline-flex items-center gap-1.5"><Video className="h-4 w-4 text-[oklch(0.62_0.14_230)]" /> Interactive virtual classroom</span>
              <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 text-[oklch(0.78_0.15_85)]" /> 4.9/5 average rating</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ SUBJECTS GRID ============ */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <SectionHeading
            eyebrow="What you can learn"
            title="Six paths to mastery"
            subtitle="From your first Arabic letter to memorizing the entire Quran — find your path. Click any subject to learn more."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SUBJECT_CONTENT.map((s) => {
              const Icon = SUBJECT_ICONS[s.key] || BookOpen
              return (
                <button
                  key={s.key}
                  onClick={() => goToSubject(s.key)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
                >
                  {/* Image header */}
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={s.heroImage}
                      alt={s.label}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.20_0.10_258/0.9)] via-[oklch(0.25_0.10_258/0.4)] to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                        style={{ background: s.accentColor }}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-white">{s.label}</div>
                        <div className="font-arabic text-xs text-white/70" dir="rtl">{s.arabic}</div>
                      </div>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex flex-1 flex-col p-4">
                    <p className="line-clamp-2 text-xs text-muted-foreground">{s.tagline}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {s.stats.slice(0, 2).map((st) => (
                        <span key={st.label} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                          <strong>{st.value}</strong> {st.label}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto pt-3">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-semibold transition group-hover:gap-2"
                        style={{ color: s.accentColor }}
                      >
                        Learn more <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============ TOP TUTORS (HORIZONTAL CARDS) ============ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            center={false}
            eyebrow="Meet our educators"
            title="Featured certified tutors"
            subtitle="Hand-picked, verified, and rated by thousands of students worldwide."
          />
          <Button variant="outline" onClick={() => goToMarket()} className="gap-1.5 shrink-0">
            View all tutors <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-8 space-y-4">
          {topTutors.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">Loading tutors...</Card>
          )}
          {topTutors.map((t) => (
            <TutorRowCard key={t.id} tutor={t} onView={() => goToMarket()} hidePricing />
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="relative overflow-hidden bg-[oklch(0.30_0.10_258)] text-white">
        <IslamicPatternBand opacity={0.05} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
              <GraduationCap className="h-3.5 w-3.5" /> How it works
            </span>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Start learning in 4 simple steps</h2>
            <p className="mt-3 text-white/70">From sign-up to your first class in under 10 minutes.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: '1', icon: Users, title: 'Create your account', desc: 'Sign up free as a student. No commitment, no card required.' },
              { n: '2', icon: Video, title: 'Book a free trial', desc: 'Get a one-time 30-minute free class with any verified tutor.' },
              { n: '3', icon: Sparkles, title: 'Pick a monthly plan', desc: 'Choose a subscription that fits your pace — 8, 16, or 24 classes per month.' },
              { n: '4', icon: Play, title: 'Enter the classroom', desc: 'Launch the interactive virtual classroom at your scheduled time.' },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <div className="absolute -top-3 -left-3 flex h-9 w-9 items-center justify-center rounded-full bg-[oklch(0.62_0.14_230)] text-sm font-bold text-white shadow-lg">
                  {step.n}
                </div>
                <step.icon className="h-8 w-8 text-[oklch(0.62_0.14_230)]" />
                <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-white/70">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ VIRTUAL CLASSROOM SHOWCASE ============ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.62_0.14_230/0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[oklch(0.40_0.11_258)]">
              <Video className="h-3.5 w-3.5" /> The Core Engine
            </span>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">A classroom built for the Quran</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Not just video calls. Our custom interactive classroom is designed specifically for Quran learning —
              with a digital Quran viewer, click-to-highlight syncing, drawing tools, and parental safety monitoring.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                { icon: BookOpen, title: 'Interactive Digital Quran & Qaida', desc: 'Vector-based pages. Click any word to instantly highlight it in light blue on your student\'s screen.' },
                { icon: PenTool, title: 'Drawing & Pointer tools', desc: 'Pen, eraser, and pointer for drawing directly over Quran text — synced in real time via WebSockets.' },
                { icon: Mic, title: 'HD audio & video', desc: 'Crystal-clear WebRTC streaming so every Tajweed nuance is heard perfectly.' },
                { icon: ShieldCheck, title: 'Parental Watch & Safety', desc: 'Random 10-second safety snapshots saved to the parent dashboard. Optional cloud recording.' },
              ].map((f) => (
                <li key={f.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.62_0.14_230/0.1)] text-[oklch(0.40_0.11_258)]">
                    <f.icon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h4 className="font-semibold">{f.title}</h4>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => openAuth('register')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Try the classroom free <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setView('plans')}>See pricing</Button>
            </div>
          </div>

          {/* Classroom preview mockup */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[oklch(0.62_0.14_230/0.15)] to-[oklch(0.78_0.15_85/0.1)] blur-2xl" />
            <Card className="relative overflow-hidden rounded-2xl border-2 border-border shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <span className="ml-2 text-xs font-medium text-muted-foreground">Qtuor Classroom — Live</span>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> REC
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 p-3">
                {/* Video feeds */}
                <div className="col-span-1 space-y-2">
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-[oklch(0.34_0.13_256)] to-[oklch(0.55_0.12_250)] p-3 flex items-end">
                    <span className="text-xs font-medium text-white/90">Teacher</span>
                  </div>
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-[oklch(0.55_0.12_250)] to-[oklch(0.62_0.14_230)] p-3 flex items-end">
                    <span className="text-xs font-medium text-white/90">You</span>
                  </div>
                </div>
                {/* Quran page */}
                <div className="col-span-2 rounded-lg bg-[oklch(0.98_0.01_60)] p-3">
                  <div className="text-center text-[10px] font-arabic text-[oklch(0.30_0.10_258)]" dir="rtl">
                    <div className="font-arabic text-sm leading-relaxed">
                      بِسْمِ <span className="rounded bg-[oklch(0.62_0.14_230/0.3)] px-0.5">اللَّهِ</span> الرَّحْمَٰنِ الرَّحِيمِ
                    </div>
                    <div className="mt-2 font-arabic text-xs leading-loose">
                      الْحَمْدُ لِلَّهِ رَبِّ <span className="rounded bg-[oklch(0.62_0.14_230/0.3)] px-0.5">الْعَالَمِينَ</span>
                    </div>
                    <div className="mt-1 font-arabic text-xs leading-loose">
                      الرَّحْمَٰنِ <span className="rounded bg-[oklch(0.78_0.15_85/0.3)] px-0.5">الرَّحِيمِ</span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-center gap-1.5">
                    <span className="rounded bg-[oklch(0.62_0.14_230)] p-1 text-white"><PenTool className="h-3 w-3" /></span>
                    <span className="rounded bg-muted p-1"><ScrollText className="h-3 w-3" /></span>
                    <span className="rounded bg-muted p-1"><Mic className="h-3 w-3" /></span>
                  </div>
                </div>
              </div>
              <div className="border-t border-border bg-muted/30 p-2">
                <div className="flex gap-1.5">
                  <div className="flex-1 rounded bg-white px-2 py-1 text-[10px] text-muted-foreground">Teacher: Excellent Tajweed on that verse! 🌟</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="border-y border-border/60 bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Loved by families"
            title="What our students say"
            subtitle="Join thousands of learners across 60+ countries."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { name: 'Aisha M.', country: 'United Kingdom', text: 'My 7-year-old has memorized 3 surahs in 4 months. The interactive Quran viewer makes it so engaging for kids!', role: 'Parent of student' },
              { name: 'Bilal K.', country: 'United States', text: 'Sheikh Abdullah\'s Tajweed corrections are precise. The click-to-highlight feature helps me see exactly which word to fix.', role: 'Adult learner' },
              { name: 'Fatima R.', country: 'Canada', text: 'As a working mom, the flexible scheduling and parental monitoring dashboard give me total peace of mind.', role: 'Parent of student' },
            ].map((t) => (
              <Card key={t.name} className="relative p-6">
                <Quote className="absolute right-4 top-4 h-8 w-8 text-[oklch(0.62_0.14_230/0.15)]" />
                <StarRating rating={5} showValue={false} size={16} />
                <p className="mt-3 text-sm leading-relaxed text-foreground">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                  <Avatar name={t.name} size={40} country={t.country} />
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role} · {t.country}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.34_0.13_256)] via-[oklch(0.40_0.11_258)] to-[oklch(0.55_0.12_250)]" />
        <IslamicPatternBand opacity={0.08} />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <StarMedallion className="mx-auto h-10 w-10 text-[oklch(0.85_0.13_85)]" />
          <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Begin your Quran journey today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Sign up free and get a 30-minute trial class with the tutor of your choice. No credit card required.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={() => openAuth('register')} className="bg-white text-primary hover:bg-white/90">
              Get started free <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => goToMarket()} className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              Browse tutors
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-white/60">
            <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Secure payments</span>
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Flexible scheduling</span>
            <span className="inline-flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> Cancel anytime</span>
          </div>
        </div>
      </section>
    </div>
  )
}

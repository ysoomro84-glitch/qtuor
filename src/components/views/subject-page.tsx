'use client'

import * as React from 'react'
import { useAppStore } from '@/lib/store'
import { getSubjectContent } from '@/lib/subject-content'
import { useTutors } from '@/lib/queries'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/shared/avatar'
import { StarRating } from '@/components/brand/badges'
import { IslamicPatternBand, StarMedallion, BismillahHeader } from '@/components/brand/patterns'
import {
  BookOpen, Sparkles, Brain, Languages, ScrollText, Moon,
  Check, ChevronRight, ChevronLeft, Users, Clock, GraduationCap, HelpCircle,
  ArrowRight, BookMarked, Award, Target, Compass, Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'

const ICON_MAP: Record<string, any> = {
  BookOpen, Sparkles, Brain, Languages, ScrollText, Moon,
}

export function SubjectPage() {
  const { activeSubject, setView, setSelectedPlanId, setCheckoutOpen, user, openAuth, setCategory } = useAppStore()
  const subject = getSubjectContent(activeSubject || '') || getSubjectContent('Noorani Qaida')!

  const { data: tutorsData } = useTutors({ category: subject.key, sort: 'rating' })
  const featuredTutors = (tutorsData?.tutors || []).slice(0, 3)

  const goToMarket = () => {
    setCategory(subject.key)
    setView('marketplace')
  }

  const goToPlans = () => {
    setView('plans')
  }

  const Icon = ICON_MAP[subject.icon] || BookOpen
  const color = subject.accentColor

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={subject.heroImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.20_0.10_258/0.92)] via-[oklch(0.25_0.10_258/0.85)] to-[oklch(0.35_0.11_258/0.75)]" />
        </div>
        <IslamicPatternBand opacity={0.06} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Back link */}
          <button
            onClick={() => setView('landing')}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/70 transition hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" /> Back to home
          </button>

          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: `color-mix(in oklch, ${color} 25%, transparent)`, color: color }}
                >
                  <Icon className="h-7 w-7" />
                </span>
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                    {subject.label}
                  </h1>
                  <p className="mt-1 font-arabic text-xl text-white/80" dir="rtl">{subject.arabic}</p>
                </div>
              </div>

              <p className="mt-5 text-lg text-white/85 sm:text-xl">{subject.tagline}</p>
              <p className="mt-3 max-w-xl text-sm text-white/65">{subject.overview.slice(0, 220)}...</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={() => (user ? goToMarket() : openAuth('register', 'STUDENT'))}
                  className="gap-1.5 text-white"
                  style={{ background: color, borderColor: color }}
                >
                  Find a {subject.shortLabel} tutor <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  onClick={goToPlans}
                  variant="outline"
                  className="gap-1.5 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  View plans
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-4 gap-3">
                {subject.stats.map((s) => (
                  <div key={s.label} className="rounded-xl border border-white/15 bg-white/5 p-3 text-center backdrop-blur">
                    <div className="text-xl font-extrabold text-white">{s.value}</div>
                    <div className="text-[10px] uppercase tracking-wide text-white/60">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative medallion on the right (hidden on mobile) */}
            <div className="hidden justify-center lg:flex">
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full blur-3xl"
                  style={{ background: `color-mix(in oklch, ${color} 30%, transparent)` }}
                />
                <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-2 border-white/20 bg-white/5 backdrop-blur">
                  <StarMedallion className="h-32 w-32 text-white/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-arabic text-5xl text-white/90" dir="rtl">{subject.arabic}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== OVERVIEW ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide" style={{ background: `color-mix(in oklch, ${color} 10%, white)`, color }}>
              <BookOpen className="h-3.5 w-3.5" /> Course Overview
            </span>
            <h2 className="mt-3 text-3xl font-extrabold">What is {subject.label}?</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{subject.overview}</p>

            <div className="mt-8">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Users className="h-5 w-5" style={{ color }} /> Who is this course for?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{subject.whoIsItFor}</p>
            </div>
          </div>

          {/* Quick info card */}
          <div>
            <Card className="overflow-hidden p-0">
              <div className="p-5 text-white" style={{ background: color }}>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  <span className="font-bold">Quick Info</span>
                </div>
              </div>
              <div className="space-y-3 p-5">
                <InfoRow icon={Clock} label="Class duration" value="30 minutes" />
                <InfoRow icon={Users} label="Format" value="1-on-1 live" />
                <InfoRow icon={BookMarked} label="Levels" value="Beginner → Advanced" />
                <InfoRow icon={Award} label="Certified" value="Ijaza tutors" />
                <InfoRow icon={Target} label="Trial class" value="Free 30 min" />
                <Button
                  onClick={() => (user ? goToMarket() : openAuth('register', 'STUDENT'))}
                  className="mt-2 w-full gap-1.5 text-white"
                  style={{ background: color, borderColor: color }}
                >
                  Start learning <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== WHAT YOU'LL LEARN ===== */}
      <section className="border-y border-border/60 bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide" style={{ background: `color-mix(in oklch, ${color} 10%, white)`, color }}>
              <Target className="h-3.5 w-3.5" /> Learning Outcomes
            </span>
            <h2 className="mt-3 text-3xl font-extrabold">What you will learn</h2>
            <p className="mt-2 text-muted-foreground">A structured curriculum designed to take you from your current level to mastery.</p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {subject.whatYouWillLearn.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-4 transition hover:shadow-md"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: color }}
                >
                  {i + 1}
                </span>
                <span className="text-sm text-foreground/90">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CURRICULUM ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide" style={{ background: `color-mix(in oklch, ${color} 10%, white)`, color }}>
            <Compass className="h-3.5 w-3.5" /> Structured Path
          </span>
          <h2 className="mt-3 text-3xl font-extrabold">Curriculum</h2>
          <p className="mt-2 text-muted-foreground">Your step-by-step journey through {subject.label}.</p>
        </div>

        <div className="mt-10 space-y-3">
          {subject.curriculum.map((c, i) => (
            <div
              key={i}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition hover:border-[oklch(0.62_0.14_230/0.4)] hover:shadow-md sm:flex-row sm:items-center"
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white"
                style={{ background: color }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold">{c.title}</h3>
                  <Badge variant="outline" className="gap-1 text-[10px]" style={{ borderColor: `color-mix(in oklch, ${color} 40%, transparent)`, color }}>
                    <Clock className="h-3 w-3" /> {c.duration}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              </div>
              <ChevronRight className="hidden h-5 w-5 shrink-0 text-muted-foreground transition group-hover:text-primary sm:block" />
            </div>
          ))}
        </div>
      </section>

      {/* ===== OUTCOMES + CTA ===== */}
      <section className="relative overflow-hidden py-16" style={{ background: `linear-gradient(135deg, color-mix(in oklch, ${color} 8%, white), color-mix(in oklch, ${color} 3%, white))` }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold">By the end of this course</h2>
              <p className="mt-2 text-muted-foreground">You will have achieved these milestones:</p>
              <ul className="mt-6 space-y-3">
                {subject.outcomes.map((o, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ background: color }}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-sm font-medium">{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Card className="p-6 text-center">
              <StarMedallion className="mx-auto h-10 w-10" style={{ color }} />
              <h3 className="mt-3 text-xl font-extrabold">Ready to begin?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Start with a free 30-minute trial class. No credit card required.
              </p>
              <div className="mt-5 space-y-2">
                <Button
                  onClick={() => (user ? goToMarket() : openAuth('register', 'STUDENT'))}
                  className="w-full gap-1.5 text-white"
                  style={{ background: color, borderColor: color }}
                >
                  {user ? 'Find a tutor' : 'Sign up free'} <ArrowRight className="h-4 w-4" />
                </Button>
                <Button onClick={goToPlans} variant="outline" className="w-full">
                  View pricing plans
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== FEATURED TUTORS ===== */}
      {featuredTutors.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide" style={{ background: `color-mix(in oklch, ${color} 10%, white)`, color }}>
                <Star className="h-3.5 w-3.5" /> Expert Tutors
              </span>
              <h2 className="mt-3 text-3xl font-extrabold">Featured {subject.shortLabel} tutors</h2>
            </div>
            <Button variant="outline" onClick={goToMarket} className="gap-1.5">
              View all <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {featuredTutors.map((t) => (
              <Card key={t.id} className="cursor-pointer p-5 transition hover:shadow-lg" >
                <div onClick={() => { setCategory(subject.key); setView('marketplace') }}>
                  <div className="flex items-center gap-3">
                    <Avatar name={t.name} src={t.avatar} size={56} country={t.country} />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold">{t.name}</h3>
                      <StarRating rating={t.profile?.rating || 5} size={12} />
                      <p className="text-[10px] text-muted-foreground">{t.profile?.reviewCount || 0} reviews</p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{t.profile?.bio}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(t.profile?.specialties || []).slice(0, 3).map((s: string) => (
                      <Badge key={s} variant="outline" className="text-[9px]">{s}</Badge>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">per class</span>
                    <span className="text-lg font-extrabold" style={{ color }}>
                      ${t.profile?.perClassRate ?? t.profile?.hourlyRate}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ===== FAQ ===== */}
      <section className="border-t border-border/60 bg-muted/30 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide" style={{ background: `color-mix(in oklch, ${color} 10%, white)`, color }}>
              <HelpCircle className="h-3.5 w-3.5" /> Common Questions
            </span>
            <h2 className="mt-3 text-3xl font-extrabold">{subject.label} FAQ</h2>
          </div>
          <Accordion type="single" collapsible className="mt-8">
            {subject.faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, color-mix(in oklch, ${color} 15%, oklch(0.20 0.10 258)), oklch(0.25 0.10 258))` }} />
        <IslamicPatternBand opacity={0.06} />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <BismillahHeader className="justify-center text-white/70" />
          <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
            Begin your {subject.label} journey today
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-white/80">
            Join thousands of students learning with certified tutors. Your first trial class is free.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={() => (user ? goToMarket() : openAuth('register', 'STUDENT'))}
              className="gap-1.5 bg-white text-foreground hover:bg-white/90"
            >
              {user ? 'Find a tutor' : 'Get started free'} <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={goToPlans}
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              See pricing
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  )
}

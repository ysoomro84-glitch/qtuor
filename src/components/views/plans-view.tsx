'use client'

import * as React from 'react'
import { useAppStore } from '@/lib/store'
import { usePlans, useSubscription } from '@/lib/queries'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Sparkles, ShieldCheck, Headphones, HelpCircle, BookOpen, Brain, BookOpenText } from 'lucide-react'
import { IslamicPatternBand, StarMedallion } from '@/components/brand/patterns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'

const FAQS = [
  { q: 'How does the free trial work?', a: 'Every new student gets one free 30-minute trial class with any verified tutor. No credit card required. Pick a tutor, book your trial, and experience the interactive classroom firsthand.' },
  { q: 'Can I cancel my subscription anytime?', a: 'Yes. You can cancel or downgrade your plan at any time from your student dashboard. Your subscription stays active until the end of your current billing cycle.' },
  { q: 'How does billing work?', a: 'You pay a flat monthly rate for your chosen plan. There are no hourly credits or per-class charges — enjoy unlimited scheduled classes within your plan. Your subscription auto-renews every 30 days.' },
  { q: 'What if I run out of classes?', a: 'You can upgrade to a higher plan at any time, or wait for your next monthly renewal. Unused classes roll over for one billing cycle.' },
  { q: 'Are tutors verified?', a: 'Every tutor is vetted by our admin team. Verified tutors hold Ijaza certifications, and many are Hafiz and native Arabic speakers. Look for the verified badge.' },
  { q: 'Is parental monitoring available?', a: 'Yes. The virtual classroom can take random safety snapshots during class, saved to the parent dashboard. Cloud recording is also available on higher tiers.' },
]

const SUBJECT_META: Record<string, { icon: any; arabic: string; color: string; desc: string }> = {
  'Noorani Qaida': { icon: BookOpen, arabic: 'القاعدة النورانية', color: 'oklch(0.62 0.14 230)', desc: 'Build a strong foundation from the very first Arabic letter — perfect for beginners and children.' },
  'Quran Recitation With Tajweed': { icon: Sparkles, arabic: 'التجويد', color: 'oklch(0.40 0.11 258)', desc: 'Master the rules of beautiful, correct Quran recitation with certified Tajweed specialists.' },
  'Hifz': { icon: Brain, arabic: 'الحفظ', color: 'oklch(0.78 0.15 85)', desc: 'Memorize the Holy Quran with dedicated Hafiz tutors and a personalized revision plan.' },
}

const CLASS_OPTIONS = [2, 3, 4, 5] // classes per week

export function PlansView() {
  const { setSelectedPlanId, setCheckoutOpen, user, openAuth, setView } = useAppStore()
  const { data: plansData, isLoading } = usePlans()
  const { data: subData } = useSubscription()
  const plans = plansData?.plans || []
  const activeSub = subData?.subscription

  const handleChoose = (planId: string) => {
    if (!user) {
      openAuth('register', 'STUDENT')
      toast.info('Sign up to subscribe to a plan.')
      return
    }
    setSelectedPlanId(planId)
    setCheckoutOpen(true)
  }

  // Group plans by category
  const categories = React.useMemo(() => {
    const grouped: Record<string, typeof plans> = {}
    for (const p of plans) {
      const cat = p.category || 'General'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(p)
    }
    // Sort each group by classesPerMonth
    for (const cat of Object.keys(grouped)) {
      grouped[cat].sort((a, b) => a.classesPerMonth - b.classesPerMonth)
    }
    return grouped
  }, [plans])

  const categoryOrder = ['Noorani Qaida', 'Quran Recitation With Tajweed', 'Hifz']

  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 hero-mesh" />
        <IslamicPatternBand opacity={0.05} />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.62_0.14_230/0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[oklch(0.40_0.11_258)]">
            <Sparkles className="h-3.5 w-3.5" /> Monthly subscription plans
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Choose your <span className="text-gradient-blue">learning plan</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            3 subjects · 4 class frequencies · Cancel anytime. Every plan includes a free 30-min trial.
          </p>
          {activeSub && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[oklch(0.62_0.14_230/0.3)] bg-[oklch(0.62_0.14_230/0.06)] px-4 py-2 text-sm">
              <Check className="h-4 w-4 text-[oklch(0.62_0.14_230)]" />
              You're on the <strong className="mx-1">{activeSub.plan.category}</strong> · {activeSub.plan.name} · Active until {new Date(activeSub.expiresAt).toLocaleDateString()}
              <button onClick={() => setView('student-dashboard')} className="ml-2 text-primary underline">Go to dashboard</button>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Matrix — grouped by subject */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {isLoading && (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => <Card key={i} className="h-48 animate-pulse bg-muted/40" />)}
          </div>
        )}

        {!isLoading && categoryOrder.map((cat) => {
          const catPlans = categories[cat] || []
          if (catPlans.length === 0) return null
          const meta = SUBJECT_META[cat] || SUBJECT_META['Quran Recitation With Tajweed']
          const Icon = meta.icon

          return (
            <div key={cat} className="mb-12">
              {/* Subject header */}
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklch, ${meta.color} 12%, white)`, color: meta.color }}>
                  <Icon className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold">{cat}</h2>
                    <span className="font-arabic text-xl text-muted-foreground" dir="rtl">{meta.arabic}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{meta.desc}</p>
                </div>
              </div>

              {/* Plan cards for this subject (4 columns: 2/3/4/5 classes per week) */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {catPlans.map((plan) => {
                  const isCurrent = activeSub?.plan?.id === plan.id
                  const perClass = (plan.monthlyPrice / plan.classesPerMonth).toFixed(2)
                  return (
                    <Card
                      key={plan.id}
                      className={cn(
                        'relative flex flex-col overflow-hidden p-0 transition',
                        plan.popular
                          ? 'border-2 shadow-xl shadow-primary/10'
                          : 'border border-border hover:shadow-md'
                      )}
                      style={plan.popular ? { borderColor: meta.color } : undefined}
                    >
                      {plan.popular && (
                        <div
                          className="flex items-center justify-center gap-1 py-1.5 text-xs font-bold uppercase tracking-wide text-white"
                          style={{ background: meta.color }}
                        >
                          <Star className="h-3.5 w-3.5 fill-white" /> Best value
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-5">
                        <div className="text-sm font-bold text-foreground">{plan.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{plan.classesPerMonth} classes / month</div>

                        <div className="mt-3 flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold" style={{ color: meta.color }}>${plan.monthlyPrice}</span>
                          <span className="text-xs text-muted-foreground">/month</span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          ≈ ${perClass} per class
                        </div>

                        <Button
                          className="mt-4 gap-1.5"
                          size="sm"
                          variant={plan.popular ? 'default' : 'outline'}
                          style={plan.popular ? { background: meta.color, borderColor: meta.color } : undefined}
                          onClick={() => handleChoose(plan.id)}
                          disabled={isCurrent}
                        >
                          {isCurrent ? (
                            <><Check className="h-4 w-4" /> Current</>
                          ) : (
                            <>Choose plan</>
                          )}
                        </Button>

                        <ul className="mt-4 space-y-1.5 border-t border-border pt-3">
                          {plan.features.slice(0, 4).map((f: string) => (
                            <li key={f} className="flex items-start gap-1.5 text-[11px]">
                              <Check className="mt-0.5 h-3 w-3 shrink-0" style={{ color: meta.color }} />
                              <span className="text-foreground/80">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Comparison strip */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: 'Verified tutors', desc: 'Every tutor is vetted & Ijaza-certified' },
            { icon: Headphones, title: '24/7 support', desc: 'Our team is here whenever you need help' },
            { icon: StarMedallion, title: 'Satisfaction guarantee', desc: 'Not happy? Get your classes reassigned to another tutor' },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.62_0.14_230/0.1)] text-[oklch(0.40_0.11_258)]">
                <f.icon className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-sm font-semibold">{f.title}</h4>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/60 bg-muted/30 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.62_0.14_230/0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[oklch(0.40_0.11_258)]">
              <HelpCircle className="h-3.5 w-3.5" /> Questions?
            </span>
            <h2 className="mt-3 text-3xl font-extrabold">Frequently asked</h2>
          </div>
          <Accordion type="single" collapsible className="mt-8">
            {FAQS.map((faq, i) => (
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
    </div>
  )
}

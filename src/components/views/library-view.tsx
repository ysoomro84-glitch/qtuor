'use client'

import * as React from 'react'
import { useAppStore } from '@/lib/store'
import { QAIDA_PAGES, type LibraryPage } from '@/components/classroom/quran-data'
import { JUZ_LIST, SURAHS, surahsInJuz, getSurah, getJuz, TOTAL_AYAHS, type Juz, type SurahMeta } from '@/lib/quran-metadata'
import { useSurahText } from '@/hooks/use-quran-text'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { StarMedallion, IslamicPatternBand } from '@/components/brand/patterns'
import {
  BookOpen, BookOpenText, GraduationCap, Search, ChevronLeft, ChevronRight,
  Moon, Star, Sparkles, BookMarked, Library as LibraryIcon, Layers, Loader2, AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type TabKey = 'juz' | 'surah' | 'qaida'

export function LibraryView() {
  const { setView, user, openAuth } = useAppStore()
  const [tab, setTab] = React.useState<TabKey>('juz')
  const [search, setSearch] = React.useState('')
  const [activeJuz, setActiveJuz] = React.useState<number | null>(1)
  const [activeSurah, setActiveSurah] = React.useState<number | null>(1)
  const [activeQaidaId, setActiveQaidaId] = React.useState<number>(QAIDA_PAGES[0].id)

  const openInClassroom = () => {
    if (!user) {
      openAuth('register', 'STUDENT')
      return
    }
    setView('classroom')
  }

  return (
    <div className="relative">
      {/* Header band */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 hero-mesh" />
        <IslamicPatternBand opacity={0.05} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookMarked className="h-4 w-4" /> Digital Library
              </div>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
                The Complete <span className="text-gradient-blue">Digital Quran</span>
              </h1>
              <p className="mt-1 max-w-2xl text-muted-foreground">
                All <strong>30 Para (Juz)</strong> · <strong>114 Surahs</strong> · {TOTAL_AYAHS.toLocaleString()} verses · Noorani Qaida (17 lessons).
                Authentic Uthmani script, word-by-word interactive.
              </p>
            </div>
            <Button onClick={openInClassroom} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              <BookOpen className="h-4 w-4" /> Open in Classroom
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 border border-border">
              <Layers className="h-3.5 w-3.5 text-primary" /> 30 Juz (Para)
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 border border-border">
              <BookOpenText className="h-3.5 w-3.5 text-primary" /> 114 Surahs
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 border border-border">
              <Sparkles className="h-3.5 w-3.5 text-[oklch(0.78_0.15_85)]" /> {TOTAL_AYAHS.toLocaleString()} verses
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 border border-border">
              <GraduationCap className="h-3.5 w-3.5 text-[oklch(0.62_0.14_230)]" /> 17 Qaida lessons
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="juz" className="gap-1.5"><Layers className="h-3.5 w-3.5" /> By Juz (Para)</TabsTrigger>
            <TabsTrigger value="surah" className="gap-1.5"><BookOpenText className="h-3.5 w-3.5" /> By Surah</TabsTrigger>
            <TabsTrigger value="qaida" className="gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> Qaida</TabsTrigger>
          </TabsList>

          {/* ===================== TAB: JUZ (30 PARA) ===================== */}
          <TabsContent value="juz" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              {/* Juz list */}
              <aside>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search juz..."
                    className="pl-9"
                  />
                </div>
                <Card className="overflow-hidden p-0">
                  <ScrollArea className="h-[calc(100vh-22rem)]">
                    <div className="p-1.5">
                      {JUZ_LIST
                        .filter((j) => !search || j.transliteration.toLowerCase().includes(search.toLowerCase()) || String(j.number).includes(search))
                        .map((juz) => (
                        <button
                          key={juz.number}
                          onClick={() => { setActiveJuz(juz.number); setSearch('') }}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition',
                            activeJuz === juz.number ? 'bg-[oklch(0.62_0.14_230/0.1)]' : 'hover:bg-muted'
                          )}
                        >
                          <span className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                            activeJuz === juz.number ? 'bg-primary text-primary-foreground' : 'bg-[oklch(0.34_0.13_256/0.1)] text-primary'
                          )}>
                            {juz.number}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{juz.transliteration}</span>
                            <span className="block truncate text-[10px] text-muted-foreground">{juz.englishMeaning}</span>
                          </span>
                          <span className="font-arabic text-base text-[oklch(0.30_0.10_258)]" dir="rtl">{juz.arabicName}</span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </aside>

              {/* Selected Juz: list of surahs + reading pane */}
              <div className="min-w-0 space-y-4">
                {activeJuz && <JuzDetailView juzNumber={activeJuz} onPickSurah={(n) => { setActiveSurah(n); setTab('surah') }} />}
              </div>
            </div>
          </TabsContent>

          {/* ===================== TAB: SURAHS (114) ===================== */}
          <TabsContent value="surah" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              <aside>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search surah by name or number..."
                    className="pl-9"
                  />
                </div>
                <Card className="overflow-hidden p-0">
                  <ScrollArea className="h-[calc(100vh-22rem)]">
                    <div className="p-1.5">
                      {SURAHS
                        .filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.arabicName.includes(search) || String(s.number).includes(search))
                        .map((s) => (
                        <button
                          key={s.number}
                          onClick={() => { setActiveSurah(s.number); setSearch('') }}
                          className={cn(
                            'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition',
                            activeSurah === s.number ? 'bg-[oklch(0.62_0.14_230/0.1)]' : 'hover:bg-muted'
                          )}
                        >
                          <span className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold',
                            activeSurah === s.number ? 'bg-primary text-primary-foreground' : 'bg-[oklch(0.34_0.13_256/0.1)] text-primary'
                          )}>
                            {s.number}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{s.name}</span>
                            <span className="block text-[10px] text-muted-foreground">
                              {s.ayahCount} ayahs · {s.revelationType} · Juz {s.startJuz}
                            </span>
                          </span>
                          <span className="font-arabic text-base text-[oklch(0.30_0.10_258)]" dir="rtl">{s.arabicName}</span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </aside>

              <div className="min-w-0">
                {activeSurah && <DynamicSurahReader surahNumber={activeSurah} onChange={setActiveSurah} />}
              </div>
            </div>
          </TabsContent>

          {/* ===================== TAB: QAIDA (17 LESSONS) ===================== */}
          <TabsContent value="qaida" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              <aside>
                <Card className="overflow-hidden p-0">
                  <ScrollArea className="h-[calc(100vh-22rem)]">
                    <div className="p-1.5">
                      {QAIDA_PAGES.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setActiveQaidaId(p.id)}
                          className={cn(
                            'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition',
                            activeQaidaId === p.id ? 'bg-[oklch(0.62_0.14_230/0.1)]' : 'hover:bg-muted'
                          )}
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[oklch(0.62_0.14_230/0.12)] text-[11px] font-bold text-[oklch(0.40_0.11_258)]">
                            {p.lessonNumber}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{p.lessonTitle}</span>
                            <span className="block text-[10px] text-muted-foreground">{p.rule || 'Lesson'}</span>
                          </span>
                          <span className="font-arabic text-sm text-[oklch(0.30_0.10_258)]" dir="rtl">{p.lessonTitleArabic}</span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </aside>
              <div className="min-w-0">
                <StaticPageReader page={QAIDA_PAGES.find((p) => p.id === activeQaidaId) || QAIDA_PAGES[0]} totalLabel="Qaida" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

/* ============ Juz Detail: list surahs in a Juz + inline reading pane ============ */
function JuzDetailView({ juzNumber, onPickSurah }: { juzNumber: number; onPickSurah: (n: number) => void }) {
  const juz = getJuz(juzNumber)!
  const surahs = surahsInJuz(juzNumber)
  const [selectedSurah, setSelectedSurah] = React.useState<number | null>(null)

  // Reset selection when juz changes
  React.useEffect(() => { setSelectedSurah(null) }, [juzNumber])

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden p-0">
        <div className="relative bg-gradient-to-br from-[oklch(0.30_0.10_258)] to-[oklch(0.45_0.11_258)] p-6 text-white">
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
            <svg className="h-full w-full"><defs><pattern id="jg" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M25 0 L35 15 L25 30 L15 15 Z" fill="none" stroke="white" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#jg)"/></svg>
          </div>
          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-white/70">Para / Juz {juzNumber} of 30</div>
              <h2 className="mt-1 text-2xl font-extrabold">{juz.transliteration}</h2>
              <p className="text-sm text-white/70">{juz.englishMeaning}</p>
            </div>
            <div className="text-right">
              <div className="font-arabic text-3xl text-[oklch(0.85_0.13_85)]" dir="rtl">{juz.arabicName}</div>
              <div className="text-xs text-white/60 mt-1">Starts at Surah {juz.startSurah}:{juz.startAyah}</div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Surahs in this Juz ({surahs.length}) — click to read
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {surahs.map((s) => (
              <button
                key={s.number}
                onClick={() => { setSelectedSurah(s.number); onPickSurah(s.number) }}
                className={cn(
                  'group flex items-center gap-3 rounded-lg border p-3 text-left transition hover:shadow-md',
                  selectedSurah === s.number
                    ? 'border-[oklch(0.62_0.14_230)] bg-[oklch(0.62_0.14_230/0.05)]'
                    : 'border-border bg-card hover:border-[oklch(0.62_0.14_230)]'
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.34_0.13_256/0.1)] text-sm font-bold text-primary">
                  {s.number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{s.name}</span>
                  <span className="block text-[10px] text-muted-foreground">{s.ayahCount} ayahs · {s.revelationType}</span>
                </span>
                <span className="font-arabic text-lg text-[oklch(0.30_0.10_258)]" dir="rtl">{s.arabicName}</span>
                <ChevronRight className={cn('h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary', selectedSurah === s.number && 'text-primary')} />
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Inline reading pane — shows the Quran verse text for the selected surah */}
      {selectedSurah && <DynamicSurahReader surahNumber={selectedSurah} onChange={setSelectedSurah} />}
    </div>
  )
}

/* ============ Dynamic Surah Reader (fetches from API) ============ */
function DynamicSurahReader({ surahNumber, onChange }: { surahNumber: number; onChange: (n: number) => void }) {
  const { data: page, isLoading, error } = useSurahText(surahNumber)
  const meta = getSurah(surahNumber)!

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-[oklch(0.40_0.11_258)]">
            Surah {surahNumber} of 114 · Juz {meta.startJuz} · {meta.revelationType}
          </div>
          <h2 className="text-2xl font-extrabold">
            {meta.name}
            <span className="ml-2 font-arabic text-3xl text-[oklch(0.30_0.10_258)]" dir="rtl">{meta.arabicName}</span>
          </h2>
          <p className="text-sm text-muted-foreground">{meta.englishMeaning} · {meta.ayahCount} ayahs</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={surahNumber <= 1} onClick={() => onChange(surahNumber - 1)} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Prev</span>
          </Button>
          <Button variant="outline" size="sm" disabled={surahNumber >= 114} onClick={() => onChange(surahNumber + 1)} className="gap-1">
            <span className="hidden sm:inline">Next</span> <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Page */}
      {isLoading && <SurahSkeleton />}
      {error && (
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <h3 className="mt-2 font-semibold">Couldn't load this surah</h3>
          <p className="mt-1 text-sm text-muted-foreground">Please check your connection and try again.</p>
          <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      )}
      {page && <PageFrame page={page} />}
    </div>
  )
}

/* ============ Static page reader (Qaida) ============ */
function StaticPageReader({ page, totalLabel }: { page: LibraryPage; totalLabel: string }) {
  const idx = QAIDA_PAGES.findIndex((p) => p.id === page.id)
  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-[oklch(0.40_0.11_258)]">
          {totalLabel} · Lesson {page.lessonNumber} of {QAIDA_PAGES.length}
        </div>
        <h2 className="text-2xl font-extrabold">{page.lessonTitle}</h2>
        <p className="text-sm text-muted-foreground">
          <span className="font-arabic" dir="rtl">{page.lessonTitleArabic}</span>
          {page.rule && <><span className="mx-2">·</span><span>{page.rule}</span></>}
        </p>
      </div>
      {page.instruction && (
        <div className="flex items-start gap-3 rounded-xl border border-[oklch(0.62_0.14_230/0.3)] bg-[oklch(0.62_0.14_230/0.05)] p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.62_0.14_230/0.15)] text-[oklch(0.40_0.11_258)]">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <h4 className="text-sm font-semibold text-[oklch(0.30_0.10_258)]">How to read this lesson</h4>
            <p className="mt-0.5 text-sm text-muted-foreground">{page.instruction}</p>
          </div>
        </div>
      )}
      <PageFrame page={page} />
    </div>
  )
}

/* ============ Ornamental Page Frame (shared) ============ */
function PageFrame({ page }: { page: LibraryPage }) {
  const isQaida = page.type === 'qaida'
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative bg-gradient-to-b from-[oklch(0.99_0.01_60)] to-[oklch(0.97_0.01_60)] p-1">
        <div className="rounded-xl border-2 border-[oklch(0.78_0.15_85/0.4)] p-1">
          <div className="rounded-lg border border-[oklch(0.34_0.13_256/0.15)] bg-white">
            <div className="flex items-center justify-center gap-2 border-b border-[oklch(0.34_0.13_256/0.1)] py-2 text-[oklch(0.34_0.13_256)]">
              <StarMedallion className="h-4 w-4 text-[oklch(0.78_0.15_85)]" />
              <span className="font-arabic text-sm" dir="rtl">
                {isQaida ? page.lessonTitleArabic : page.surahArabic}
              </span>
              <StarMedallion className="h-4 w-4 text-[oklch(0.78_0.15_85)]" />
            </div>
            <div className="max-h-[60vh] overflow-y-auto scrollbar-quran px-4 py-8 sm:px-8" dir="rtl">
              {page.bismillah && (
                <div className="mb-8 flex justify-center">
                  <span className="font-arabic text-2xl text-[oklch(0.30_0.10_258)] sm:text-3xl">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </span>
                </div>
              )}
              <div className="space-y-5">
                {page.lines.map((line, li) => (
                  <div
                    key={li}
                    className={cn(
                      'flex flex-wrap justify-center gap-x-1.5 gap-y-2 font-arabic leading-loose text-[oklch(0.20_0.04_258)]',
                      isQaida ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
                    )}
                  >
                    {line.words.map((w) => {
                      // Ayah-end markers render smaller and in a circle
                      const isAyahMarker = w.id.endsWith('-end')
                      if (isAyahMarker) {
                        return (
                          <span
                            key={w.id}
                            className="mx-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[oklch(0.78_0.15_85/0.5)] text-xs font-semibold text-[oklch(0.55_0.13_75)] align-middle"
                            title={`Ayah ${w.text}`}
                          >
                            {w.text}
                          </span>
                        )
                      }
                      const tooltip = [w.transliteration, w.translation].filter(Boolean).join(' — ')
                      return (
                        <span
                          key={w.id}
                          title={tooltip || undefined}
                          className="group relative rounded-md px-1 py-0.5 transition hover:bg-[oklch(0.62_0.14_230/0.12)] cursor-default"
                        >
                          {w.text}
                          {tooltip && (
                            <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[oklch(0.20_0.04_258)] px-2 py-1 text-[10px] font-normal text-white shadow-lg group-hover:block">
                              {w.transliteration && <span className="block text-[oklch(0.62_0.14_230)]">{w.transliteration}</span>}
                              {w.translation && <span className="block">{w.translation}</span>}
                            </span>
                          )}
                        </span>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 border-t border-[oklch(0.34_0.13_256/0.1)] py-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[oklch(0.78_0.15_85/0.5)] text-xs font-bold text-[oklch(0.55_0.13_75)]">
                {isQaida ? page.lessonNumber : page.surahNumber}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {isQaida
                  ? `Lesson ${page.lessonNumber} / ${QAIDA_PAGES.length}`
                  : `Surah ${page.surahNumber} · Juz ${page.juz} · ${page.ayahRange}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

/* ============ Loading skeleton ============ */
function SurahSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="p-6">
        <Skeleton className="mx-auto mb-6 h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex justify-center gap-2">
              {Array.from({ length: 6 + (i % 4) }).map((_, j) => (
                <Skeleton key={j} className="h-8" style={{ width: 40 + ((i + j) % 5) * 18 }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

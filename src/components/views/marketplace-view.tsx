'use client'

import * as React from 'react'
import { useAppStore } from '@/lib/store'
import { useTutors, useTutor, useCreateBooking } from '@/lib/queries'
import { CATEGORIES } from '@/lib/constants'
import { TutorRowCard, type TutorWithProfile } from '@/components/shared/tutor-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar } from '@/components/shared/avatar'
import { AudioIntroPlayer } from '@/components/shared/audio-intro-player'
import { VerifiedBadge, NativeArabicBadge, HafizBadge, IjazaBadge, StarRating } from '@/components/brand/badges'
import { StarMedallion } from '@/components/brand/patterns'
import { Search, SlidersHorizontal, X, Users, BookOpen, Clock, Calendar, Loader2, CheckCircle2, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format, addDays, startOfTomorrow } from 'date-fns'

const TIME_SLOTS = ['08:00', '10:00', '14:00', '16:00', '18:00', '20:00']

export function MarketplaceView() {
  const { category, setCategory, search, setSearch, user, openAuth } = useAppStore()
  const [localSearch, setLocalSearch] = React.useState(search)
  const [filters, setFilters] = React.useState({ nativeArabic: false, hafiz: false, ijaza: false })
  const [gender, setGender] = React.useState<string>('')
  const [sort, setSort] = React.useState('rating')
  const [selectedTutorId, setSelectedTutorId] = React.useState<string | null>(null)

  React.useEffect(() => { setLocalSearch(search) }, [search])

  const { data, isLoading } = useTutors({
    category,
    search: localSearch,
    nativeArabic: filters.nativeArabic,
    hafiz: filters.hafiz,
    ijaza: filters.ijaza,
    sort,
    ...(gender ? { gender } : {}),
  })

  const tutors = data?.tutors || []

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GraduationCap className="h-4 w-4" /> Find your perfect tutor
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Tutor Marketplace</h1>
        <p className="mt-1 text-muted-foreground">Browse {tutors.length} verified tutors. Book a free 30-minute trial.</p>
      </div>

      {/* Category tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition',
              category === c.key
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card hover:border-[oklch(0.62_0.14_230)] hover:text-primary'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Filters sidebar */}
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </div>

            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={localSearch}
                onChange={(e) => { setLocalSearch(e.target.value); setSearch(e.target.value) }}
                placeholder="Search tutors..."
                className="pl-9"
              />
            </div>

            {/* Sort */}
            <div className="mt-4">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Sort by</Label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Top rated</SelectItem>
                  <SelectItem value="price-low">Price: low to high</SelectItem>
                  <SelectItem value="price-high">Price: high to low</SelectItem>
                  <SelectItem value="lessons">Most lessons taught</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gender filter */}
            <div className="mt-5 space-y-2.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Gender</Label>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setGender('')}
                  className={cn('flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition', !gender ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/40')}
                >
                  All
                </button>
                <button
                  onClick={() => setGender('male')}
                  className={cn('flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition', gender === 'male' ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/40')}
                >
                  Male
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={cn('flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition', gender === 'female' ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/40')}
                >
                  Female
                </button>
              </div>
            </div>

            {/* Quick filters */}
            <div className="mt-5 space-y-2.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Qualifications</Label>
              {([
                ['nativeArabic', 'Native Arabic speaker'],
                ['hafiz', 'Hafiz of the Quran'],
                ['ijaza', 'Ijaza certified'],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={filters[key]}
                    onCheckedChange={(v) => setFilters({ ...filters, [key]: !!v })}
                  />
                  {label}
                </label>
              ))}
            </div>

            {(filters.nativeArabic || filters.hafiz || filters.ijaza || localSearch || category !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full text-muted-foreground"
                onClick={() => {
                  setFilters({ nativeArabic: false, hafiz: false, ijaza: false })
                  setLocalSearch(''); setSearch('')
                  setCategory('all')
                }}
              >
                <X className="mr-1 h-3.5 w-3.5" /> Clear all filters
              </Button>
            )}
          </Card>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${tutors.length} tutor${tutors.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-48 animate-pulse bg-muted/40" />
              ))}
            </div>
          )}

          {!isLoading && tutors.length === 0 && (
            <Card className="p-12 text-center">
              <Search className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <h3 className="mt-3 font-semibold">No tutors match your filters</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or clearing filters.</p>
            </Card>
          )}

          <div className="space-y-4">
            {tutors.map((t) => (
              <TutorRowCard key={t.id} tutor={t} onView={(id) => setSelectedTutorId(id)} />
            ))}
          </div>
        </div>
      </div>

      {/* Tutor detail + booking dialog */}
      <TutorDetailDialog
        tutorId={selectedTutorId}
        onClose={() => setSelectedTutorId(null)}
      />
    </div>
  )
}

function TutorDetailDialog({ tutorId, onClose }: { tutorId: string | null; onClose: () => void }) {
  const { user, openAuth, setActiveBookingId, setView } = useAppStore()
  const { data, isLoading } = useTutor(tutorId)
  const createBooking = useCreateBooking()
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null)

  const tutor = data

  React.useEffect(() => {
    if (tutorId) {
      setSelectedDay(null)
      setSelectedSlot(null)
    }
  }, [tutorId])

  const handleBook = async (isTrial: boolean) => {
    if (!tutor) return
    if (!user) {
      onClose()
      openAuth('register', 'STUDENT')
      toast.info('Please sign up as a student to book a class.')
      return
    }
    if (user.role !== 'STUDENT') {
      toast.error('Only student accounts can book classes.')
      return
    }
    if (!selectedDay || !selectedSlot) {
      toast.error('Please pick a day and time slot.')
      return
    }
    const date = addDays(startOfTomorrow(), selectedDay)
    const [hh, mm] = selectedSlot.split(':')
    date.setHours(parseInt(hh), parseInt(mm), 0, 0)
    try {
      const res = await createBooking.mutateAsync({
        tutorId: tutor.id,
        scheduledAt: date.toISOString(),
        durationMins: 30,
        topic: `Trial class with ${tutor.name}`,
        isTrial,
      })
      toast.success(isTrial ? 'Free trial booked! 🎉' : 'Class booked! Check your dashboard.')
      onClose()
      setView('student-dashboard')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const days = Array.from({ length: 7 }, (_, i) => i)

  return (
    <Dialog open={!!tutorId} onOpenChange={(o) => (o ? null : onClose())}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden p-0">
        {isLoading && (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {tutor && (
          <div className="flex flex-col max-h-[92vh]">
            <ScrollArea className="flex-1">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-[oklch(0.30_0.10_258)] to-[oklch(0.45_0.11_258)] p-6 text-white">
                <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
                  <svg className="h-full w-full"><defs><pattern id="dg" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M25 0 L35 15 L25 30 L15 15 Z" fill="none" stroke="white" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#dg)"/></svg>
                </div>
                <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <Avatar name={tutor.name} src={tutor.avatar} size={88} country={tutor.country} className="ring-4 ring-white/20" />
                  <div className="flex-1">
                    <h2 className="text-2xl font-extrabold">{tutor.name}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/80">
                      <span>{tutor.country}</span>
                      <span>·</span>
                      <StarRating rating={tutor.profile.rating} />
                      <span>({tutor.profile.reviewCount})</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <VerifiedBadge />
                      {tutor.profile.nativeArabic && <NativeArabicBadge />}
                      {tutor.profile.hafiz && <HafizBadge />}
                      {tutor.profile.ijazaCertified && <IjazaBadge />}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-extrabold">${tutor.profile.perClassRate ?? tutor.profile.hourlyRate}</div>
                    <div className="text-xs text-white/70">per class</div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Bio */}
                <div>
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground">About</h3>
                  <p className="mt-1.5 text-sm leading-relaxed">{tutor.profile.bio}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <Stat icon={<Users className="h-4 w-4" />} value={tutor.profile.studentCount} label="Students" />
                  <Stat icon={<BookOpen className="h-4 w-4" />} value={tutor.profile.lessonsCount} label="Lessons" />
                  <Stat icon={<Clock className="h-4 w-4" />} value={`${tutor.profile.experienceYears} yrs`} label="Experience" />
                </div>

                {/* Specialties & languages */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">Specialties</h3>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {tutor.profile.specialties.map((s: string) => (
                        <Badge key={s} variant="secondary" className="bg-[oklch(0.62_0.14_230/0.1)] text-[oklch(0.40_0.11_258)]">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">Languages</h3>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {tutor.profile.languages.map((l: string) => (
                        <Badge key={l} variant="outline">{l}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Audio intro */}
                {tutor.profile.audioIntroText && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">Listen to intro</h3>
                    <div className="mt-1.5">
                      <AudioIntroPlayer text={tutor.profile.audioIntroText} name={tutor.name} />
                    </div>
                  </div>
                )}

                {/* Booking */}
                <div className="rounded-xl border-2 border-dashed border-[oklch(0.62_0.14_230/0.3)] bg-[oklch(0.62_0.14_230/0.04)] p-4">
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <Calendar className="h-4 w-4" /> Book a class
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Pick a day (next 7 days) and a time slot.</p>
                  <div className="mt-3 grid grid-cols-7 gap-1.5">
                    {days.map((d) => {
                      const date = addDays(startOfTomorrow(), d)
                      return (
                        <button
                          key={d}
                          onClick={() => setSelectedDay(d)}
                          className={cn(
                            'flex flex-col items-center rounded-lg border p-2 text-xs transition',
                            selectedDay === d
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-card hover:border-[oklch(0.62_0.14_230)]'
                          )}
                        >
                          <span className="font-medium">{format(date, 'EEE')}</span>
                          <span className="text-[10px] opacity-80">{format(date, 'd/M')}</span>
                        </button>
                      )
                    })}
                  </div>
                  {selectedDay !== null && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            'rounded-full border px-3 py-1 text-xs font-medium transition',
                            selectedSlot === slot
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-card hover:border-[oklch(0.62_0.14_230)]'
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reviews */}
                {tutor.reviews && tutor.reviews.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">Recent reviews</h3>
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto scrollbar-quran">
                      {tutor.reviews.map((r: any) => (
                        <div key={r.id} className="rounded-lg border border-border bg-card p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{r.studentName}</span>
                            <StarRating rating={r.rating} size={12} showValue={false} />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer actions */}
            <div className="flex flex-col gap-2 border-t border-border bg-muted/30 p-4 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1 gap-1.5 border-[oklch(0.78_0.15_85/0.5)] text-[oklch(0.55_0.13_75)] hover:bg-[oklch(0.78_0.15_85/0.1)]"
                onClick={() => handleBook(true)}
                disabled={createBooking.isPending}
              >
                <StarMedallion className="h-4 w-4" /> Book FREE trial
              </Button>
              <Button
                className="flex-1 gap-1.5 bg-[#0F4C81] text-white hover:bg-[#0E3D6B] transition-colors"
                onClick={() => handleBook(false)}
                disabled={createBooking.isPending}
              >
                {createBooking.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Book 30-min class
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
      <span className="text-[oklch(0.62_0.14_230)]">{icon}</span>
      <div>
        <div className="font-semibold text-sm">{value}</div>
        <div className="text-[10px] text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

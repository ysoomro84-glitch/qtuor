'use client'

import * as React from 'react'
import { useAppStore } from '@/lib/store'
import { useSessionBootstrap } from '@/hooks/use-session'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CheckoutModal } from '@/components/checkout/checkout-modal'
import { AIChatWidget } from '@/components/shared/ai-chat-widget'
import { Providers } from '@/components/providers'
import { usePlans } from '@/lib/queries'
import { LandingView } from '@/components/views/landing-view'
import { MarketplaceView } from '@/components/views/marketplace-view'
import { PlansView } from '@/components/views/plans-view'
import { LibraryView } from '@/components/views/library-view'
import { SubjectPage } from '@/components/views/subject-page'
import { AuthPage } from '@/components/views/auth-page'
import { BlogView } from '@/components/views/blog-view'
import { StudentDashboard } from '@/components/views/student-dashboard'
import { TutorDashboard } from '@/components/views/tutor-dashboard'
import { AdminDashboard } from '@/components/views/admin-dashboard'
import { ClassroomView } from '@/components/views/classroom-view'

function Shell() {
  useSessionBootstrap()
  const view = useAppStore((s) => s.view)
  const { selectedPlanId } = useAppStore()
  const { data: plansData } = usePlans()
  const plans = plansData?.plans
  const selectedPlan = plans?.find((p) => p.id === selectedPlanId) || null

  // Auth page is full-screen — no navbar, no footer
  if (view === 'auth') {
    return (
      <Providers>
        <AuthPage />
        <CheckoutModal plan={selectedPlan} />
      </Providers>
    )
  }

  // Dashboard views are full-screen with their own navigation — no navbar, no footer
  if (view === 'admin' || view === 'student-dashboard' || view === 'tutor-dashboard') {
    return (
      <Providers>
        {view === 'student-dashboard' && <StudentDashboard />}
        {view === 'tutor-dashboard' && <TutorDashboard />}
        {view === 'admin' && <AdminDashboard />}
        <CheckoutModal plan={selectedPlan} />
      </Providers>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {view === 'landing' && <LandingView />}
        {view === 'marketplace' && <MarketplaceView />}
        {view === 'plans' && <PlansView />}
        {view === 'library' && <LibraryView />}
        {view === 'subject' && <SubjectPage />}
        {view === 'blog' && <BlogView />}
        {view === 'classroom' && <ClassroomView />}
      </main>
      {view !== 'classroom' && <Footer />}
      <CheckoutModal plan={selectedPlan} />
      {view !== 'classroom' && <AIChatWidget />}
    </div>
  )
}

export default function Home() {
  return (
    <Providers>
      <Shell />
    </Providers>
  )
}

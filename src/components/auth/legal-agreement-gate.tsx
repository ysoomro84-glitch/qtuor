'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { ShieldCheck, ScrollText, ChevronLeft, Loader2, Lock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Tutor Legal Agreement Gate.
 *
 * Renders the full Qtuor Tutor Terms of Service & Instructor Agreement as a
 * scrollable contract. The user MUST scroll to the bottom of the text before
 * the mandatory checkbox becomes enabled, and must check the box before the
 * "Submit Application" button becomes enabled.
 *
 * Shared between src/components/views/auth-page.tsx (live full-screen auth)
 * and src/components/auth/auth-modal.tsx (legacy modal) to keep both entry
 * points in parity.
 */
export interface LegalAgreementGateProps {
  legalScrolled: boolean
  setLegalScrolled: (v: boolean) => void
  legalAccepted: boolean
  setLegalAccepted: (v: boolean) => void
  onSubmit: () => void
  onBack: () => void
  loading: boolean
  /** Optional max-height class for the scroll container. Defaults to 50vh. */
  scrollMaxClass?: string
}

const CLAUSES: { heading: string; body: React.ReactNode }[] = [
  {
    heading: '1. Classroom Code of Conduct',
    body: (
      <ul className="ml-4 list-disc space-y-1">
        <li>Tutors shall conduct themselves with the utmost professionalism, punctuality, and respect during every scheduled class.</li>
        <li>Classes must begin on time. Repeated late starts may result in penalties or suspension.</li>
        <li>A modest dress code is mandatory. Tutors must be dressed in clean, modest, and culturally appropriate attire during all live video sessions.</li>
        <li>Communication with students (especially minors) must remain respectful, encouraging, and strictly academic in nature.</li>
        <li>Any inappropriate, offensive, or non-Islamic content — including but not limited to profanity, inappropriate imagery, political or sectarian polemic, or personal advances — is strictly prohibited and will result in immediate account termination.</li>
      </ul>
    ),
  },
  {
    heading: '2. Non-Circumvention Policy',
    body: (
      <>
        <p className="mb-1">This is a zero-tolerance clause. To protect the integrity of the platform and its students:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Tutors may NOT take students off the Qtuor platform. All bookings, scheduling, and payments must occur through Qtuor.</li>
          <li>Tutors may NOT share direct contact information (WhatsApp numbers, phone numbers, personal email addresses, social media handles) with students during classes or via the in-class chat.</li>
          <li>Tutors may NOT solicit private, off-platform payments from students in any form (cash, bank transfer, PayPal, crypto, etc.).</li>
          <li>Violation of this clause results in <strong>immediate account termination</strong> and <strong>forfeiture of all pending payouts</strong>.</li>
        </ul>
      </>
    ),
  },
  {
    heading: '3. Flat Subscription Structure',
    body: (
      <>
        <p>Qtuor operates on a <strong>monthly subscription model</strong>, not an hourly model.</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Students subscribe to monthly plans offering 2, 3, 4, or 5 scheduled classes per week.</li>
          <li>Tutors are paid <strong>per scheduled class</strong> delivered from the student's subscription — not per hour.</li>
          <li>Each class is a 30-minute session by default (unless otherwise specified by the student's plan).</li>
          <li>Tutors cannot charge students extra fees outside the subscription structure.</li>
        </ul>
      </>
    ),
  },
  {
    heading: '4. 55% Payout Terms',
    body: (
      <ul className="ml-4 list-disc space-y-1">
        <li>The tutor receives <strong>55%</strong> of the student's monthly subscription fee.</li>
        <li>Qtuor retains <strong>45%</strong> for platform operations, payment processing, classroom infrastructure, marketing, and student support.</li>
        <li>Payouts are released <strong>monthly</strong>, between the 1st and 5th of each calendar month, for the prior month's delivered classes.</li>
        <li>Tutors may withdraw accrued earnings via supported methods (bank transfer or PayPal) once the minimum withdrawal threshold is met.</li>
        <li>Wallet balances, splits, and payout history are visible on the tutor dashboard.</li>
      </ul>
    ),
  },
  {
    heading: '5. Automated 15-Minute Auto-End Class Rule',
    body: (
      <ul className="ml-4 list-disc space-y-1">
        <li>All Qtuor virtual classrooms feature an automated class-end timer.</li>
        <li>Each class <strong>auto-ends</strong> at the scheduled duration plus a <strong>15-minute grace period</strong>.</li>
        <li>Sessions cannot overrun beyond this grace period. Tutors should plan lesson content to fit within the scheduled duration.</li>
        <li>The auto-end rule protects both students (predictable schedules) and tutors (predictable earnings).</li>
      </ul>
    ),
  },
  {
    heading: '6. $10 Registration Fee',
    body: (
      <ul className="ml-4 list-disc space-y-1">
        <li>A one-time, non-refundable <strong>$10 USD</strong> registration/activation fee is required after admin approval of the tutor application.</li>
        <li>The fee is collected via WhatsApp notification upon approval and must be paid before the tutor profile is publicly launched on the marketplace.</li>
        <li>This fee covers identity verification, profile review, and platform onboarding overhead.</li>
      </ul>
    ),
  },
  {
    heading: '7. Data & Privacy',
    body: (
      <ul className="ml-4 list-disc space-y-1">
        <li>Qtuor may record classroom sessions (video, audio, whiteboard, and chat) for child safety, quality assurance, dispute resolution, and tutor training purposes.</li>
        <li>By accepting this agreement, the tutor consents to such recording.</li>
        <li>Recordings are stored securely and access is restricted to authorized Qtuor staff.</li>
        <li>Personal data (name, email, WhatsApp, country, payout details) is handled in accordance with Qtuor's privacy policy and is never sold to third parties.</li>
      </ul>
    ),
  },
  {
    heading: '8. Account Termination',
    body: (
      <ul className="ml-4 list-disc space-y-1">
        <li>Qtuor reserves the right to suspend or terminate any tutor account at its sole discretion, including but not limited to: violations of this agreement, repeated student complaints, fraudulent activity, or conduct unbecoming of an Islamic educator.</li>
        <li>Upon termination for cause, pending payouts may be forfeited in part or in full.</li>
        <li>Upon termination without cause, accrued earnings will be released to the tutor's withdrawal method within 30 days.</li>
      </ul>
    ),
  },
  {
    heading: '9. Amendments',
    body: (
      <ul className="ml-4 list-disc space-y-1">
        <li>Qtuor may update or amend this agreement at any time. Tutors will be notified of material changes via WhatsApp or email.</li>
        <li>Continued use of the Qtuor platform after the effective date of any amendment constitutes acceptance of the updated terms.</li>
        <li>If a tutor does not agree with the amended terms, they must cease using the platform and may withdraw any accrued balance.</li>
      </ul>
    ),
  },
  {
    heading: '10. Governing Law & Acknowledgement',
    body: (
      <ul className="ml-4 list-disc space-y-1">
        <li>This agreement is governed by the laws applicable to Qtuor's operating jurisdiction.</li>
        <li>By checking the box below, the tutor acknowledges that they have read, understood, and voluntarily agree to be bound by all clauses of this agreement.</li>
        <li>The tutor's IP address, user agent, and acceptance timestamp will be recorded as a legally-binding electronic signature.</li>
      </ul>
    ),
  },
]

export function LegalAgreementGate({
  legalScrolled,
  setLegalScrolled,
  legalAccepted,
  setLegalAccepted,
  onSubmit,
  onBack,
  loading,
  scrollMaxClass = 'max-h-[50vh]',
}: LegalAgreementGateProps) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      if (!legalScrolled) setLegalScrolled(true)
    }
  }

  // Quick "jump to bottom" affordance — used by the hint pill.
  const jumpToBottom = () => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }

  const canSubmit = legalScrolled && legalAccepted && !loading

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="flex items-center gap-3 rounded-xl border p-4"
        style={{ borderColor: 'rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.06)' }}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
          style={{ background: '#0A192F' }}
        >
          <ScrollText className="h-5 w-5" style={{ color: '#D4AF37' }} />
        </span>
        <div>
          <h2 className="text-base font-extrabold leading-tight" style={{ color: '#0A192F' }}>
            Qtuor Tutor Terms of Service
          </h2>
          <p className="text-xs text-muted-foreground">
            &amp; Instructor Agreement · Version v1.0
          </p>
        </div>
      </div>

      {/* Intro line */}
      <p className="text-xs text-muted-foreground">
        Please review the full agreement below. You must scroll to the bottom and check the
        acceptance box before submitting your tutor application.
      </p>

      {/* Scrollable contract */}
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={cn(
            'relative w-full overflow-y-auto rounded-xl border border-border bg-white p-4',
            'scrollbar-quran text-sm leading-relaxed',
            scrollMaxClass,
          )}
        >
          <div className="space-y-4" style={{ color: '#1f2937' }}>
            <p className="text-xs italic text-muted-foreground">
              Effective Date: {new Date().getFullYear()} · Qtuor Global Online Quran Learning Platform
            </p>

            <p>
              This Tutor Terms of Service &amp; Instructor Agreement (the &ldquo;Agreement&rdquo;)
              is a legally binding contract between you (&ldquo;Tutor&rdquo;, &ldquo;you&rdquo;) and
              Qtuor (&ldquo;the Platform&rdquo;). By accepting this Agreement, you acknowledge that
              you have read, understood, and agree to comply with all of the following clauses:
            </p>

            {CLAUSES.map((c) => (
              <div key={c.heading} className="space-y-1.5">
                <h3 className="font-semibold" style={{ color: '#0A192F' }}>
                  {c.heading}
                </h3>
                <div className="space-y-1.5 text-[13px]">{c.body}</div>
              </div>
            ))}

            <p className="border-t border-border pt-3 text-xs text-muted-foreground">
              END OF AGREEMENT. By checking the box below and clicking &ldquo;Submit Application&rdquo;,
              you confirm your acceptance of all clauses above.
            </p>
          </div>
        </div>

        {/* Bottom gradient fade — visible until scrolled to bottom */}
        {!legalScrolled && (
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 rounded-b-xl"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 100%)' }}
          />
        )}
      </div>

      {/* Scroll hint */}
      <div className="flex min-h-[20px] items-center justify-between">
        {!legalScrolled ? (
          <button
            type="button"
            onClick={jumpToBottom}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium transition hover:underline"
            style={{ color: '#B8941F' }}
          >
            <Lock className="h-3 w-3" /> Scroll to the bottom to continue
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blue-600">
            <CheckCircle2 className="h-3 w-3" /> Agreement reviewed — you may now accept
          </span>
        )}
        <span className="text-[10px] text-muted-foreground">
          {legalScrolled ? 'Reached bottom ✓' : 'Scroll required'}
        </span>
      </div>

      {/* Sticky acceptance footer */}
      <div
        className="space-y-3 rounded-xl border p-4"
        style={{ borderColor: '#0A192F', background: 'rgba(10,25,47,0.02)' }}
      >
        <label
          className={cn(
            'flex cursor-pointer items-start gap-2.5 text-xs leading-snug',
            !legalScrolled && 'cursor-not-allowed opacity-50',
          )}
        >
          <input
            type="checkbox"
            checked={legalAccepted}
            disabled={!legalScrolled}
            onChange={(e) => setLegalAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-[#0A192F] disabled:cursor-not-allowed"
          />
          <span>
            I have read, understood, and agree to follow the Qtuor Tutor Terms of Service &amp;
            Instructor Agreement. I understand this is a legally binding electronic signature and
            that my IP address and user agent will be recorded.
          </span>
        </label>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={loading}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="flex-1 gap-1.5 text-white"
            style={{ background: '#0A192F' }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Submit Application
          </Button>
        </div>
        {!canSubmit && (
          <p className="text-center text-[11px] text-muted-foreground">
            Read the agreement and check the box to continue.
          </p>
        )}
      </div>
    </div>
  )
}

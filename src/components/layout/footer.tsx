'use client'

import * as React from 'react'
import { useAppStore, type ViewKey } from '@/lib/store'
import { QtuorLogoLockup } from '@/components/brand/logo'
import { StarMedallion } from '@/components/brand/patterns'
import { Mail, Globe, Heart } from 'lucide-react'

const FOOTER_LINKS: { title: string; items: { label: string; view?: ViewKey }[] }[] = [
  {
    title: 'Learn',
    items: [
      { label: 'Find Tutors', view: 'marketplace' },
      { label: 'Subscription Plans', view: 'plans' },
      { label: 'Free Trial Class', view: 'marketplace' },
      { label: 'Virtual Classroom', view: 'classroom' },
      { label: 'Blog', view: 'blog' },
    ],
  },
  {
    title: 'Teach',
    items: [
      { label: 'Become a Tutor', view: 'tutor-dashboard' },
      { label: 'Tutor Dashboard', view: 'tutor-dashboard' },
      { label: 'Earnings & Wallet', view: 'tutor-dashboard' },
      { label: 'Verification Center', view: 'tutor-dashboard' },
    ],
  },
  {
    title: 'Platform',
    items: [
      { label: 'Student Dashboard', view: 'student-dashboard' },
      { label: 'Admin Panel', view: 'admin' },
      { label: 'How it Works', view: 'landing' },
      { label: 'Pricing', view: 'plans' },
    ],
  },
]

export function Footer() {
  const setView = useAppStore((s) => s.setView)

  return (
    <footer className="mt-auto relative overflow-hidden bg-[oklch(0.30_0.10_258)] text-white/90">
      {/* Pattern overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden>
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-girih" width="70" height="70" patternUnits="userSpaceOnUse">
              <g fill="none" stroke="white" strokeWidth="1">
                <path d="M35 0 L50 22 L35 44 L20 22 Z" />
                <path d="M0 35 L22 50 L44 35 L22 20 Z" />
                <circle cx="35" cy="35" r="5" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-girih)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <QtuorLogoLockup onDark />
            <p className="mt-4 max-w-sm text-sm text-white/70">
              The global marketplace connecting certified Quran tutors with students worldwide.
              Learn Noorani Qaida, Quran Recitation With Tajweed, Hifz and Arabic in a real-time interactive classroom.
            </p>
            <div className="mt-4 flex items-center gap-2 text-white/80">
              <StarMedallion className="h-5 w-5" />
              <span className="font-arabic text-base" dir="rtl">رَبِّ زِدْنِي عِلْمًا</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/60">
              <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> support@qtuor.com</span>
              <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> www.qtuor.com</span>
            </div>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white">{col.title}</h4>
              <ul className="mt-3 space-y-2">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => item.view && setView(item.view)}
                      className="text-sm text-white/65 transition hover:text-white"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/55 sm:flex-row">
          <p>© {new Date().getFullYear()} Qtuor. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5">
            Built with <Heart className="h-3.5 w-3.5 fill-[oklch(0.62_0.14_230)] text-[oklch(0.62_0.14_230)]" /> for the global Ummah
          </p>
        </div>
      </div>
    </footer>
  )
}

'use client'

import * as React from 'react'
import { usePublicWhatsAppSettings } from '@/lib/queries'

/**
 * Compact Animated WhatsApp Floating Widget
 *
 * 50px micro-sized trigger button with:
 *  • Infinite vertical float + rotate animation (dynamicFloat)
 *  • Dual concentric ripple rings (pulse-wave wave-one/wave-two)
 *  • 260px slide-out mini support card with Qtuor brand "Q" avatar
 *  • Crisp SVG WhatsApp icon (scales without pixelation)
 *
 * The mini card slides open on click and reveals a "Chat Now" button that
 * deep-links to wa.me with the admin's configured phone number + prefilled
 * message. Respects the admin "showFloatingWidget" toggle.
 */
export function FloatingWhatsAppWidget() {
  const { data: settingsData } = usePublicWhatsAppSettings()
  const settings = settingsData?.settings
  const [open, setOpen] = React.useState(false)

  // Don't render if settings say to hide it, or while loading
  if (settings && !settings.showFloatingWidget) return null
  if (!settings) return null

  const adminPhone = settings.adminPhone?.replace(/[^\d]/g, '') || '1234567890'
  const defaultMessage = encodeURIComponent(
    'Assalamu Alaikum Qtuor, I have a question about classes.'
  )
  const whatsappUrl = `https://wa.me/${adminPhone}?text=${defaultMessage}`

  return (
    <div className={`compact-wa-widget ${open ? 'open' : ''}`}>
      {/* MINI POP-UP CARD (Reveals smoothly on click) */}
      <div className="mini-wa-card" id="miniWaCard">
        <div className="mini-card-body">
          <div className="mini-avatar-block">
            <div className="mini-avatar">Q</div>
            <span className="online-pulse" />
          </div>
          <div className="mini-card-text">
            <h5>Qtuor Support</h5>
            <p>Online · Ask anything</p>
          </div>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mini-connect-btn"
        >
          Chat Now ➜
        </a>
      </div>

      {/* THE HIGHLY ANIMATED INTERACTIVE ACTION TRIGGER */}
      <button
        className="mini-trigger-action"
        onClick={() => setOpen((o) => !o)}
        id="miniWaBtn"
        aria-label={open ? 'Close WhatsApp chat' : 'Open WhatsApp chat'}
        aria-expanded={open}
      >
        {/* SVG Vector used for crisp scaling instead of image asset */}
        {open ? (
          <svg viewBox="0 0 320 512" width="20" height="20" fill="#ffffff" aria-hidden>
            <path d="M310.6 361.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L160 301.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L114.7 256 9.4 150.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 210.7 265.4 105.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L205.3 256l105.3 105.4z" />
          </svg>
        ) : (
          <svg className="wa-svg-icon" viewBox="0 0 448 512" width="22" height="22" fill="#ffffff" aria-hidden>
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
          </svg>
        )}

        {/* DUAL COMPONENT RIPPLE EFFECT LAYER (only when closed) */}
        {!open && (
          <>
            <span className="pulse-wave wave-one" />
            <span className="pulse-wave wave-two" />
          </>
        )}
      </button>
    </div>
  )
}

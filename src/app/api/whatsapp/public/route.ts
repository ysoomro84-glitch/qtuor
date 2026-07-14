import { NextResponse } from 'next/server'

/**
 * Public WhatsApp settings — only returns the fields needed by the
 * floating widget and "Ask about this tutor" button (no credentials).
 */
export async function GET() {
  try {
    const { db } = await import('@/lib/db')
    let settings = await db.whatsAppSettings.findUnique({ where: { id: 'singleton' } })
    if (!settings) {
      settings = await db.whatsAppSettings.create({ data: { id: 'singleton' } })
    }
    return NextResponse.json({
      settings: {
        enabled: settings.enabled,
        adminPhone: settings.adminPhone,
        showFloatingWidget: settings.showFloatingWidget,
        allowTutorContactAdmin: settings.allowTutorContactAdmin,
      },
    })
  } catch (e) {
    // Fallback: show widget with defaults when DB is unavailable
    return NextResponse.json({
      settings: {
        enabled: true,
        adminPhone: '+1234567890',
        showFloatingWidget: true,
        allowTutorContactAdmin: true,
      },
    })
  }
}

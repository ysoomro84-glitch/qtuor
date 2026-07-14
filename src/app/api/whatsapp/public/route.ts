import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Public WhatsApp settings — only returns the fields needed by the
 * floating widget and "Ask about this tutor" button (no credentials).
 */
export async function GET() {
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
}

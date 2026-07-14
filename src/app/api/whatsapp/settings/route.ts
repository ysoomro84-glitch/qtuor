import { NextRequest, NextResponse } from 'next/server'

const _getDb = () => import("@/lib/db").then(m => m.db);
const _getAuth = () => import("@/lib/auth").then(m => m.getSession);

export async function GET() {
  const session = (await _getAuth())
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }
  let settings = await (await _getDb()).whatsAppSettings.findUnique({ where: { id: 'singleton' } })
  if (!settings) {
    settings = await (await _getDb()).whatsAppSettings.create({ data: { id: 'singleton' } })
  }
  return NextResponse.json({ settings })
}

export async function PATCH(req: NextRequest) {
  const session = (await _getAuth())
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }
  const body = await req.json()
  const allowed = [
    'enabled', 'adminPhone', 'provider', 'accountSid', 'authToken', 'fromNumber',
    'notifyTutorApproved', 'notifyBookingConfirmation', 'notifyClassReminder',
    'notifyPaymentSuccess', 'notifyTutorPayout', 'reminderMinutesBefore',
    'showFloatingWidget', 'allowTutorContactAdmin',
  ]
  const data: any = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }
  const settings = await (await _getDb()).whatsAppSettings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  })
  return NextResponse.json({ settings })
}

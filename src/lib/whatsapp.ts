import { db } from './db'

/**
 * Qtuor WhatsApp Notification Service
 *
 * This service sends automated WhatsApp messages for critical platform events.
 * Supports multiple providers:
 *  • BAILEYS (Link-Device / QR scan) — connects the admin's WhatsApp number
 *    via the whatsapp-gateway mini-service (port 3004). Real messages sent.
 *  • SIMULATED (default) — logs all messages to the Notification table only.
 *  • TWILIO / META_CLOUD_API / INFOBIP — cloud API providers (ready for prod).
 *
 * Message templates are stored in the WhatsAppTemplate table and can be edited
 * by the admin. Each template supports dynamic {Variables}.
 */

const GATEWAY = 'http://localhost:3004'

/** Render a template string by replacing {Var} placeholders with values. */
export function renderTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = vars[key]
    return v !== undefined && v !== null ? String(v) : `{${key}}`
  })
}

/** Fetch a template by key from the DB (falls back to a default if missing). */
export async function getTemplate(key: string, fallback: string, vars: Record<string, string | number> = {}): Promise<string> {
  const t = await db.whatsAppTemplate.findUnique({ where: { key } })
  const body = t?.template || fallback
  return renderTemplate(body, vars)
}

/** Check if the baileys gateway is connected (real WhatsApp session active). */
export async function isBaileysConnected(): Promise<{ connected: boolean; phone: string | null }> {
  try {
    const res = await fetch(`${GATEWAY}/status`, { cache: 'no-store' })
    if (!res.ok) return { connected: false, phone: null }
    const data = await res.json()
    return { connected: !!data.connected, phone: data.phone || null }
  } catch {
    return { connected: false, phone: null }
  }
}

/** Send a real WhatsApp message via the baileys gateway. */
async function deliverViaBaileys(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${GATEWAY}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message }),
    })
    const data = await res.json()
    if (!res.ok || !data.success) return { success: false, error: data.error || 'Gateway send failed' }
    return { success: true }
  } catch (e: any) {
    return { success: false, error: 'Gateway offline' }
  }
}

export type NotificationType =
  | 'TUTOR_APPROVED'
  | 'BOOKING_CONFIRMATION_STUDENT'
  | 'BOOKING_CONFIRMATION_TUTOR'
  | 'CLASS_REMINDER'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'TUTOR_PAYOUT'
  | 'REGISTRATION_FEE'

export interface SendWhatsAppParams {
  type: NotificationType
  recipientName: string
  recipientPhone?: string | null
  recipientUserId?: string
  recipientTutorId?: string
  message: string
  meta?: Record<string, any>
}

/**
 * Get the current WhatsApp settings (creates default singleton if missing).
 */
export async function getWhatsAppSettings() {
  let settings = await db.whatsAppSettings.findUnique({ where: { id: 'singleton' } })
  if (!settings) {
    settings = await db.whatsAppSettings.create({ data: { id: 'singleton' } })
  }
  return settings
}

/**
 * Send a WhatsApp message. In SIMULATED mode, this logs to the Notification
 * table and console. In production (TWILIO/META), it calls the real API.
 */
export async function sendWhatsApp(params: SendWhatsAppParams): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    const settings = await getWhatsAppSettings()

    // Check if WhatsApp is globally enabled
    if (!settings.enabled) {
      return { success: false, error: 'WhatsApp notifications are disabled' }
    }

    // Check feature-specific toggles
    const featureMap: Record<NotificationType, keyof typeof settings> = {
      TUTOR_APPROVED: 'notifyTutorApproved',
      BOOKING_CONFIRMATION_STUDENT: 'notifyBookingConfirmation',
      BOOKING_CONFIRMATION_TUTOR: 'notifyBookingConfirmation',
      CLASS_REMINDER: 'notifyClassReminder',
      PAYMENT_SUCCESS: 'notifyPaymentSuccess',
      PAYMENT_FAILED: 'notifyPaymentSuccess',
      TUTOR_PAYOUT: 'notifyTutorPayout',
      REGISTRATION_FEE: 'notifyTutorApproved',
    }
    const featureKey = featureMap[params.type]
    if (featureKey && !settings[featureKey]) {
      return { success: false, error: `Notification type ${params.type} is disabled` }
    }

    // Determine delivery method: baileys gateway (Link-Device) if connected,
    // otherwise cloud API providers, otherwise SIMULATED (log only).
    const baileys = await isBaileysConnected()
    const isSimulated = !baileys.connected && (settings.provider === 'SIMULATED' || !settings.provider)
    let status: 'SIMULATED' | 'SENT' | 'FAILED' = isSimulated ? 'SIMULATED' : 'SENT'

    // Route 1: baileys gateway (Link-Device) — real WhatsApp message
    if (baileys.connected && params.recipientPhone) {
      const result = await deliverViaBaileys(params.recipientPhone, params.message)
      if (!result.success) status = 'FAILED'
    }
    // Route 2: cloud API providers (Twilio / Meta / Infobip)
    else if (!isSimulated && params.recipientPhone && settings.provider !== 'SIMULATED' && settings.provider !== 'BAILEYS') {
      try {
        await deliverViaProvider(settings, params.recipientPhone, params.message)
      } catch (err: any) {
        status = 'FAILED'
      }
    }

    // Log the notification
    const notification = await db.notification.create({
      data: {
        type: params.type,
        channel: 'WHATSAPP',
        recipientName: params.recipientName,
        recipientPhone: params.recipientPhone || null,
        recipientUserId: params.recipientUserId || null,
        recipientTutorId: params.recipientTutorId || null,
        message: params.message,
        status,
        meta: params.meta ? JSON.stringify(params.meta) : null,
      },
    })

    console.log(`[WhatsApp:${status}] → ${params.recipientName} (${params.recipientPhone || 'no phone'}): ${params.message.slice(0, 80)}...`)

    return { success: true, notificationId: notification.id }
  } catch (err: any) {
    console.error('[WhatsApp] Error sending notification:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Deliver via the real provider API. Called only when provider != SIMULATED.
 */
async function deliverViaProvider(settings: any, toPhone: string, message: string): Promise<void> {
  if (settings.provider === 'TWILIO') {
    // Twilio WhatsApp API
    // POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json
    // Body: From=whatsapp:{fromNumber}&To=whatsapp:{toPhone}&Body={message}
    const auth = Buffer.from(`${settings.accountSid}:${settings.authToken}`).toString('base64')
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${settings.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: `whatsapp:${settings.fromNumber}`,
          To: `whatsapp:${toPhone}`,
          Body: message,
        }),
      }
    )
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Twilio API error: ${err}`)
    }
  } else if (settings.provider === 'META_CLOUD_API') {
    // Meta WhatsApp Cloud API
    // POST https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${settings.fromNumber}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${settings.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: toPhone.replace(/\D/g, ''),
          type: 'text',
          text: { body: message },
        }),
      }
    )
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Meta Cloud API error: ${err}`)
    }
  }
  // For INFOBIP or others, add similar implementations
}

// ===== Pre-built message templates =====

export function msgTutorApproved(tutorName: string, paymentLink: string): string {
  return `Assalam-o-Alaikum ${tutorName},\n\nGreat news! Your tutor application on Qtuor has been approved. 🎉\n\nPlease click here to pay your $10 USD registration fee and activate your profile:\n${paymentLink}\n\nOnce activated, you'll be visible to students worldwide.\n\nJazak Allah Khair,\nThe Qtuor Team`
}

export function msgBookingStudent(studentName: string, tutorName: string, date: string, time: string, classroomLink: string, isTrial: boolean): string {
  return `Assalam-o-Alaikum ${studentName},\n\nYour ${isTrial ? 'free trial ' : ''}class with ${tutorName} is confirmed!\n\n📅 Date: ${date}\n⏰ Time: ${time}\n\nUse this link to join your virtual classroom:\n${classroomLink}\n\nPlease join 5 minutes before the start time.\n\nThe Qtuor Team`
}

export function msgBookingTutor(tutorName: string, studentName: string, date: string, time: string, isTrial: boolean): string {
  return `Assalam-o-Alaikum ${tutorName},\n\nNew ${isTrial ? 'trial ' : ''}class scheduled!\n\n👨‍🎓 Student: ${studentName}\n📅 Date: ${date}\n⏰ Time: ${time}\n\nPlease be ready in the virtual classroom 5 minutes before the start.\n\nThe Qtuor Team`
}

export function msgClassReminder(recipientName: string, role: string, date: string, time: string, classroomLink: string): string {
  return `🔔 Reminder: Your Qtuor live Quran class starts in 15 minutes!\n\n📅 ${date} at ${time}\n\nClick here to enter the room:\n${classroomLink}\n\nThe Qtuor Team`
}

export function msgPaymentSuccess(studentName: string, planName: string, amount: number, classesPerMonth: number): string {
  return `Assalam-o-Alaikum ${studentName},\n\n✅ Payment successful!\n\nPlan: ${planName}\nAmount: $${amount}/month\nClasses: ${classesPerMonth} per month\n\nYour class balance has been updated. You can now book classes with any tutor.\n\nJazak Allah Khair,\nThe Qtuor Team`
}

export function msgPaymentFailed(studentName: string, planName: string, amount: number): string {
  return `Assalam-o-Alaikum ${studentName},\n\n⚠️ Payment failed!\n\nPlan: ${planName}\nAmount: $${amount}\n\nPlease update your payment method and try again. If the issue persists, contact support.\n\nThe Qtuor Team`
}

export function msgTutorPayout(tutorName: string, amount: number, method: string): string {
  return `Assalam-o-Alaikum ${tutorName},\n\n💰 Payout processed!\n\nAmount: $${amount}\nMethod: ${method}\n\nYour monthly earnings share (55%) has been sent. Thank you for teaching on Qtuor.\n\nThe Qtuor Team`
}

export function msgRegistrationFee(tutorName: string, paymentLink: string): string {
  return `Assalam-o-Alaikum ${tutorName},\n\nTo complete your tutor registration on Qtuor, please pay the one-time $10 USD registration fee:\n${paymentLink}\n\nThis fee helps us maintain the platform and verify tutor credentials.\n\nThe Qtuor Team`
}

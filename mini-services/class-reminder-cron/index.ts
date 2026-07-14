/**
 * Qtuor — Class Reminder Cron Service
 *
 * Runs every 5 minutes and checks for upcoming classes that start in ~15 minutes.
 * When found, sends WhatsApp reminders to both the student and the tutor.
 *
 * Architecture:
 *  • Connects to the same SQLite database as the main app.
 *  • Uses the whatsapp notification service (imported from the main app's lib).
 *  • In SIMULATED mode, reminders are logged to the Notification table.
 *  • In production (Twilio/Meta), real WhatsApp messages are sent.
 */

// Use the main app's generated Prisma client
import { PrismaClient } from '/home/z/my-project/node_modules/@prisma/client'

const db = new PrismaClient()

const CHECK_INTERVAL_MS = 5 * 60 * 1000 // check every 5 minutes
const REMINDER_WINDOW_MIN = 13 // send reminder if class is 13-18 min away (catches the 15-min mark within the 5-min check cycle)
const REMINDER_WINDOW_MAX = 18

interface UpcomingBooking {
  id: string
  scheduledAt: Date
  meetingId: string | null
  isTrial: boolean
  status: string
  student: { id: string; name: string; phone: string | null }
  tutor: { id: string; name: string; phone: string | null }
}

async function checkAndSendReminders() {
  try {
    const now = new Date()
    const windowStart = new Date(now.getTime() + REMINDER_WINDOW_MIN * 60 * 1000)
    const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MAX * 60 * 1000)

    // Find SCHEDULED bookings that start within the reminder window
    const upcoming = await db.booking.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { gte: windowStart, lte: windowEnd },
      },
      include: {
        student: { select: { id: true, name: true, phone: true } },
        tutor: { select: { id: true, name: true, phone: true } },
      },
    })

    if (upcoming.length === 0) return

    // Get WhatsApp settings
    let settings = await db.whatsAppSettings.findUnique({ where: { id: 'singleton' } })
    if (!settings) {
      settings = await db.whatsAppSettings.create({ data: { id: 'singleton' } })
    }

    if (!settings.enabled || !settings.notifyClassReminder) {
      console.log(`[reminder-cron] WhatsApp reminders disabled, skipping ${upcoming.length} bookings`)
      return
    }

    console.log(`[reminder-cron] Found ${upcoming.length} upcoming class(es) needing reminders`)

    for (const booking of upcoming) {
      // Check if we already sent a CLASS_REMINDER for this booking (avoid duplicates)
      const existing = await db.notification.findFirst({
        where: {
          type: 'CLASS_REMINDER',
          meta: { contains: booking.id },
        },
      })
      if (existing) {
        console.log(`[reminder-cron] Already sent reminder for booking ${booking.id}, skipping`)
        continue
      }

      const classDate = booking.scheduledAt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
      const classTime = booking.scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      const classroomLink = `https://www.qtuor.com/?classroom=${booking.meetingId || ''}`

      // ===== Check if the baileys WhatsApp gateway is connected =====
      let baileysConnected = false
      try {
        const gwRes = await fetch('http://localhost:3004/status')
        if (gwRes.ok) {
          const gwData = await gwRes.json()
          baileysConnected = !!gwData.connected
        }
      } catch {}

      // ===== Fetch the CLASS_REMINDER template (with {TutorName} etc.) =====
      let templateBody = 'Reminder: Your Quran lesson with Tutor {TutorName} is starting in 15 minutes. Please join your interactive virtual classroom dashboard: {ClassroomLink}'
      try {
        const t = await db.whatsAppTemplate.findUnique({ where: { key: 'CLASS_REMINDER' } })
        if (t?.template) templateBody = t.template
      } catch {}

      const renderMsg = (vars: Record<string, string>) =>
        templateBody.replace(/\{(\w+)\}/g, (_, k) => vars[k] !== undefined ? vars[k] : `{${k}}`)

      const sendViaGateway = async (phone: string, message: string): Promise<boolean> => {
        if (!baileysConnected) return false
        try {
          const r = await fetch('http://localhost:3004/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: phone, message }),
          })
          const d = await r.json()
          return !!d.success
        } catch { return false }
      }

      const status = baileysConnected ? 'SENT' : (settings.provider === 'SIMULATED' ? 'SIMULATED' : 'SENT')

      // Send to student
      if (booking.student.phone) {
        const msg = renderMsg({ StudentName: booking.student.name, TutorName: booking.tutor.name, ClassTime: `${classDate} at ${classTime}`, ClassroomLink: classroomLink })
        if (baileysConnected) await sendViaGateway(booking.student.phone, msg)
        await db.notification.create({
          data: {
            type: 'CLASS_REMINDER',
            channel: 'WHATSAPP',
            recipientName: booking.student.name,
            recipientPhone: booking.student.phone,
            recipientUserId: booking.student.id,
            message: msg,
            status,
            meta: JSON.stringify({ bookingId: booking.id, role: 'student', delivered: baileysConnected }),
          },
        })
        console.log(`[reminder-cron] → Student ${booking.student.name}: reminder ${status}`)
      }

      // Send to tutor
      if (booking.tutor.phone) {
        const msg = renderMsg({ StudentName: booking.student.name, TutorName: booking.tutor.name, ClassTime: `${classDate} at ${classTime}`, ClassroomLink: classroomLink })
        if (baileysConnected) await sendViaGateway(booking.tutor.phone, msg)
        await db.notification.create({
          data: {
            type: 'CLASS_REMINDER',
            channel: 'WHATSAPP',
            recipientName: booking.tutor.name,
            recipientPhone: booking.tutor.phone,
            recipientUserId: booking.tutor.id,
            message: msg,
            status,
            meta: JSON.stringify({ bookingId: booking.id, role: 'tutor', delivered: baileysConnected }),
          },
        })
        console.log(`[reminder-cron] → Tutor ${booking.tutor.name}: reminder ${status}`)
      }
    }
  } catch (err) {
    console.error('[reminder-cron] Error:', err)
  }
}

// Run immediately on start
checkAndSendReminders()

// Then run every 5 minutes
setInterval(checkAndSendReminders, CHECK_INTERVAL_MS)

console.log(`[reminder-cron] Service started — checking every ${CHECK_INTERVAL_MS / 1000 / 60} minutes for classes starting in ~15 min`)

process.on('SIGTERM', () => { process.exit(0) })
process.on('SIGINT', () => { process.exit(0) })

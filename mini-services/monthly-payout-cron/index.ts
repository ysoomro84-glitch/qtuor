/**
 * Qtuor — Monthly Payout Cron Service
 *
 * Runs daily and checks if today is between the 1st and 5th of the month.
 * If so, processes all ESCROWED wallet splits whose subscription cycle has ended:
 *  • Releases 55% of the plan price to the tutor's withdrawable wallet balance.
 *  • 45% becomes platform revenue.
 *  • Sends WhatsApp payout notifications to tutors.
 *
 * Architecture:
 *  • Connects to the same SQLite database as the main app.
 *  • Uses the billing service's processTutorMonthlyPayouts() function.
 *  • Runs once per day (idempotent — won't re-release already-released splits).
 */

import { PrismaClient } from '/home/z/my-project/node_modules/@prisma/client'

const db = new PrismaClient()
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000 // check once per day

async function runMonthlyPayoutCycle() {
  const now = new Date()
  const dayOfMonth = now.getDate()

  // Only run between the 1st and 5th of the month
  if (dayOfMonth < 1 || dayOfMonth > 5) {
    console.log(`[payout-cron] Day ${dayOfMonth} — not in payout window (1st-5th). Skipping.`)
    return
  }

  console.log(`[payout-cron] Day ${dayOfMonth} — processing monthly payouts...`)

  try {
    // Find all ESCROWED splits where the subscription has expired or been cancelled
    const splits = await db.walletSplit.findMany({
      where: {
        status: 'ESCROWED',
        subscription: {
          OR: [
            { expiresAt: { lt: now } },
            { status: 'CANCELLED' },
          ],
        },
      },
      include: {
        tutor: { select: { id: true, name: true, phone: true } },
        subscription: { include: { plan: true } },
      },
    })

    if (splits.length === 0) {
      console.log('[payout-cron] No escrowed splits ready for release.')
      return
    }

    console.log(`[payout-cron] Found ${splits.length} split(s) to release.`)

    let processed = 0
    let totalReleased = 0

    for (const split of splits) {
      try {
        // Release 55% to tutor wallet
        await db.walletSplit.update({
          where: { id: split.id },
          data: { status: 'RELEASED', releasedAt: now },
        })

        await db.wallet.upsert({
          where: { tutorId: split.tutorId },
          update: {
            escrowHeld: { decrement: split.planPrice },
            balance: { increment: split.tutorShare },
            totalEarned: { increment: split.tutorShare },
            platformRevenue: { increment: split.platformShare },
          },
          create: {
            tutorId: split.tutorId,
            balance: split.tutorShare,
            totalEarned: split.tutorShare,
            platformRevenue: split.platformShare,
          },
        })

        // Log the notification (WhatsApp message)
        if (split.tutor.phone) {
          await db.notification.create({
            data: {
              type: 'TUTOR_PAYOUT',
              channel: 'WHATSAPP',
              recipientName: split.tutor.name,
              recipientPhone: split.tutor.phone,
              recipientUserId: split.tutor.id,
              message: `Assalam-o-Alaikum ${split.tutor.name},\n\n💰 Payout processed!\n\nAmount: $${split.tutorShare}\nMethod: Bank/PayPal (Stripe Connect)\n\nYour monthly earnings share (55%) has been sent. Thank you for teaching on Qtuor.\n\nThe Qtuor Team`,
              status: 'SIMULATED',
              meta: JSON.stringify({ splitId: split.id, amount: split.tutorShare, planName: split.planName }),
            },
          })
        }

        processed++
        totalReleased += split.tutorShare
        console.log(`[payout-cron] ✓ Released $${split.tutorShare} to ${split.tutor.name} (${split.planName})`)
      } catch (err) {
        console.error(`[payout-cron] ✗ Error releasing split ${split.id}:`, err)
      }
    }

    console.log(`[payout-cron] Done. Processed ${processed} splits, released $${totalReleased} total.`)
  } catch (err) {
    console.error('[payout-cron] Error:', err)
  }
}

// Run immediately on start
runMonthlyPayoutCycle()

// Then check daily
setInterval(runMonthlyPayoutCycle, CHECK_INTERVAL_MS)

console.log(`[payout-cron] Service started — checking daily for monthly payout window (1st-5th of month)`)

process.on('SIGTERM', () => { process.exit(0) })
process.on('SIGINT', () => { process.exit(0) })

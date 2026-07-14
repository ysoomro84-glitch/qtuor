import { db } from './db'

/**
 * Qtuor — Billing & Revenue Split Service
 *
 * Model: Fixed Monthly Subscription with 55/45 Escrow Split
 *  • Student pays a flat monthly rate (e.g. $100) for scheduled classes.
 *  • No hourly credits, no per-class deductions.
 *  • On subscribe: the full monthly amount is held in platform escrow.
 *  • On monthly cycle (1st–5th of month): 55% is released to the tutor's
 *    withdrawable wallet balance; 45% becomes platform revenue.
 *
 * Revenue split: 55% tutor / 45% platform (fixed).
 */

export const TUTOR_SHARE_PERCENT = 55
export const PLATFORM_SHARE_PERCENT = 45

/**
 * When a student subscribes, create a WalletSplit entry in ESCROWED state.
 * The full plan price is held in escrow (not yet in the tutor's wallet).
 *
 * Note: The tutor is determined by finding the tutor the student has the most
 * bookings with, or — if no bookings yet — we create the split when the first
 * booking's class is completed (the "assigned tutor" for that subscription cycle).
 *
 * For simplicity in this implementation, we create the escrow split when the
 * student subscribes, assigned to the first tutor they book with. If they have
 * no tutor yet, the split is created as "unassigned" and matched when the first
 * booking is made.
 */
export async function createEscrowSplit(
  subscriptionId: string,
  studentId: string,
  studentName: string,
  planName: string,
  planPrice: number,
  tutorId?: string
): Promise<{ splitId: string; tutorShare: number; platformShare: number }> {
  const tutorShare = (planPrice * TUTOR_SHARE_PERCENT) / 100
  const platformShare = (planPrice * PLATFORM_SHARE_PERCENT) / 100

  // If we have a tutor, create the split and update their wallet's escrowHeld
  if (tutorId) {
    const split = await db.walletSplit.create({
      data: {
        subscriptionId,
        tutorId,
        studentName,
        planName,
        planPrice,
        tutorShare,
        platformShare,
        status: 'ESCROWED',
      },
    })

    // Add to the tutor's escrowHeld (money held, not yet withdrawable)
    await db.wallet.upsert({
      where: { tutorId },
      update: { escrowHeld: { increment: planPrice } },
      create: { tutorId, escrowHeld: planPrice },
    })

    return { splitId: split.id, tutorShare, platformShare }
  }

  // No tutor yet — we'll create the split when the first booking is made.
  // For now, just return the calculation.
  return { splitId: '', tutorShare, platformShare }
}

/**
 * Release the 55% tutor share from escrow to the tutor's withdrawable balance.
 * Called by the monthly payout cron (1st–5th of month) for all ESCROWED splits
 * whose subscription cycle has ended.
 */
export async function releaseTutorShare(splitId: string): Promise<{ success: boolean; amount?: number; error?: string }> {
  try {
    const split = await db.walletSplit.findUnique({
      where: { id: splitId },
      include: { subscription: true },
    })
    if (!split) return { success: false, error: 'Split not found' }
    if (split.status !== 'ESCROWED') return { success: false, error: `Split is ${split.status}, not ESCROWED` }

    // Update the split to RELEASED
    await db.walletSplit.update({
      where: { id: splitId },
      data: {
        status: 'RELEASED',
        releasedAt: new Date(),
      },
    })

    // Move money from escrow → balance (55%) + platform revenue (45%)
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

    console.log(`[billing] Released $${split.tutorShare} (55%) to tutor ${split.tutorId} for ${split.planName}`)
    return { success: true, amount: split.tutorShare }
  } catch (err: any) {
    console.error('[billing] Error releasing tutor share:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Process all ESCROWED splits for a given tutor whose subscription cycle has ended.
 * Called by the monthly payout cron.
 */
export async function processTutorMonthlyPayouts(tutorId?: string): Promise<{ processed: number; totalReleased: number }> {
  // Find all ESCROWED splits where the subscription has expired or a new cycle started
  const splits = await db.walletSplit.findMany({
    where: {
      status: 'ESCROWED',
      ...(tutorId ? { tutorId } : {}),
      OR: [
        { subscription: { expiresAt: { lt: new Date() } } },
        { subscription: { status: 'CANCELLED' } },
      ],
    },
  })

  let processed = 0
  let totalReleased = 0

  for (const split of splits) {
    const result = await releaseTutorShare(split.id)
    if (result.success) {
      processed++
      totalReleased += result.amount || 0
    }
  }

  console.log(`[billing] Processed ${processed} splits, released $${totalReleased} total`)
  return { processed, totalReleased }
}

/**
 * Get the tutor's wallet ledger — all splits (escrowed + released) with
 * student name, plan name, amounts, and status.
 */
export async function getTutorWalletLedger(tutorId: string) {
  const [wallet, splits, withdrawals] = await Promise.all([
    db.wallet.upsert({
      where: { tutorId },
      update: {},
      create: { tutorId },
    }),
    db.walletSplit.findMany({
      where: { tutorId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    db.withdrawal.findMany({
      where: { tutorId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  return {
    wallet,
    splits,
    withdrawals,
    // Summary
    summary: {
      balance: wallet.balance,
      escrowHeld: wallet.escrowHeld,
      totalEarned: wallet.totalEarned,
      platformRevenue: wallet.platformRevenue,
      pendingPayout: wallet.pendingPayout,
      pendingSplits: splits.filter((s) => s.status === 'ESCROWED').length,
      pendingAmount: splits.filter((s) => s.status === 'ESCROWED').reduce((sum, s) => sum + s.tutorShare, 0),
    },
  }
}

/**
 * Get platform-wide revenue stats for admin.
 */
export async function getPlatformRevenueStats() {
  const allSplits = await db.walletSplit.findMany()
  const totalEscrowed = allSplits
    .filter((s) => s.status === 'ESCROWED')
    .reduce((sum, s) => sum + s.planPrice, 0)
  const totalReleased = allSplits
    .filter((s) => s.status === 'RELEASED')
    .reduce((sum, s) => sum + s.planPrice, 0)
  const totalTutorPayout = allSplits
    .filter((s) => s.status === 'RELEASED')
    .reduce((sum, s) => sum + s.tutorShare, 0)
  const totalPlatformRevenue = allSplits
    .filter((s) => s.status === 'RELEASED')
    .reduce((sum, s) => sum + s.platformShare, 0)

  return {
    totalEscrowed,
    totalReleased,
    totalTutorPayout,
    totalPlatformRevenue,
    totalSplits: allSplits.length,
    escrowedSplits: allSplits.filter((s) => s.status === 'ESCROWED').length,
    releasedSplits: allSplits.filter((s) => s.status === 'RELEASED').length,
  }
}

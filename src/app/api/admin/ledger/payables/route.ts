import { NextResponse } from 'next/server'

const _getDb = () => import("@/lib/db").then(m => m.db);
const _getAuth = () => import("@/lib/auth").then(m => m.getSession);

/** GET /api/admin/ledger/payables — per-tutor wallet auditor + summary. */
export async function GET() {
  const session = (await _getAuth())
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }

  const tutors = await (await _getDb()).user.findMany({
    where: { role: 'TUTOR' },
    include: {
      tutorProfile: true,
      wallet: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  // Count RELEASED splits per tutor (one batch query).
  const releasedCounts = await (await _getDb()).walletSplit.groupBy({
    by: ['tutorId'],
    where: { status: 'RELEASED' },
    _count: { _all: true },
  })
  const releasedMap = new Map(releasedCounts.map((r) => [r.tutorId, r._count._all]))

  const tutorsOut = tutors
    .filter((t) => !!t.wallet)
    .map((t) => {
      const w = t.wallet!
      return {
        id: t.id,
        name: t.name,
        email: t.email,
        country: t.country,
        wallet: {
          balance: w.balance,
          pendingPayout: w.pendingPayout,
          totalEarned: w.totalEarned,
          escrowHeld: w.escrowHeld,
          platformRevenue: w.platformRevenue,
        },
        lessonsCount: t.tutorProfile?.lessonsCount ?? 0,
        releasedSplits: releasedMap.get(t.id) ?? 0,
        releasable: w.balance,
      }
    })

  const summary = {
    totalPending: tutorsOut.reduce((s, t) => s + t.wallet.pendingPayout, 0),
    totalReleased: tutorsOut.reduce((s, t) => s + t.wallet.totalEarned, 0),
    totalEscrow: tutorsOut.reduce((s, t) => s + t.wallet.escrowHeld, 0),
    platformRevenue: tutorsOut.reduce((s, t) => s + t.wallet.platformRevenue, 0),
    totalReleasable: tutorsOut.reduce((s, t) => s + t.releasable, 0),
  }

  return NextResponse.json({ tutors: tutorsOut, summary })
}

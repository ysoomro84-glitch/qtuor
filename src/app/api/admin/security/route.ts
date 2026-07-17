import { NextRequest, NextResponse } from 'next/server'
import { setSession, hashPassword, verifyPassword } from "@/lib/auth";

const _getDb = () => import("@/lib/db").then(m => m.db);
async function _getSession() {
  const { getSession } = await import('@/lib/auth');
  return getSession();
}

/** GET /api/admin/security — returns the current admin user's id/email/name. */
export async function GET() {
  const session = await _getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }
  const user = await (await _getDb()).user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json({ id: user.id, email: user.email, name: user.name })
}

/** PATCH /api/admin/security — change master password and/or master email. */
export async function PATCH(req: NextRequest) {
  const session = await _getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { currentPassword, newPassword, newEmail } = body as {
    currentPassword?: string
    newPassword?: string
    newEmail?: string
  }

  if (!currentPassword || typeof currentPassword !== 'string') {
    return NextResponse.json({ error: 'Current password is required' }, { status: 400 })
  }

  const user = await (await _getDb()).user.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (!verifyPassword(currentPassword, user.password)) {
    return NextResponse.json({ error: 'Current password incorrect' }, { status: 400 })
  }

  const updates: { password?: string; email?: string } = {}

  if (newPassword && typeof newPassword === 'string') {
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    }
    if (newPassword === currentPassword) {
      return NextResponse.json({ error: 'New password must differ from the current password' }, { status: 400 })
    }
    updates.password = hashPassword(newPassword)
  }

  let finalEmail = user.email
  if (newEmail && typeof newEmail === 'string') {
    const trimmed = newEmail.trim().toLowerCase()
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
    if (!emailOk) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }
    if (trimmed !== user.email.toLowerCase()) {
      const taken = await (await _getDb()).user.findFirst({
        where: { email: trimmed, NOT: { id: user.id } },
        select: { id: true },
      })
      if (taken) {
        return NextResponse.json({ error: 'That email is already in use' }, { status: 400 })
      }
      updates.email = trimmed
      finalEmail = trimmed
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true, email: finalEmail, unchanged: true })
  }

  await (await _getDb()).user.update({ where: { id: user.id }, data: updates })

  // Keep the session cookie in sync so the navbar/header reflect the new email.
  await setSession({
    userId: user.id,
    role: user.role as 'ADMIN',
    email: finalEmail,
    name: user.name,
  })

  return NextResponse.json({ ok: true, email: finalEmail })
}

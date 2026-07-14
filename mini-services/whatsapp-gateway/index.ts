/**
 * Qtuor — WhatsApp Gateway Mini-Service (Link-Device / QR Scan)
 *
 * Uses @whiskeysockets/baileys to connect the admin's WhatsApp number via the
 * "Link Device" QR-code flow (the same method used by WhatsApp Web). The
 * connection persists across restarts via filesystem auth state.
 *
 * Architecture:
 *  • baileys maintains a WebSocket connection to WhatsApp servers.
 *  • Auth credentials saved to ./auth_info_baileys/ (multi-file local auth).
 *  • On restart, baileys reads the saved creds and auto-reconnects — no rescan.
 *  • QR codes are pushed via GET /qr (polled by the admin frontend every 2s).
 *  • GET /status → { connected, phone, qrAvailable }
 *  • POST /send → { to, message } sends a real WhatsApp message.
 *  • POST /disconnect → logs out + clears auth folder.
 *  • GET /health → liveness probe.
 *
 * Port: 3004 (accessed via the Caddy gateway with ?XTransformPort=3004)
 */

import makeWASocket, {
  useMultiFileAuthState as loadAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  Browsers,
  type WASocket,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import QRCode from 'qrcode'
import pino from 'pino'
import { rm } from 'fs/promises'
import path from 'path'
import { PrismaClient } from '/home/z/my-project/node_modules/@prisma/client'

const PORT = 3004
const AUTH_DIR = path.join(process.cwd(), 'auth_info_baileys')

// Baileys requires a real pino logger (needs .child() support).
const logger = pino({ level: 'warn' }, pino.destination(1))

const db = new PrismaClient({ log: ['error', 'warn'] })

// ===== Connection state (module-level, shared across requests) =====
let sock: WASocket | null = null
let currentQR: string | null = null
let connectionState: 'CLOSED' | 'CONNECTING' | 'OPEN' = 'CLOSED'
let connectedPhone: string | null = null
let lastConnectionAt: string | null = null

// ===== HTTP server (Bun) =====
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    }
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

    // GET /health — liveness
    if (url.pathname === '/health') {
      return Response.json({ ok: true, port: PORT, uptime: process.uptime() }, { headers: cors })
    }

    // GET /status — current connection state
    if (url.pathname === '/status' && req.method === 'GET') {
      return Response.json({
        connected: connectionState === 'OPEN',
        state: connectionState,
        phone: connectedPhone,
        connectedAt: lastConnectionAt,
        qrAvailable: !!currentQR,
      }, { headers: cors })
    }

    // GET /qr — current QR code (data URL) or null
    if (url.pathname === '/qr' && req.method === 'GET') {
      return Response.json({
        qr: currentQR,
        state: connectionState,
      }, { headers: cors })
    }

    // POST /send — send a WhatsApp message { to, message }
    if (url.pathname === '/send' && req.method === 'POST') {
      try {
        if (connectionState !== 'OPEN' || !sock) {
          return Response.json({ success: false, error: 'WhatsApp not connected' }, { status: 503, headers: cors })
        }
        const { to, message } = await req.json() as { to: string; message: string }
        if (!to || !message) return Response.json({ success: false, error: 'to and message required' }, { status: 400, headers: cors })
        // Normalize phone → JID (remove non-digits, append @s.whatsapp.net)
        const jid = to.replace(/\D/g, '') + '@s.whatsapp.net'
        const sent = await sock.sendMessage(jid, { text: message })
        console.log(`[gateway] → Message sent to ${to}: ${message.slice(0, 60)}...`)
        return Response.json({ success: true, messageId: (sent as any)?.key?.id || null }, { headers: cors })
      } catch (e: any) {
        console.error('[gateway] send error:', e?.message || e)
        return Response.json({ success: false, error: e?.message || 'Send failed' }, { status: 500, headers: cors })
      }
    }

    // POST /disconnect — logout + clear auth
    if (url.pathname === '/disconnect' && req.method === 'POST') {
      try {
        if (sock) {
          try { await sock.logout() } catch {}
        }
        sock = null
        currentQR = null
        connectionState = 'CLOSED'
        connectedPhone = null
        await rm(AUTH_DIR, { recursive: true, force: true })
        await syncConnectionToDB(false, null)
        console.log('[gateway] Disconnected + auth cleared')
        return Response.json({ success: true, message: 'Disconnected + session cleared' }, { headers: cors })
      } catch (e: any) {
        return Response.json({ success: false, error: e?.message }, { status: 500, headers: cors })
      }
    }

    return Response.json({ error: 'Not found' }, { status: 404, headers: cors })
  },
})

console.log(`[gateway] WhatsApp gateway listening on :${PORT}`)

// ===== Baileys connection =====
async function connectToWhatsApp() {
  const { version, isLatest } = await fetchLatestBaileysVersion()
  console.log(`[gateway] Using WA version ${version.join('.')}, isLatest=${isLatest}`)

  const { state, saveCreds } = await loadAuthState(AUTH_DIR)
  const store = makeInMemoryStore({ logger })

  sock = makeWASocket({
    version,
    auth: state,
    browser: Browsers.macOS('Qtuor Gateway'),
    printQRInTerminal: false,
    logger,
    defaultQueryTimeoutMs: 60000,
    markOnlineOnConnect: false,
  })

  store.bind(sock.ev)

  // ---- QR event: generate a new QR (data URL) for the frontend ----
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      // Generate QR as a data URL (base64 PNG) for the frontend to render
      try {
        currentQR = await QRCode.toDataURL(qr, { width: 256, margin: 2 })
        console.log('[gateway] QR code generated — waiting for scan...')
      } catch (e) {
        console.error('[gateway] QR generation failed:', e)
      }
    }

    if (connection === 'connecting') {
      connectionState = 'CONNECTING'
      console.log('[gateway] Connecting to WhatsApp...')
    }

    if (connection === 'open') {
      connectionState = 'OPEN'
      currentQR = null
      const me = sock.user
      connectedPhone = me?.id?.split(':')[0]?.replace(/\D/g, '') ? formatPhone(me?.id) : null
      lastConnectionAt = new Date().toISOString()
      console.log(`[gateway] ✅ Connected as ${me?.id || 'unknown'}`)
      await syncConnectionToDB(true, connectedPhone)
    }

    if (connection === 'close') {
      connectionState = 'CLOSED'
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log(`[gateway] Connection closed. Reconnect=${shouldReconnect} code=${(lastDisconnect?.error as Boom)?.output?.statusCode}`)
      if (shouldReconnect) {
        // Reconnect after a short delay
        setTimeout(() => connectToWhatsApp(), 2000)
      } else {
        // Logged out — clear auth
        await rm(AUTH_DIR, { recursive: true, force: true })
        await syncConnectionToDB(false, null)
        sock = null
      }
    }
  })

  // ---- Credentials updated: persist to disk ----
  sock.ev.on('creds.update', saveCreds)
}

// Format a WhatsApp JID (e.g. "923001234567:1@s.whatsapp.net") → "+92 300 1234567"
function formatPhone(jid: string | undefined): string | null {
  if (!jid) return null
  const num = jid.split(':')[0].replace(/\D/g, '')
  if (num.length < 10) return null
  return '+' + num
}

// Sync connection state to the Qtuor DB (so the Next.js app can read it)
async function syncConnectionToDB(connected: boolean, phone: string | null) {
  try {
    await db.whatsAppSettings.upsert({
      where: { id: 'singleton' },
      update: {
        baileysConnected: connected,
        baileysConnectedPhone: phone,
        baileysConnectedAt: connected ? new Date() : null,
        ...(connected ? { provider: 'BAILEYS' } : {}),
      },
      create: {
        id: 'singleton',
        baileysConnected: connected,
        baileysConnectedPhone: phone,
        baileysConnectedAt: connected ? new Date() : null,
        provider: connected ? 'BAILEYS' : 'SIMULATED',
      },
    })
    console.log(`[gateway] DB synced: connected=${connected}, phone=${phone || 'null'}`)
  } catch (e) {
    console.error('[gateway] DB sync failed:', e)
  }
}

// ===== Startup =====
connectToWhatsApp().catch((e) => console.error('[gateway] Initial connect failed:', e))

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[gateway] Shutting down...')
  try { if (sock) await sock.logout() } catch {}
  server.stop()
  await db.$disconnect()
  process.exit(0)
})

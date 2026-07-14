import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  // DO NOT change the path — Caddy forwards using it
  path: '/',
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// In-memory room state (per booking id)
interface RoomState {
  strokes: any[]
  highlights: Record<string, { color: string; by: string }>
  page: number
  chat: any[]
}
const rooms = new Map<string, RoomState>()

function getRoom(id: string): RoomState {
  if (!rooms.has(id)) {
    rooms.set(id, { strokes: [], highlights: {}, page: 10001, chat: [] }) // 10001 = Al-Fatihah
  }
  return rooms.get(id)!
}

interface RoomMember {
  id: string
  socketId: string
  name: string
  role: 'teacher' | 'student'
  avatar?: string | null
}

const members = new Map<string, Map<string, RoomMember>>() // roomId -> socketId -> member

io.on('connection', (socket) => {
  console.log(`[classroom] connected: ${socket.id}`)

  socket.on('room:join', (payload: { roomId: string; name: string; role: 'teacher' | 'student'; avatar?: string | null; userId: string }) => {
    const { roomId, name, role, avatar, userId } = payload
    socket.join(roomId)
    socket.data.roomId = roomId
    socket.data.userId = userId

    if (!members.has(roomId)) members.set(roomId, new Map())
    const member: RoomMember = { id: userId, socketId: socket.id, name, role, avatar }
    members.get(roomId)!.set(socket.id, member)

    const state = getRoom(roomId)
    // Send current state to the joiner
    socket.emit('room:state', {
      strokes: state.strokes,
      highlights: state.highlights,
      page: state.page,
      chat: state.chat.slice(-50),
    })
    // Notify others of presence
    const roster = Array.from(members.get(roomId)!.values())
    io.to(roomId).emit('room:members', roster)

    // System message
    const sysMsg = {
      id: Math.random().toString(36).slice(2),
      type: 'system' as const,
      content: `${name} joined the class`,
      timestamp: new Date().toISOString(),
    }
    state.chat.push(sysMsg)
    io.to(roomId).emit('chat:message', sysMsg)

    console.log(`[classroom] ${name} (${role}) joined room ${roomId}`)
  })

  // Whiteboard stroke
  socket.on('whiteboard:stroke', (stroke: any) => {
    const roomId = socket.data.roomId
    if (!roomId) return
    const state = getRoom(roomId)
    state.strokes.push(stroke)
    // cap to 500 strokes
    if (state.strokes.length > 500) state.strokes = state.strokes.slice(-500)
    socket.to(roomId).emit('whiteboard:stroke', stroke)
  })

  // Clear whiteboard
  socket.on('whiteboard:clear', () => {
    const roomId = socket.data.roomId
    if (!roomId) return
    const state = getRoom(roomId)
    state.strokes = []
    state.highlights = {}
    io.to(roomId).emit('whiteboard:clear')
  })

  // Undo last stroke by user
  socket.on('whiteboard:undo', () => {
    const roomId = socket.data.roomId
    if (!roomId) return
    const state = getRoom(roomId)
    state.strokes.pop()
    io.to(roomId).emit('whiteboard:sync', state.strokes)
  })

  // Word highlight (click-to-highlight)
  socket.on('quran:highlight', (payload: { wordId: string; color: string }) => {
    const roomId = socket.data.roomId
    if (!roomId) return
    const state = getRoom(roomId)
    state.highlights[payload.wordId] = { color: payload.color, by: socket.data.userId }
    io.to(roomId).emit('quran:highlight', payload)
  })

  // Clear highlights
  socket.on('quran:clear-highlights', () => {
    const roomId = socket.data.roomId
    if (!roomId) return
    const state = getRoom(roomId)
    state.highlights = {}
    io.to(roomId).emit('quran:clear-highlights')
  })

  // Page change
  socket.on('quran:page', (page: number) => {
    const roomId = socket.data.roomId
    if (!roomId) return
    const state = getRoom(roomId)
    state.page = page
    io.to(roomId).emit('quran:page', page)
  })

  // Chat message
  socket.on('chat:message', (payload: { content: string }) => {
    const roomId = socket.data.roomId
    if (!roomId) return
    const state = getRoom(roomId)
    const member = members.get(roomId)?.get(socket.id)
    const msg = {
      id: Math.random().toString(36).slice(2),
      type: 'user' as const,
      userId: socket.data.userId,
      name: member?.name || 'User',
      role: member?.role || 'student',
      content: payload.content,
      timestamp: new Date().toISOString(),
    }
    state.chat.push(msg)
    if (state.chat.length > 200) state.chat = state.chat.slice(-200)
    io.to(roomId).emit('chat:message', msg)
  })

  // Cursor / pointer broadcast
  socket.on('pointer:move', (payload: { x: number; y: number }) => {
    const roomId = socket.data.roomId
    if (!roomId) return
    socket.to(roomId).emit('pointer:move', { ...payload, userId: socket.data.userId })
  })

  // Word hover sync — teacher hovers a word, broadcast to all students
  socket.on('word:hover', (payload: { wordId: string }) => {
    const roomId = socket.data.roomId
    if (!roomId) return
    io.to(roomId).emit('word:hover', { wordId: payload.wordId, userId: socket.data.userId })
  })

  // Tool change (for showing what the other person is doing)
  socket.on('tool:change', (tool: string) => {
    const roomId = socket.data.roomId
    if (!roomId) return
    socket.to(roomId).emit('tool:change', { userId: socket.data.userId, tool })
  })

  // Safety snapshot request (parental watch) — just broadcast
  socket.on('safety:snapshot', () => {
    const roomId = socket.data.roomId
    if (!roomId) return
    io.to(roomId).emit('safety:snapshot', { at: new Date().toISOString() })
  })

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId
    if (!roomId) return
    const roomMembers = members.get(roomId)
    if (roomMembers) {
      const member = roomMembers.get(socket.id)
      roomMembers.delete(socket.id)
      if (member) {
        const sysMsg = {
          id: Math.random().toString(36).slice(2),
          type: 'system' as const,
          content: `${member.name} left the class`,
          timestamp: new Date().toISOString(),
        }
        const state = getRoom(roomId)
        state.chat.push(sysMsg)
        io.to(roomId).emit('chat:message', sysMsg)
      }
      io.to(roomId).emit('room:members', Array.from(roomMembers.values()))
    }
    console.log(`[classroom] disconnected: ${socket.id}`)
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`[classroom-sync] WebSocket server running on port ${PORT}`)
})

process.on('SIGTERM', () => httpServer.close(() => process.exit(0)))
process.on('SIGINT', () => httpServer.close(() => process.exit(0)))

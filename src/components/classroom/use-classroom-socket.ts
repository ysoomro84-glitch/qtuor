'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, type Socket } from 'socket.io-client'

export interface ChatMessage {
  id: string
  type: 'user' | 'system'
  userId?: string
  name?: string
  role?: 'teacher' | 'student'
  content: string
  timestamp: string
}

export interface RoomMember {
  id: string
  socketId: string
  name: string
  role: 'teacher' | 'student'
  avatar?: string | null
}

export interface Stroke {
  id: string
  tool: 'pen' | 'eraser'
  color: string
  size: number
  points: { x: number; y: number }[]
}

export interface HighlightState {
  wordId: string
  color: string
}

export function useClassroomSocket(roomId: string | null, user: { id: string; name: string; role: 'teacher' | 'student'; avatar?: string | null } | null) {
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [members, setMembers] = useState<RoomMember[]>([])
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [highlights, setHighlights] = useState<Record<string, { color: string; by: string }>>({})
  const [page, setPage] = useState(10001) // Default: Al-Fatihah (10000 + surah 1)
  const [pointer, setPointer] = useState<{ userId: string; x: number; y: number } | null>(null)
  const [hoveredWord, setHoveredWord] = useState<string | null>(null)
  const [safetySnapshot, setSafetySnapshot] = useState<string | null>(null)

  useEffect(() => {
    if (!roomId || !user) return
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
      timeout: 10000,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('room:join', {
        roomId,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        userId: user.id,
      })
    })
    socket.on('disconnect', () => setConnected(false))

    socket.on('room:state', (state: { strokes: Stroke[]; highlights: Record<string, any>; page: number; chat: ChatMessage[] }) => {
      setStrokes(state.strokes)
      setHighlights(state.highlights)
      setPage(state.page)
      setChat(state.chat)
    })
    socket.on('room:members', (m: RoomMember[]) => setMembers(m))

    socket.on('chat:message', (msg: ChatMessage) => setChat((p) => [...p, msg]))

    socket.on('whiteboard:stroke', (stroke: Stroke) => setStrokes((p) => [...p, stroke]))
    socket.on('whiteboard:sync', (all: Stroke[]) => setStrokes(all))
    socket.on('whiteboard:clear', () => { setStrokes([]); setHighlights({}) })

    socket.on('quran:highlight', (h: HighlightState) =>
      setHighlights((p) => ({ ...p, [h.wordId]: { color: h.color, by: '' } }))
    )
    socket.on('quran:clear-highlights', () => setHighlights({}))
    socket.on('quran:page', (pg: number) => setPage(pg))

    socket.on('pointer:move', (p: { userId: string; x: number; y: number }) => setPointer(p))

    // Word hover sync — teacher hovers a word, student sees it highlight in real-time
    socket.on('word:hover', (data: { wordId: string; userId: string }) => {
      setHoveredWord(data.wordId)
      // Auto-clear hover after 3 seconds
      setTimeout(() => setHoveredWord((current) => (current === data.wordId ? null : current)), 3000)
    })

    socket.on('safety:snapshot', (e: { at: string }) => setSafetySnapshot(e.at))

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [roomId, user?.id])

  const sendStroke = useCallback((stroke: Stroke) => {
    socketRef.current?.emit('whiteboard:stroke', stroke)
    setStrokes((p) => [...p, stroke])
  }, [])
  const clearBoard = useCallback(() => {
    socketRef.current?.emit('whiteboard:clear')
    setStrokes([]); setHighlights({})
  }, [])
  const undoStroke = useCallback(() => {
    socketRef.current?.emit('whiteboard:undo')
    setStrokes((p) => p.slice(0, -1))
  }, [])
  const highlightWord = useCallback((wordId: string, color: string) => {
    socketRef.current?.emit('quran:highlight', { wordId, color })
    setHighlights((p) => ({ ...p, [wordId]: { color, by: '' } }))
  }, [])
  const clearHighlights = useCallback(() => {
    socketRef.current?.emit('quran:clear-highlights')
    setHighlights({})
  }, [])
  const changePage = useCallback((pg: number) => {
    socketRef.current?.emit('quran:page', pg)
    setPage(pg)
  }, [])
  const sendChat = useCallback((content: string) => {
    socketRef.current?.emit('chat:message', { content })
  }, [])
  const movePointer = useCallback((x: number, y: number) => {
    socketRef.current?.emit('pointer:move', { x, y })
  }, [])

  // Word hover — teacher hovers a word, emits to all students in real-time
  const hoverWord = useCallback((wordId: string) => {
    socketRef.current?.emit('word:hover', { wordId })
    setHoveredWord(wordId)
  }, [])

  return {
    connected, members, chat, strokes, highlights, page, pointer, hoveredWord, safetySnapshot,
    sendStroke, clearBoard, undoStroke, highlightWord, clearHighlights, changePage,
    sendChat, movePointer, hoverWord,
  }
}

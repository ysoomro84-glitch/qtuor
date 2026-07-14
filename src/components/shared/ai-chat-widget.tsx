'use client'

import * as React from 'react'

/**
 * Advanced AI Support Chatbot Widget
 *
 * Replaces the static WhatsApp redirect card with a fully functional AI
 * assistant. The frontend renders native conversational bubble messaging;
 * user inputs are routed to /api/ai/respond which calls the LLM with a
 * Qtuor-specific system prompt (subscription plans, Tajweed curriculum,
 * tutor booking rules).
 *
 * UI: 52px glowing navy FAB (aiGlowRing animation) → 360×500 chat panel
 * with header, message thread, quick-prompt suggestions, and input bar.
 */

interface ChatMessage {
  role: 'bot' | 'user'
  content: string
}

const WELCOME_MESSAGE: ChatMessage = {
  role: 'bot',
  content:
    'Assalamu Alaikum! I am your Qtuor AI guide. 🌟 I can help you pick the perfect Tajweed tutor or explain our monthly subscription plans. What are you looking to learn today?',
}

const QUICK_PROMPTS = [
  { label: '💰 View Plans', text: 'What are your monthly subscription plans?' },
  { label: '🎓 Student Signup', text: 'How do I register as a student?' },
  { label: '👶 Classes for Kids', text: 'Do you offer Tajweed classes for children?' },
  { label: '🧕 Female Tutors', text: 'Can I find female Quran tutors for my daughter?' },
  { label: '📖 Free Trial', text: 'Can I try a free class before subscribing?' },
]

export function AIChatWidget() {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const threadRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [messages, loading])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    // Render user bubble
    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Build history (exclude the welcome message, send last 10)
      const history = messages.slice(1, -0).concat(userMsg).slice(-10).map((m) => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.content,
      }))

      const res = await fetch('/api/ai/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'AI request failed')

      setMessages((prev) => [...prev, { role: 'bot', content: data.reply }])
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content:
            "I apologize — I'm having trouble connecting right now. Please try again in a moment, or contact our support team via WhatsApp.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage(input)
  }

  return (
    <div className={`qtuor-ai-bot-container ${open ? 'open' : ''}`}>
      {/* THE CHAT BOX (Toggles on button interaction) */}
      <div className="ai-chat-card" id="aiChatCard">
        {/* Header Area */}
        <div className="ai-card-header">
          <div className="ai-profile-meta">
            <div className="ai-avatar-glow">
              <span className="ai-letter">Q</span>
            </div>
            <div>
              <h4>Qtuor AI Assistant</h4>
              <p className="status-text">● Ask me about Tajweed, Plans &amp; Tutors</p>
            </div>
          </div>
          <button
            className="ai-close-btn"
            onClick={() => setOpen(false)}
            aria-label="Close AI chat"
          >
            &times;
          </button>
        </div>

        {/* Live Conversation Thread */}
        <div className="ai-chat-thread" id="aiChatThread" ref={threadRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`msg-row ${msg.role}`}>
              <div className="msg-bubble">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="msg-row bot">
              <div className="msg-bubble typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompt Suggestions (One-Click Actions) */}
        <div className="ai-quick-suggestions">
          {QUICK_PROMPTS.map((qp) => (
            <button key={qp.text} onClick={() => sendMessage(qp.text)} disabled={loading}>
              {qp.label}
            </button>
          ))}
        </div>

        {/* User Input Control Bar */}
        <div className="ai-input-bar">
          <input
            type="text"
            id="aiUserMsgInput"
            placeholder="Type your question here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button
            className="ai-send-action-btn"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            ➔
          </button>
        </div>
      </div>

      {/* THE MINI ACTIVE GLOW FLOATING TRIGGER BUTTON */}
      <button
        className="ai-trigger-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        aria-expanded={open}
      >
        {open ? (
          <svg viewBox="0 0 320 512" width="20" height="20" fill="#ffffff" aria-hidden>
            <path d="M310.6 361.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L160 301.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L114.7 256 9.4 150.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 210.7 265.4 105.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L205.3 256l105.3 105.4z" />
          </svg>
        ) : (
          <svg className="ai-svg" viewBox="0 0 640 512" width="24" height="24" fill="#ffffff" aria-hidden>
            <path d="M320 0c17.7 0 32 14.3 32 32V96H472c39.8 0 72 32.2 72 72V440c0 39.8-32.2 72-72 72H168c-39.8 0-72-32.2-72-72V168c0-39.8 32.2-72 72-72H288V32c0-17.7 14.3-32 32-32zM208 240c-13.3 0-24 10.7-24 24v16c0 13.3 10.7 24 24 24h32c13.3 0 24-10.7 24-24V264c0-13.3-10.7-24-24-24H208zm224 24c0-13.3-10.7-24-24-24H376c-13.3 0-24 10.7-24 24v16c0 13.3 10.7 24 24 24h32c13.3 0 24-10.7 24-24V264z" />
          </svg>
        )}
        {!open && <span className="ai-pulse-ambient" />}
      </button>
    </div>
  )
}

'use client'

import * as React from 'react'
import { Volume2, Square, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Audio intro player that uses the browser's SpeechSynthesis API
 * to "speak" the tutor's intro text. Works fully client-side.
 */
export function AudioIntroPlayer({
  text,
  name,
  className,
  compact = false,
}: {
  text: string
  name: string
  className?: string
  compact?: boolean
}) {
  const [playing, setPlaying] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const toggle = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Sorry, your browser does not support audio playback.')
      return
    }
    if (playing) {
      window.speechSynthesis.cancel()
      setPlaying(false)
      setProgress(0)
      return
    }
    setLoading(true)
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 0.92
    utter.pitch = 1
    // Try to pick a pleasant voice
    const voices = window.speechSynthesis.getVoices()
    const preferred =
      voices.find((v) => /Google UK English Male|Daniel|Google US English/i.test(v.name)) ||
      voices.find((v) => v.lang.startsWith('en'))
    if (preferred) utter.voice = preferred
    utter.onstart = () => {
      setLoading(false)
      setPlaying(true)
    }
    utter.onend = () => {
      setPlaying(false)
      setProgress(0)
    }
    utter.onerror = () => {
      setLoading(false)
      setPlaying(false)
    }
    utter.onboundary = (e) => {
      if (e.charIndex && text.length) {
        setProgress(Math.min(100, Math.round((e.charIndex / text.length) * 100)))
      }
    }
    window.speechSynthesis.speak(utter)
  }

  if (compact) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={toggle}
        className={cn('gap-1.5 rounded-full', className)}
        aria-label={playing ? `Stop ${name}'s intro` : `Play ${name}'s intro`}
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : playing ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        {playing ? 'Stop' : 'Play intro'}
      </Button>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        type="button"
        size="sm"
        onClick={toggle}
        className="gap-1.5 rounded-full bg-[oklch(0.62_0.14_230)] text-white hover:bg-[oklch(0.55_0.14_230)]"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : playing ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        {playing ? 'Stop' : 'Play intro'}
      </Button>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-[oklch(0.62_0.14_230)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

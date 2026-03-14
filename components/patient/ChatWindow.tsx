'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { VoiceButton } from './VoiceButton'

interface Message {
  role: 'user' | 'assistant' | 'nurse'
  content: string
  timestamp: Date
}

interface ChatWindowProps {
  patientId: string
  sessionId: string
  initialMessages?: Message[]
}

// ─── Text-to-Speech ───────────────────────────────────────────────────────────
// Uses the free Web Speech API (SpeechSynthesis) — no API key, no cost.
//
// TO UPGRADE TO OPENAI TTS (higher-quality voice, uses your existing key):
//   1. Create POST /api/tts that calls openai.audio.speech.create({ model:'tts-1', voice:'alloy', input: text })
//      and returns the audio stream as audio/mpeg
//   2. Replace the speak() body with:
//        const res = await fetch('/api/tts', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({text}) })
//        const blob = await res.blob()
//        new Audio(URL.createObjectURL(blob)).play()
function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel() // stop any current speech first

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.92   // slightly slower — easier for patients to follow
  utterance.pitch = 1.0
  utterance.volume = 1.0

  // Prefer a natural-sounding voice when available (Chrome picks up Google voices)
  const trySetVoice = () => {
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) => v.lang.startsWith('en') &&
        (v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Karen'))
    )
    if (preferred) utterance.voice = preferred
    window.speechSynthesis.speak(utterance)
  }

  // Voices may not be loaded yet on first call — wait if needed
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = trySetVoice
  } else {
    trySetVoice()
  }
}

function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export function ChatWindow({ patientId, sessionId, initialMessages = [] }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)
  // Track the timestamp of the newest message we've received, for incremental polling
  const lastMessageTimeRef = useRef<string>(
    initialMessages.length > 0
      ? new Date(Math.max(...initialMessages.map((m) => new Date(m.timestamp).getTime()))).toISOString()
      : new Date(0).toISOString()
  )

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages])

  // Stop speaking when the component unmounts
  useEffect(() => () => stopSpeaking(), [])

  // Poll for new nurse messages every 4 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/session-messages?sessionId=${sessionId}&after=${encodeURIComponent(lastMessageTimeRef.current)}`
        )
        if (!res.ok) return
        const data = await res.json()
        const incoming = (data.messages ?? []) as { sender: string; content: string; created_at: string }[]
        const nurseMessages = incoming.filter((m) => m.sender === 'nurse')
        if (nurseMessages.length === 0) return

        // Update the watermark
        const latest = nurseMessages[nurseMessages.length - 1].created_at
        lastMessageTimeRef.current = latest

        const newMessages: Message[] = nurseMessages.map((m) => ({
          role: 'nurse' as const,
          content: m.content,
          timestamp: new Date(m.created_at),
        }))
        setMessages((prev) => [...prev, ...newMessages])
        if (voiceEnabled) {
          newMessages.forEach((m) => speak(`Nurse says: ${m.content}`))
        }
      } catch {
        // Silently ignore poll errors
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [sessionId, voiceEnabled])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return

    // Stop any ongoing speech when patient sends a new message
    stopSpeaking()

    const userMessage: Message = { role: 'user', content: text, timestamp: new Date() }
    const history = [...messages, userMessage]
    setMessages(history)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          sessionId,
          // Exclude nurse messages — they are not part of the AI conversation history
          messages: history
            .filter((m) => m.role !== 'nurse')
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) throw new Error('Chat error')
      const data = await res.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Speak the response aloud if voice mode is enabled
      if (voiceEnabled) speak(data.message)

    } catch {
      const errText = "I'm sorry, I had trouble responding. Please press the nurse call button if you need immediate help."
      setMessages((prev) => [...prev, { role: 'assistant', content: errText, timestamp: new Date() }])
      if (voiceEnabled) speak(errText)
    } finally {
      setLoading(false)
    }
  }, [messages, loading, patientId, sessionId, voiceEnabled])

  return (
    <div className="flex flex-col rounded-2xl bg-white shadow-md overflow-hidden" style={{ height: '520px' }}>
      {/* Header */}
      <div className="bg-blue-700 px-5 py-4 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">CareCompanion Assistant</h2>
          <p className="text-sm text-blue-200">I can help with your medications, room, and family contacts.</p>
        </div>

        {/* Voice output toggle */}
        <button
          type="button"
          onClick={() => { const next = !voiceEnabled; setVoiceEnabled(next); if (!next) stopSpeaking() }}
          title={voiceEnabled ? 'Voice responses on — click to mute' : 'Click to enable voice responses'}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            voiceEnabled ? 'bg-white text-blue-700 shadow' : 'bg-blue-600 text-blue-200 hover:bg-blue-500'
          }`}
        >
          {voiceEnabled ? '🔊 Voice on' : '🔇 Voice off'}
        </button>
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
            <span className="text-5xl">💬</span>
            <p className="text-lg">Say hi! I&apos;m here to help.</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {['What are my medications?', 'Call my daughter', 'Turn off the lights', 'What is my diagnosis?'].map((s) => (
                <button key={s} type="button" onClick={() => sendMessage(s)}
                  className="rounded-xl bg-white px-3 py-2 text-sm text-blue-700 shadow-sm hover:bg-blue-50 border border-blue-100 text-left">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-base leading-relaxed shadow-sm ${
              m.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : m.role === 'nurse'
                ? 'bg-emerald-50 text-gray-800 rounded-bl-sm border border-emerald-300'
                : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
            }`}>
              {m.role === 'nurse' && (
                <p className="mb-1 text-xs font-bold text-emerald-700 uppercase tracking-wide">
                  Nurse messaged you
                </p>
              )}
              <p className="whitespace-pre-wrap">{m.content}</p>
              <p className={`mt-1 text-xs ${
                m.role === 'user' ? 'text-blue-200' :
                m.role === 'nurse' ? 'text-emerald-500' : 'text-gray-400'
              }`}>
                {(m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp))
                  .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-white border border-gray-100 px-4 py-3 shadow-sm">
              <div className="flex gap-1.5 items-center">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 bg-white px-4 py-3 flex gap-2 items-center">
        <VoiceButton onTranscript={sendMessage} disabled={loading} />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder="Type your question here…"
          className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="rounded-xl bg-blue-600 px-5 py-3 text-base font-semibold text-white hover:bg-blue-700 transition disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Send
        </button>
      </div>
    </div>
  )
}

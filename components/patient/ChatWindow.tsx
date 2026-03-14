'use client'

import { useState, useRef, useEffect } from 'react'
import { VoiceButton } from './VoiceButton'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatWindowProps {
  patientId: string
  sessionId: string
  initialMessages?: Message[]
}

export function ChatWindow({ patientId, sessionId, initialMessages = [] }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

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
          messages: history.map((m) => ({ role: m.role, content: m.content })),
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
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I had trouble responding. Please press the nurse call button if you need immediate help.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col rounded-2xl bg-white shadow-md overflow-hidden" style={{ height: '520px' }}>
      {/* Header */}
      <div className="bg-blue-700 px-5 py-4">
        <h2 className="text-xl font-bold text-white">CareCompanion Assistant</h2>
        <p className="text-sm text-blue-200">I can help with your medications, room, and family contacts.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
            <span className="text-5xl">💬</span>
            <p className="text-lg">Say hi! I'm here to help.</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                'What are my medications?',
                'Call my daughter',
                'Turn off the lights',
                'What is my diagnosis?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="rounded-xl bg-white px-3 py-2 text-sm text-blue-700 shadow-sm hover:bg-blue-50 border border-blue-100 text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-base leading-relaxed shadow-sm ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
              <p className={`mt-1 text-xs ${m.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

        <div ref={bottomRef} />
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

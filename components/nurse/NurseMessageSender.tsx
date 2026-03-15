'use client'

import { useState } from 'react'

interface NurseMessageSenderProps {
  sessionId: string
  patientName: string
}

export function NurseMessageSender({ sessionId, patientName }: NurseMessageSenderProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  const handleSend = async () => {
    const trimmed = message.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setFeedback(null)

    try {
      const res = await fetch('/api/nurse-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: trimmed }),
      })

      if (!res.ok) throw new Error('Send failed')

      setMessage('')
      setFeedback({ ok: true, text: `Message delivered to ${patientName}'s chat.` })
    } catch {
      setFeedback({ ok: false, text: 'Could not send the message. Please try again.' })
    } finally {
      setLoading(false)
      setTimeout(() => setFeedback(null), 4000)
    }
  }

  if (!sessionId) {
    return (
      <div className=" border border-slate-200 bg-white shadow-sm p-3">
        <h2 className="text-sm font-bold text-slate-900 mb-1">Message Patient</h2>
        <p className="text-xs text-slate-400">No active chat session for this patient.</p>
      </div>
    )
  }

  return (
    <div className=" border border-slate-200 bg-white shadow-sm p-3">
      <h2 className="text-sm font-bold text-slate-900 mb-2">Message Patient</h2>
      {feedback && (
        <p className={`mb-2  px-3 py-1.5 text-xs font-medium ${
          feedback.ok
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {feedback.text}
        </p>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Send a message to ${patientName}…`}
          maxLength={500}
          disabled={loading}
          className="flex-1 border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || loading}
          className="bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          {loading ? '…' : 'Send'}
        </button>
      </div>
    </div>
  )
}

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
<div className="border border-[#a0a0a0] bg-[#f9f9f9] shadow-none p-3 font-sans rounded-none">
      <h2 className="text-xs font-bold text-[#333] mb-2 uppercase tracking-wide">
        :: Message Patient
      </h2>
      
      {feedback && (
        <p className={`mb-2 px-3 py-1 text-[11px] font-bold uppercase border ${
          feedback.ok
            ? 'bg-[#e6ffe6] text-[#006600] border-[#006600]'
            : 'bg-[#fff0f0] text-[#cc0000] border-[#cc0000]'
        }`}>
          [ {feedback.ok ? 'SUCCESS' : 'ERROR'} ]: {feedback.text.toUpperCase()}
        </p>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`RE: MESSAGE TO ${patientName.toUpperCase()}...`}
          maxLength={500}
          disabled={loading}
          /* Sunken 3D effect: dark top/left borders, light bottom/right */
          className="flex-1 border-2 border-t-[#808080] border-l-[#808080] border-r-[#ffffff] border-b-[#ffffff] bg-white px-2 py-1 text-xs text-black focus:outline-none focus:bg-[#ffffe6] disabled:opacity-50 rounded-none"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || loading}
          /* Raised 3D effect: light top/left, dark bottom/right */
          className="bg-[#cccccc] border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] px-4 py-1 text-xs font-bold text-black uppercase active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff] disabled:opacity-50 cursor-pointer shadow-none rounded-none transition-none"
        >
          {loading ? '...' : 'SEND'}
        </button>
      </div>
    </div>
  )
}
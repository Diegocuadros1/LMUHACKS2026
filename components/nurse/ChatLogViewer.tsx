'use client'

import { useState } from 'react'
import type { ChatMessage } from '@/lib/types'

interface ChatLogViewerProps {
  messages: ChatMessage[]
  onFlag?: (messageId: string, flagged: boolean) => void
}

export function ChatLogViewer({ messages, onFlag }: ChatLogViewerProps) {
  const [flagging, setFlagging] = useState<string | null>(null)

  const handleFlag = async (message: ChatMessage) => {
    setFlagging(message.id)
    try {
      await fetch(`/api/messages/${message.id}/flag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagged: !message.flagged_incorrect }),
      })
      onFlag?.(message.id, !message.flagged_incorrect)
    } catch {
      console.error('Failed to flag message')
    } finally {
      setFlagging(null)
    }
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-50 px-6 py-8 text-center text-gray-400">
        No chat messages yet.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex gap-3 rounded-xl px-4 py-3 ${
            m.sender === 'patient'
              ? 'bg-blue-50 border border-blue-100'
              : m.sender === 'assistant'
              ? 'bg-white border border-gray-100 shadow-sm'
              : 'bg-gray-50 border border-dashed border-gray-200'
          } ${m.flagged_incorrect ? 'border-red-300 bg-red-50' : ''}`}
        >
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wide ${
                m.sender === 'patient' ? 'text-blue-700' :
                m.sender === 'assistant' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {m.sender}
              </span>
              {m.tool_name && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                  🔧 {m.tool_name}
                </span>
              )}
              {m.flagged_incorrect && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                  ⚑ Flagged
                </span>
              )}
              <span className="ml-auto text-xs text-gray-400">
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{m.content}</p>
          </div>

          {m.sender === 'assistant' && onFlag && (
            <button
              onClick={() => handleFlag(m)}
              disabled={flagging === m.id}
              title={m.flagged_incorrect ? 'Unflag response' : 'Flag as incorrect'}
              className={`shrink-0 self-start rounded-lg px-2 py-1 text-xs font-medium transition ${
                m.flagged_incorrect
                  ? 'bg-red-200 text-red-800 hover:bg-red-300'
                  : 'bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-700'
              } disabled:opacity-50`}
            >
              {flagging === m.id ? '…' : m.flagged_incorrect ? 'Unflag' : 'Flag'}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

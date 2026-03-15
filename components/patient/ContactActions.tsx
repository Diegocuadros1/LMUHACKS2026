'use client'

import { useState } from 'react'
import type { Contact } from '@/lib/types'

interface ContactActionsProps {
  contacts: Contact[]
  patientId: string
  onFeedback?: (msg: string) => void
}

export function ContactActions({ contacts, patientId, onFeedback }: ContactActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [selectedContact, setSelectedContact] = useState<string>(contacts[0]?.name ?? '')
  const [feedback, setFeedback] = useState<string | null>(null)

  const showFeedback = (msg: string) => {
    onFeedback?.(msg)
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleCall = async (contact: Contact) => {
    setLoading(`call-${contact.id}`)
    try {
      const res = await fetch('/api/contacts/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, contactName: contact.name }),
      })
      const data = await res.json()
      showFeedback(data.message ?? `Calling ${contact.name}...`)
    } catch {
      showFeedback(`Could not place the call. Please ask your nurse for help.`)
    } finally {
      setLoading(null)
    }
  }

  const handleText = async () => {
    if (!messageText.trim() || !selectedContact) return
    setLoading(`text-${selectedContact}`)
    try {
      const res = await fetch('/api/contacts/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, contactName: selectedContact, message: messageText }),
      })
      const data = await res.json()
      showFeedback(data.message ?? 'Message sent!')
      setMessageText('')
    } catch {
      showFeedback('Could not send the message. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  if (contacts.length === 0) {
    return (
      <div className="bg-white border border-gray-300 p-4 text-sm text-gray-500">
        No contacts on file. Ask your nurse to add family contacts.
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-300 p-4 space-y-3 w-full overflow-hidden">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Contact Family</h2>
      {feedback && (
        <p className="border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 truncate">{feedback}</p>
      )}

      {/* Call buttons */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Call</p>
        <div className="space-y-1.5">
          {contacts.filter((c) => c.can_call).map((contact) => (
            <button
              key={contact.id}
              onClick={() => handleCall(contact)}
              disabled={!!loading}
              className="w-full flex items-center gap-2 border border-gray-400 bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300 transition active:scale-95 focus:outline-none disabled:opacity-50 overflow-hidden"
            >
              <span className="shrink-0"></span>
              <div className="text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                <p className="text-xs text-gray-500 truncate">{contact.relationship}</p>
              </div>
              {loading === `call-${contact.id}` && (
                <span className="ml-auto shrink-0 text-xs text-gray-600">Calling…</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Send message */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Send a Message</p>
        <select
          value={selectedContact}
          onChange={(e) => setSelectedContact(e.target.value)}
          className="w-full border border-gray-400 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        >
          {contacts.filter((c) => c.can_text).map((c) => (
            <option key={c.id} value={c.name}>
              {c.name} ({c.relationship})
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message…"
            className="min-w-0 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            onKeyDown={(e) => e.key === 'Enter' && handleText()}
            maxLength={160}
          />
          <button
            onClick={handleText}
            disabled={!messageText.trim() || !!loading}
            className="shrink-0 border border-gray-400 bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 transition disabled:opacity-50 focus:outline-none"
          >
            {loading?.startsWith('text-') ? '…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

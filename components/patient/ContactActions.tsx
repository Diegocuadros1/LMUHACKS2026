'use client'

import { useState } from 'react'
import type { Contact } from '@/lib/types'

interface ContactActionsProps {
  contacts: Contact[]
  patientId: string
  onFeedback: (msg: string) => void
}

export function ContactActions({ contacts, patientId, onFeedback }: ContactActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [selectedContact, setSelectedContact] = useState<string>(contacts[0]?.id ?? '')

  const handleCall = async (contact: Contact) => {
    setLoading(`call-${contact.id}`)
    try {
      const res = await fetch('/api/contacts/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, contactId: contact.id }),
      })
      const data = await res.json()
      onFeedback(data.message ?? `Calling ${contact.name}...`)
    } catch {
      onFeedback(`Could not place the call. Please ask your nurse for help.`)
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
        body: JSON.stringify({ patientId, contactId: selectedContact, message: messageText }),
      })
      const data = await res.json()
      onFeedback(data.message ?? 'Message sent!')
      setMessageText('')
    } catch {
      onFeedback('Could not send the message. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  if (contacts.length === 0) {
    return (
      <div className="rounded-2xl bg-orange-50 p-6 text-gray-500">
        No contacts on file. Ask your nurse to add family contacts.
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-orange-50 p-6 space-y-5">
      <h2 className="text-xl font-bold text-orange-900">Contact Family</h2>

      {/* Call buttons */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-orange-700 uppercase tracking-wide">Call</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {contacts.filter((c) => c.can_call).map((contact) => (
            <button
              key={contact.id}
              onClick={() => handleCall(contact)}
              disabled={!!loading}
              className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm hover:bg-orange-100 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50"
            >
              <span className="text-2xl">📞</span>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{contact.name}</p>
                <p className="text-xs text-gray-500">{contact.relationship}</p>
              </div>
              {loading === `call-${contact.id}` && (
                <span className="ml-auto text-xs text-orange-600">Calling…</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Send message */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-orange-700 uppercase tracking-wide">Send a Message</p>
        <select
          value={selectedContact}
          onChange={(e) => setSelectedContact(e.target.value)}
          className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          {contacts.filter((c) => c.can_text).map((c) => (
            <option key={c.id} value={c.id}>
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
            className="flex-1 rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
            onKeyDown={(e) => e.key === 'Enter' && handleText()}
            maxLength={160}
          />
          <button
            onClick={handleText}
            disabled={!messageText.trim() || !!loading}
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-base font-semibold text-white hover:bg-orange-600 transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {loading?.startsWith('text-') ? '…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

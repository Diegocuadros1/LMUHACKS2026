'use client'

import { useState } from 'react'
import type { PatientSummary } from '@/lib/types'

interface NurseSummaryEditorProps {
  summary: PatientSummary
  nurseId: string
}

export function NurseSummaryEditor({ summary: initial, nurseId }: NurseSummaryEditorProps) {
  const [summary, setSummary] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof PatientSummary, value: string) => {
    setSummary((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/summaries/${summary.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary_text: summary.summary_text,
          allergies: summary.allergies,
          diagnoses_display: summary.diagnoses_display,
          precautions: summary.precautions,
          approved_by_nurse_id: nurseId,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const fields: { key: keyof PatientSummary; label: string; rows: number; hint?: string }[] = [
    { key: 'summary_text', label: 'Patient Summary', rows: 5, hint: 'What the patient can see and the AI can reference.' },
    { key: 'diagnoses_display', label: 'Diagnoses (Display)', rows: 2, hint: 'Plain-language conditions shown to the patient.' },
    { key: 'allergies', label: 'Allergies', rows: 2 },
    { key: 'precautions', label: 'Precautions / Special Instructions', rows: 3, hint: 'Fall risk, dietary restrictions, etc.' },
  ]

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Patient Summary (Nurse Edit)</h2>
        <p className="text-xs text-gray-400">
          Last updated: {new Date(summary.updated_at).toLocaleString()}
        </p>
      </div>

      {fields.map(({ key, label, rows, hint }) => (
        <div key={key} className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">{label}</label>
          {hint && <p className="text-xs text-gray-400">{hint}</p>}
          <textarea
            value={(summary[key] as string) ?? ''}
            onChange={(e) => handleChange(key, e.target.value)}
            rows={rows}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
          />
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {saving ? 'Saving…' : 'Save & Approve'}
        </button>
        {saved && <span className="text-sm font-medium text-green-600">✓ Saved and approved</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      <p className="text-xs text-gray-400">
        Saving marks this summary as nurse-approved. The AI assistant will reference this content.
      </p>
    </div>
  )
}

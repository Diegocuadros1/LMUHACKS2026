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
    {
      key: 'summary_text',
      label: 'Patient Summary',
      rows: 6,
      hint: 'What the patient can see and the AI can reference.',
    },
    {
      key: 'diagnoses_display',
      label: 'Diagnoses (Display)',
      rows: 1,
      hint: 'Plain-language conditions shown to the patient.',
    },
    { key: 'allergies', label: 'Allergies', rows: 1 },
    {
      key: 'precautions',
      label: 'Precautions / Special Instructions',
      rows: 4,
      hint: 'Fall risk, dietary restrictions, etc.',
    },
  ]

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Patient Summary (Nurse Edit)</h2>
        <p className="text-[10px] text-slate-400">
          Last updated: {new Date(summary.updated_at).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {fields.map(({ key, label, rows, hint }) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <label className="block text-xs font-semibold text-slate-700">{label}</label>
            {hint && <p className="mt-0.5 text-[10px] text-slate-400">{hint}</p>}
            <textarea
              value={(summary[key] as string) ?? ''}
              onChange={(e) => handleChange(key, e.target.value)}
              rows={rows}
              className="mt-1.5 w-full resize-none overflow-hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {saving ? 'Saving…' : 'Save & Approve'}
        </button>

        {saved && <span className="text-xs font-medium text-green-600">✓ Saved and approved</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Saving marks this summary as nurse-approved. The AI assistant will reference this content.
      </p>
    </div>
  )
}

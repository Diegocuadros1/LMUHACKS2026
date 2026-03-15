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
      setError('FAILED TO SAVE. PLEASE TRY AGAIN.')
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
    <div className="border border-[#a0a0a0] bg-[#f9f9f9] shadow-sm font-sans">
      {/* 2000s Panel Header */}
      <div className="bg-[#cccccc] border-b border-[#a0a0a0] px-3 py-1.5 flex justify-between items-center">
        <h2 className="text-xs font-bold text-[#333] uppercase tracking-wide">
          Patient Summary (Nurse Edit)
        </h2>
        <p className="text-[10px] text-[#555] uppercase">
          Last updated: {new Date(summary.updated_at).toLocaleString('en-US')}
        </p>
      </div>

      <div className="p-3 space-y-3">
        {fields.map(({ key, label, rows, hint }) => (
          <div key={key} className="flex flex-col">
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-[11px] font-bold text-[#222] uppercase">
                {label}:
              </label>
              {hint && <span className="text-[10px] text-[#666] italic">{hint}</span>}
            </div>
            <textarea
              value={(summary[key] as string) ?? ''}
              onChange={(e) => handleChange(key, e.target.value)}
              rows={rows}
              className="w-full border border-[#cccccc] border-t-[#808080] border-l-[#808080] bg-white px-2 py-1 text-[13px] text-black focus:outline-none focus:bg-[#ffffe6] resize-y"
            />
          </div>
        ))}

        <div className="mt-4 pt-3 border-t border-[#cccccc] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#cccccc] border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] px-4 py-1 text-[11px] font-bold text-black uppercase active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff] disabled:opacity-50 cursor-pointer shadow-none rounded-none"
            >
              {saving ? 'SAVING...' : 'SAVE & APPROVE'}
            </button>

            {saved && (
              <span className="text-[11px] font-bold text-[#006600] uppercase">
                [ ✓ SAVED AND APPROVED ]
              </span>
            )}
            {error && (
              <span className="text-[11px] font-bold text-[#cc0000] uppercase">
                [ ! ] {error}
              </span>
            )}
          </div>

          <p className="text-[10px] text-[#666] uppercase leading-tight sm:text-right max-w-[250px]">
            Saving marks this summary as nurse-approved. The AI assistant will reference this content.
          </p>
        </div>
      </div>
    </div>
  )
}
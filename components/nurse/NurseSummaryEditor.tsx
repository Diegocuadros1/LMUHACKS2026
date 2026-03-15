'use client'

import { useState } from 'react'
import type { PatientSummary } from '@/lib/types'

interface NurseSummaryEditorProps {
  summary: PatientSummary | null
  patientId: string
  nurseId: string
}

const EMPTY = { summary_text: '', diagnoses_display: '', allergies: '', precautions: '' }

export function NurseSummaryEditor({ summary: initial, patientId, nurseId }: NurseSummaryEditorProps) {
  const [summary, setSummary] = useState<PatientSummary | null>(initial)
  const [fields, setFields] = useState({
    summary_text: initial?.summary_text ?? '',
    diagnoses_display: initial?.diagnoses_display ?? '',
    allergies: initial?.allergies ?? '',
    precautions: initial?.precautions ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (key: keyof typeof EMPTY, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      let res: Response

      if (summary) {
        // Update existing summary
        res = await fetch(`/api/summaries/${summary.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...fields, approved_by_nurse_id: nurseId }),
        })
      } else {
        // Create new summary
        res = await fetch('/api/summaries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId, ...fields, approved_by_nurse_id: nurseId }),
        })
        if (res.ok) {
          const data = await res.json()
          setSummary(data.summary)
        }
      }

      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('FAILED TO SAVE. PLEASE TRY AGAIN.')
    } finally {
      setSaving(false)
    }
  }

  const formFields: { key: keyof typeof EMPTY; label: string; rows: number; hint?: string }[] = [
    { key: 'summary_text', label: 'Patient Summary', rows: 5, hint: 'Visible to the patient and referenced by the AI.' },
    { key: 'diagnoses_display', label: 'Diagnoses (Display)', rows: 1, hint: 'Plain-language conditions shown to the patient.' },
    { key: 'allergies', label: 'Allergies', rows: 1 },
    { key: 'precautions', label: 'Precautions / Special Instructions', rows: 3, hint: 'Fall risk, dietary restrictions, etc.' },
  ]

  return (
    <div className="border border-[#a0a0a0] bg-[#f9f9f9] shadow-sm font-sans">
      <div className="bg-[#cccccc] border-b border-[#a0a0a0] px-3 py-1.5 flex justify-between items-center">
        <h2 className="text-xs font-bold text-[#333] uppercase tracking-wide">
          Patient Summary (Nurse Edit)
        </h2>
        {summary ? (
          <p className="text-[10px] text-[#555] uppercase">
            Last updated: {new Date(summary.updated_at).toLocaleString('en-US')}
          </p>
        ) : (
          <p className="text-[10px] text-[#cc6600] uppercase font-bold">[ No summary on file — create one below ]</p>
        )}
      </div>

      <div className="p-3 space-y-3">
        {formFields.map(({ key, label, rows, hint }) => (
          <div key={key} className="flex flex-col">
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-[11px] font-bold text-[#222] uppercase">{label}:</label>
              {hint && <span className="text-[10px] text-[#666] italic">{hint}</span>}
            </div>
            <textarea
              value={fields[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              rows={rows}
              className="w-full border border-[#cccccc] border-t-[#808080] border-l-[#808080] bg-white px-2 py-1 text-[13px] text-black focus:outline-none focus:bg-[#ffffe6] resize-y"
            />
          </div>
        ))}

        <div className="mt-4 pt-3 border-t border-[#cccccc] flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#cccccc] border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] px-4 py-1 text-[11px] font-bold text-black uppercase active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff] disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'SAVING...' : summary ? 'SAVE & APPROVE' : 'CREATE & APPROVE'}
          </button>
          {saved && <span className="text-[11px] font-bold text-[#006600] uppercase">[ ✓ SAVED ]</span>}
          {error && <span className="text-[11px] font-bold text-[#cc0000] uppercase">[ ! ] {error}</span>}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import type { Medication } from '@/lib/types'

interface MedicationEditorProps {
  patientId: string
  initialMedications: Medication[]
}

const BLANK = { med_name: '', dose: '', schedule_text: '', nurse_notes: '' }

export function MedicationEditor({ patientId, initialMedications }: MedicationEditorProps) {
  const [medications, setMedications] = useState<Medication[]>(initialMedications)
  const [form, setForm] = useState(BLANK)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!form.med_name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, ...form }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setMedications((prev) => [...prev, data.medication])
      setForm(BLANK)
      setAdding(false)
    } catch {
      setError('FAILED TO ADD MEDICATION.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Existing medications */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 p-2">
        {medications.length === 0 && !adding && (
          <p className="text-[11px] text-[#666] uppercase p-2 border border-[#cccccc] bg-white text-center">
            No medications on file.
          </p>
        )}
        {medications.map((m) => (
          <div key={m.id} className="border border-[#a0a0a0] bg-white px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-[12px] font-bold text-[#003366] uppercase">
                  {m.med_name}{m.dose ? ` — ${m.dose}` : ''}
                </h3>
                {m.schedule_text && (
                  <p className="mt-0.5 text-[10px] text-[#555] uppercase">
                    <span className="font-bold text-[#333]">SCHEDULE:</span> {m.schedule_text}
                  </p>
                )}
                {m.nurse_notes && (
                  <p className="mt-0.5 text-[10px] text-[#cc0000] font-bold uppercase">
                    NOTE: {m.nurse_notes}
                  </p>
                )}
              </div>
              <span className={`shrink-0 border px-1.5 py-0.5 text-[9px] font-bold tracking-wider ${
                m.active ? 'border-[#006600] text-black' : 'border-[#666666] text-[#333333] bg-[#e6e6e6]'
              }`}>
                {m.active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>
        ))}

        {/* Add medication form */}
        {adding && (
          <div className="border-2 border-[#003366] bg-white p-3 space-y-2">
            <p className="text-[11px] font-bold text-[#003366] uppercase">New Medication Entry</p>
            {[
              { key: 'med_name', label: 'Medication Name *', placeholder: 'e.g. Metformin' },
              { key: 'dose', label: 'Dose', placeholder: 'e.g. 500mg twice daily' },
              { key: 'schedule_text', label: 'Schedule', placeholder: 'e.g. With meals, morning and evening' },
              { key: 'nurse_notes', label: 'Nurse Notes', placeholder: 'e.g. Monitor blood sugar' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-[10px] font-bold text-[#333] uppercase block mb-0.5">{label}</label>
                <input
                  type="text"
                  value={form[key as keyof typeof BLANK]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-t-[#808080] border-l-[#808080] border-r-[#fff] border-b-[#fff] bg-white px-2 py-1 text-[12px] text-black focus:outline-none focus:bg-[#ffffe6]"
                />
              </div>
            ))}
            {error && <p className="text-[10px] font-bold text-[#cc0000] uppercase">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAdd}
                disabled={!form.med_name.trim() || saving}
                className="bg-[#cccccc] border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] px-3 py-0.5 text-[10px] font-bold text-black uppercase disabled:opacity-50 active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff]"
              >
                {saving ? 'SAVING...' : 'ADD'}
              </button>
              <button
                onClick={() => { setAdding(false); setForm(BLANK); setError(null) }}
                className="bg-[#cccccc] border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] px-3 py-0.5 text-[10px] font-bold text-black uppercase active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff]"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer button */}
      {!adding && (
        <div className="shrink-0 border-t border-[#a0a0a0] bg-[#e6e6e6] px-2 py-1.5">
          <button
            onClick={() => setAdding(true)}
            className="bg-[#cccccc] border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] px-3 py-0.5 text-[10px] font-bold text-black uppercase active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff]"
          >
            + ADD MEDICATION
          </button>
        </div>
      )}
    </div>
  )
}

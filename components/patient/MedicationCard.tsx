'use client'

import type { Medication } from '@/lib/types'

interface MedicationCardProps {
  medications: Medication[]
  loading?: boolean
}

export function MedicationCard({ medications, loading }: MedicationCardProps) {
  if (loading) {
    return (
      <div className="animate-pulse bg-white border border-gray-300 p-4 space-y-3">
        <div className="h-4 w-1/3 rounded bg-gray-200" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded bg-gray-100" />
        ))}
      </div>
    )
  }

  const active = medications.filter((m) => m.active)

  return (
    <div className="bg-white border border-gray-300 p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
        Medications Today
        <span className="ml-2 border border-gray-400 px-1.5 py-0.5 text-xs font-normal text-gray-600">
          {active.length}
        </span>
      </h2>

      {active.length === 0 && (
        <p className="text-sm text-gray-500">No active medications on file.</p>
      )}

      <ul className="space-y-2">
        {active.map((med) => (
          <li key={med.id} className="border border-gray-200 bg-gray-50 px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">{med.med_name}</p>
                {med.dose && <p className="text-xs text-gray-600">{med.dose}</p>}
              </div>
              <span className="shrink-0 border border-gray-400 px-2 py-0.5 text-xs text-gray-700">
                Active
              </span>
            </div>
            {med.schedule_text && (
              <p className="mt-1 text-xs text-gray-500"> {med.schedule_text}</p>
            )}
          </li>
        ))}
      </ul>

      <p className="text-xs text-gray-400">
        Only your nurse can add or change medications.
      </p>
    </div>
  )
}

'use client'

import type { Medication } from '@/lib/types'

interface MedicationCardProps {
  medications: Medication[]
  loading?: boolean
}

export function MedicationCard({ medications, loading }: MedicationCardProps) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl bg-green-50 p-6 space-y-3">
        <div className="h-5 w-1/3 rounded bg-green-200" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-green-100" />
        ))}
      </div>
    )
  }

  const active = medications.filter((m) => m.active)

  return (
    <div className="rounded-2xl bg-green-50 p-6 space-y-4">
      <h2 className="text-xl font-bold text-green-900">
        Medications Today
        <span className="ml-2 rounded-full bg-green-200 px-2.5 py-0.5 text-sm font-semibold text-green-800">
          {active.length}
        </span>
      </h2>

      {active.length === 0 && (
        <p className="text-gray-500">No active medications on file.</p>
      )}

      <ul className="space-y-3">
        {active.map((med) => (
          <li key={med.id} className="rounded-xl bg-white px-4 py-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-base font-bold text-gray-900">{med.med_name}</p>
                {med.dose && <p className="text-sm text-gray-600">{med.dose}</p>}
              </div>
              <span className="shrink-0 rounded-lg bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                Active
              </span>
            </div>
            {med.schedule_text && (
              <p className="mt-2 text-sm text-gray-500">⏰ {med.schedule_text}</p>
            )}
          </li>
        ))}
      </ul>

      <p className="text-xs text-gray-400">
        Only your nurse can add or change medications. Ask the assistant to notify your nurse if you have questions.
      </p>
    </div>
  )
}

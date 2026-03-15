'use client'

import type { PatientSummary } from '@/lib/types'

interface SummaryCardProps {
  summary: PatientSummary | null
  loading?: boolean
}

export function SummaryCard({ summary, loading }: SummaryCardProps) {
  if (loading) {
    return (
      <div className="animate-pulse bg-white border border-gray-300 p-4">
        <div className="mb-3 h-4 w-1/3 rounded bg-gray-200" />
        <div className="space-y-2">
          <div className="h-3 rounded bg-gray-100" />
          <div className="h-3 w-5/6 rounded bg-gray-100" />
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="bg-white border border-gray-300 p-4 text-sm text-gray-500">
        No summary available. Ask your nurse.
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-300 p-4 space-y-3 max-h-80 overflow-y-auto w-full overflow-x-hidden">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide sticky top-0 bg-white pb-1">
        Your Health Summary
      </h2>

      {summary.summary_text && (
        <p className="text-xs leading-relaxed text-gray-700 wrap-break-word">{summary.summary_text}</p>
      )}

      {summary.diagnoses_display && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Condition</p>
          <p className="mt-0.5 text-xs text-gray-800">{summary.diagnoses_display}</p>
        </div>
      )}

      {summary.allergies && (
        <div className="border-l-2 border-red-500 pl-3 py-1 bg-gray-50">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Allergies</p>
          <p className="mt-0.5 text-xs text-gray-800">{summary.allergies}</p>
        </div>
      )}

      {summary.precautions && (
        <div className="border-l-2 border-yellow-500 pl-3 py-1 bg-gray-50">
          <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700">Precautions</p>
          <p className="mt-0.5 text-xs text-gray-800">{summary.precautions}</p>
        </div>
      )}
    </div>
  )
}

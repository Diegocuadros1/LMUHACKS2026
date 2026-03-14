'use client'

import type { PatientSummary } from '@/lib/types'

interface SummaryCardProps {
  summary: PatientSummary | null
  loading?: boolean
}

export function SummaryCard({ summary, loading }: SummaryCardProps) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl bg-blue-50 p-6">
        <div className="mb-3 h-5 w-1/3 rounded bg-blue-200" />
        <div className="space-y-2">
          <div className="h-4 rounded bg-blue-100" />
          <div className="h-4 w-5/6 rounded bg-blue-100" />
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="rounded-2xl bg-gray-50 p-6 text-gray-500">
        No summary available. Ask your nurse.
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-blue-50 p-6 space-y-4">
      <h2 className="text-xl font-bold text-blue-900">Your Health Summary</h2>

      {summary.summary_text && (
        <p className="text-base leading-relaxed text-blue-800">{summary.summary_text}</p>
      )}

      {summary.diagnoses_display && (
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Condition</p>
          <p className="mt-1 text-base text-blue-900">{summary.diagnoses_display}</p>
        </div>
      )}

      {summary.allergies && (
        <div className="rounded-xl bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-700">Allergies</p>
          <p className="mt-1 text-base font-medium text-red-800">{summary.allergies}</p>
        </div>
      )}

      {summary.precautions && (
        <div className="rounded-xl bg-yellow-50 px-4 py-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-yellow-700">Precautions</p>
          <p className="mt-1 text-base text-yellow-800">{summary.precautions}</p>
        </div>
      )}
    </div>
  )
}

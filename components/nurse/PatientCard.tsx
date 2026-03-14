'use client'

import Link from 'next/link'
import type { Patient, Alert } from '@/lib/types'

interface PatientCardProps {
  patient: Patient
  openAlerts: Alert[]
}

const statusColors: Record<string, string> = {
  admitted: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  discharged: 'bg-gray-100 text-gray-600',
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-blue-500 text-white',
}

export function PatientCard({ patient, openAlerts }: PatientCardProps) {
  const topAlert = openAlerts.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    return order[a.severity] - order[b.severity]
  })[0]

  return (
    <Link href={`/nurse/patients/${patient.id}`}>
      <div className="cursor-pointer rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition border border-gray-100 hover:border-blue-200 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-gray-900">
              {patient.profiles?.full_name ?? 'Unknown Patient'}
            </p>
            <p className="text-sm text-gray-500">Room {patient.room_number}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[patient.admission_status]}`}>
              {patient.admission_status}
            </span>
            {openAlerts.length > 0 && (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${severityColors[topAlert.severity]}`}>
                {openAlerts.length} alert{openAlerts.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Top alert preview */}
        {topAlert && (
          <div className={`rounded-lg px-3 py-2 text-xs font-medium ${severityColors[topAlert.severity]}`}>
            ⚠️ {topAlert.reason.slice(0, 90)}{topAlert.reason.length > 90 ? '…' : ''}
          </div>
        )}

        {/* DOB */}
        {patient.date_of_birth && (
          <p className="text-xs text-gray-400">
            DOB: {new Date(patient.date_of_birth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}

        <p className="text-right text-xs font-medium text-blue-600">View details →</p>
      </div>
    </Link>
  )
}

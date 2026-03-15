'use client'

import Link from 'next/link'
import type { Patient, Alert } from '@/lib/types'

interface PatientCardProps {
  patient: Patient
  openAlerts: Alert[]
}

// 2000s enterprise high-contrast status colors
const statusColors: Record<string, string> = {
  // Removed text-[#006600] and replaced with text-black
  admitted: 'border-[#006600] text-black bg-[#e6ffe6]',
  pending: 'border-[#cca300] text-[#806600] bg-[#ffffe6]',
  discharged: 'border-[#666666] text-[#333333] bg-[#e6e6e6]',
}

// Matching the AlertFeed palette
const severityColors: Record<string, string> = {
  critical: 'bg-[#cc0000] text-white border-[#990000]',
  high: 'bg-[#ff8c00] text-white border-[#cc7000]',
  medium: 'bg-[#ffcc00] text-black border-[#cca300]',
  low: 'bg-[#3366cc] text-white border-[#24478f]',
}

export function PatientCard({ patient, openAlerts }: PatientCardProps) {
  const topAlert = openAlerts.sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    return order[a.severity] - order[b.severity]
  })[0]

  return (
    <Link href={`/nurse/patients/${patient.id}`} className="block no-underline">
      <div className="border border-[#a0a0a0] bg-white p-3 hover:bg-[#f0f5ff] font-sans space-y-2 cursor-pointer transition-none">
        
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 border-b border-[#cccccc] pb-2">
          <div>
            <p className="text-[13px] font-bold  uppercase">
              {patient.profiles?.full_name ?? 'UNKNOWN PATIENT'}
            </p>
            
            <p className="text-[11px] text-[#666] mt-1">
              <span className="font-bold text-[#333]">DOB:</span>{' '}
              {patient.date_of_birth 
                ? new Date(patient.date_of_birth).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) 
                : 'N/A'}
            </p>
            
            <p className="text-[11px] text-[#555] uppercase mt-0.5">
              <span className="font-bold text-[#333]">RM:</span> {patient.room_number}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            {/* Changed 'uppercase' to 'capitalize' so it only capitalizes the first letter */}
            <span className={`border px-2 py-0.5 text-[10px] font-bold capitalize ${statusColors[patient.admission_status] || statusColors.pending}`}>
              {patient.admission_status}
            </span>
            {openAlerts.length > 0 && (
              <span className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${severityColors[topAlert.severity]}`}>
                {openAlerts.length} ALERT{openAlerts.length > 1 ? 'S' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Top alert preview */}
        {topAlert && (
          <div className={`border px-2 py-1 text-[11px] font-bold ${severityColors[topAlert.severity]}`}>
            EXC: {topAlert.reason.slice(0, 90)}{topAlert.reason.length > 90 ? '...' : ''}
          </div>
        )}

        {/* Footer row: Action */}
        <div className="flex items-end justify-end pt-1">
          <p className="text-[11px] font-bold text-[#0033cc] hover:text-[#000066] underline">
            [ VIEW DETAILS ]
          </p>
        </div>
        
      </div>
    </Link>
  )
}
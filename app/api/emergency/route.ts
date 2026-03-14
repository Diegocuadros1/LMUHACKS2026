import { NextRequest, NextResponse } from 'next/server'
import { createNurseAlert } from '@/lib/tools/createNurseAlert'

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get('patientId')

  if (!patientId) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  console.log("EMERGENCY ALERT: Patient ID", patientId)

  await createNurseAlert(
    patientId,
    'critical',
    'Patient pressed the EMERGENCY button from the patient interface.'
  )

  // Redirect back to patient page with confirmation
  return NextResponse.redirect(new URL(`/patient/${patientId}?emergency=true`, req.url))
}

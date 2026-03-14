import { createServiceClient } from '@/lib/supabase/server'
import { logInteraction } from './logInteraction'
import type { AlertSeverity } from '@/lib/types'

export async function createNurseAlert(
  patientId: string,
  severity: AlertSeverity,
  reason: string
) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('alerts')
    .insert({
      patient_id: patientId,
      severity,
      reason,
      created_by: 'assistant',
      status: 'open',
    })
    .select()
    .single()

  if (error) {
    const result = { success: false, error: 'Failed to create alert' }
    await logInteraction(patientId, 'createNurseAlert', { patientId, severity, reason }, result, 'error')
    return result
  }

  const result = {
    success: true,
    alertId: data.id,
    severity,
    message: `Nurse has been alerted: "${reason}"`,
  }

  await logInteraction(patientId, 'createNurseAlert', { patientId, severity, reason }, result, 'success')
  return result
}

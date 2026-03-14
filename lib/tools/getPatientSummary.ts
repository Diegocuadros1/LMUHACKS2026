import { createServiceClient } from '@/lib/supabase/server'
import { logInteraction } from './logInteraction'

export async function getPatientSummary(patientId: string) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('patient_summaries')
    .select('*')
    .eq('patient_id', patientId)
    .single()

  if (error || !data) {
    const result = { success: false, error: 'Summary not found' }
    await logInteraction(patientId, 'getPatientSummary', { patientId }, result, 'error')
    return result
  }

  const result = {
    success: true,
    summary: data.summary_text,
    allergies: data.allergies,
    diagnoses: data.diagnoses_display,
    precautions: data.precautions,
  }

  await logInteraction(patientId, 'getPatientSummary', { patientId }, result, 'success')
  return result
}

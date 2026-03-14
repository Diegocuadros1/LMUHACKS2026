import { createServiceClient } from '@/lib/supabase/server'
import { logInteraction } from './logInteraction'

export async function getMedicationSchedule(patientId: string) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('patient_id', patientId)
    .eq('active', true)
    .order('created_at', { ascending: true })

  if (error) {
    const result = { success: false, error: 'Could not retrieve medications' }
    await logInteraction(patientId, 'getMedicationSchedule', { patientId }, result, 'error')
    return result
  }

  const meds = (data ?? []).map((m) => ({
    name: m.med_name,
    dose: m.dose,
    schedule: m.schedule_text,
  }))

  const result = { success: true, medications: meds }
  console.log("Retrieved medication schedule:")
  await logInteraction(patientId, 'getMedicationSchedule', { patientId }, result, 'success')
  return result
}

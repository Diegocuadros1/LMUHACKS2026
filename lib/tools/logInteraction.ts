import { createServiceClient } from '@/lib/supabase/server'

export async function logInteraction(
  patientId: string,
  toolName: string,
  input: Record<string, unknown>,
  output: Record<string, unknown>,
  status: 'success' | 'error' | 'mocked' = 'success'
) {
  try {
    const supabase = createServiceClient()
    await supabase.from('tool_logs').insert({
      patient_id: patientId,
      tool_name: toolName,
      input_json: input,
      output_json: output,
      status,
    })
  } catch (err) {
    // Non-fatal — log to console but don't break the chat flow
    console.error('[logInteraction] Failed to write tool log:', err)
  }
}

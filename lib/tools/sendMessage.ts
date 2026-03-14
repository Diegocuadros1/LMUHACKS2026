// MOCKED: Real integration would use Twilio SMS or similar.
// To add real SMS: replace the mock block with a Twilio Messages API call.

import { createServiceClient } from '@/lib/supabase/server'
import { logInteraction } from './logInteraction'

export async function sendMessage(
  patientId: string,
  contactName: string,
  message: string
) {
  const supabase = createServiceClient()

  // Look up by name (case-insensitive) scoped to this patient
  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('patient_id', patientId)
    .ilike('name', contactName)
    .single()

  if (error || !contact) {
    const result = { success: false, error: `No contact named "${contactName}" found.` }
    await logInteraction(patientId, 'sendMessage', { patientId, contactName, message }, result, 'error')
    return result
  }

  if (!contact.can_text) {
    const result = { success: false, error: `${contact.name} has not enabled text messages.` }
    await logInteraction(patientId, 'sendMessage', { patientId, contactName, message }, result, 'error')
    return result
  }

  console.log(`[MOCK sendMessage] SMS to ${contact.name} at ${contact.phone}: "${message}"`)
  const result = {
    success: true,
    mocked: true,
    message: `Message sent to ${contact.name} (${contact.relationship}): "${message}"`,
    contactName: contact.name,
    phone: contact.phone,
  }

  await logInteraction(patientId, 'sendMessage', { patientId, contactName, message }, result, 'mocked')
  return result
}

// MOCKED: Real integration would use Twilio Voice or similar.
// To add real calls: replace the mock block with a Twilio API call using
// process.env.TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER.

import { createServiceClient } from '@/lib/supabase/server'
import { logInteraction } from './logInteraction'

export async function callContact(patientId: string, contactName: string) {
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
    await logInteraction(patientId, 'callContact', { patientId, contactName }, result, 'error')
    return result
  }

  if (!contact.can_call) {
    const result = { success: false, error: `${contact.name} has not enabled calls.` }
    await logInteraction(patientId, 'callContact', { patientId, contactName }, result, 'error')
    return result
  }

  console.log(`[MOCK callContact] Initiating call to ${contact.name} at ${contact.phone}`)
  const result = {
    success: true,
    mocked: true,
    message: `Call initiated to ${contact.name} (${contact.relationship}) at ${contact.phone}. They will be connected shortly.`,
    contactName: contact.name,
    phone: contact.phone,
  }

  await logInteraction(patientId, 'callContact', { patientId, contactName }, result, 'mocked')
  return result
}

// MOCKED: Real integration would use Twilio Voice or similar.
// To add real calls: replace the mock block with a Twilio API call using
// process.env.TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER.

import { createServiceClient } from '@/lib/supabase/server'
import { logInteraction } from './logInteraction'

export async function callContact(patientId: string, contactId: string) {
  const supabase = createServiceClient()

  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .eq('patient_id', patientId)
    .single()

  if (error || !contact) {
    const result = { success: false, error: 'Contact not found' }
    await logInteraction(patientId, 'callContact', { patientId, contactId }, result, 'error')
    return result
  }

  if (!contact.can_call) {
    const result = { success: false, error: `${contact.name} has not enabled calls.` }
    await logInteraction(patientId, 'callContact', { patientId, contactId }, result, 'error')
    return result
  }

  // --- MOCK: simulate a successful call initiation ---
  console.log(`[MOCK callContact] Initiating call to ${contact.name} at ${contact.phone}`)
  const result = {
    success: true,
    mocked: true,
    message: `Call initiated to ${contact.name} (${contact.relationship}) at ${contact.phone}. They will be connected shortly.`,
    contactName: contact.name,
    phone: contact.phone,
  }
  // --- END MOCK ---

  await logInteraction(patientId, 'callContact', { patientId, contactId }, result, 'mocked')
  return result
}

// Tool registry — maps OpenAI tool definitions to their handler functions.
// Add new tools here: define the schema and point to the implementation.

import type { ChatCompletionTool } from 'openai/resources/chat/completions'
import { getPatientSummary } from '@/lib/tools/getPatientSummary'
import { getMedicationSchedule } from '@/lib/tools/getMedicationSchedule'
import { callContact } from '@/lib/tools/callContact'
import { sendMessage } from '@/lib/tools/sendMessage'
import { createNurseAlert } from '@/lib/tools/createNurseAlert'
import { controlRoomDevice } from '@/lib/tools/controlRoomDevice'

// OpenAI-compatible tool schemas
export const TOOL_DEFINITIONS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'getPatientSummary',
      description: 'Retrieve the nurse-approved patient summary including diagnoses (display only), allergies, and precautions.',
      parameters: {
        type: 'object',
        properties: {
          patientId: { type: 'string', description: 'The patient UUID' },
        },
        required: ['patientId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getMedicationSchedule',
      description: 'Retrieve the patient\'s current active medication schedule.',
      parameters: {
        type: 'object',
        properties: {
          patientId: { type: 'string', description: 'The patient UUID' },
        },
        required: ['patientId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'callContact',
      description: 'Initiate a phone call to a family or emergency contact by name (e.g. "Elena", "my daughter").',
      parameters: {
        type: 'object',
        properties: {
          patientId: { type: 'string', description: 'The patient UUID' },
          contactName: { type: 'string', description: 'The contact\'s first or full name as the patient knows them' },
        },
        required: ['patientId', 'contactName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'sendMessage',
      description: 'Send a text message to a family or emergency contact on behalf of the patient.',
      parameters: {
        type: 'object',
        properties: {
          patientId: { type: 'string', description: 'The patient UUID' },
          contactName: { type: 'string', description: 'The contact\'s first or full name as the patient knows them' },
          message: { type: 'string', description: 'The message text to send' },
        },
        required: ['patientId', 'contactName', 'message'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createNurseAlert',
      description: 'Create an alert for the nursing team. Use for urgent patient needs, safety concerns, or when the patient asks something outside your scope.',
      parameters: {
        type: 'object',
        properties: {
          patientId: { type: 'string', description: 'The patient UUID' },
          severity: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            description: 'Alert severity level',
          },
          reason: { type: 'string', description: 'Clear reason for the alert, written for nursing staff' },
        },
        required: ['patientId', 'severity', 'reason'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'controlRoomDevice',
      description: 'Control a room device: TV (on/off/set channel), lights (on/off/dim), bed (raise/lower), or nurse_call (trigger).',
      parameters: {
        type: 'object',
        properties: {
          patientId: { type: 'string', description: 'The patient UUID' },
          deviceType: {
            type: 'string',
            enum: ['tv', 'lights', 'bed', 'nurse_call'],
          },
          action: {
            type: 'string',
            enum: ['on', 'off', 'dim', 'raise', 'lower', 'trigger', 'set'],
          },
          value: {
            type: 'number',
            description: 'Optional numeric value (e.g. brightness 0-100, channel number, bed angle)',
          },
        },
        required: ['patientId', 'deviceType', 'action'],
      },
    },
  },
]

// Dispatch a tool call by name, injecting the patientId from context
export async function dispatchTool(
  toolName: string,
  args: Record<string, unknown>,
  _patientId: string // patientId from request context (security: use this, not args.patientId)
): Promise<Record<string, unknown>> {
  // Always use patientId from the server-side context to prevent injection
  const patientId = _patientId

  switch (toolName) {
    case 'getPatientSummary':
      return getPatientSummary(patientId) as Promise<Record<string, unknown>>

    case 'getMedicationSchedule':
      return getMedicationSchedule(patientId) as Promise<Record<string, unknown>>

    case 'callContact':
      return callContact(patientId, args.contactName as string) as Promise<Record<string, unknown>>

    case 'sendMessage':
      return sendMessage(patientId, args.contactName as string, args.message as string) as Promise<Record<string, unknown>>

    case 'createNurseAlert':
      return createNurseAlert(patientId, args.severity as 'low' | 'medium' | 'high' | 'critical', args.reason as string) as Promise<Record<string, unknown>>

    case 'controlRoomDevice':
      return controlRoomDevice(
        patientId,
        args.deviceType as 'tv' | 'lights' | 'bed' | 'nurse_call',
        args.action as 'on' | 'off' | 'dim' | 'raise' | 'lower' | 'trigger' | 'set',
        args.value as number | undefined
      ) as Promise<Record<string, unknown>>

    default:
      return { success: false, error: `Unknown tool: ${toolName}` }
  }
}

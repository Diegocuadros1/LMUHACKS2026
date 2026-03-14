// CareCompanion — shared database types
// Generated from Supabase schema. Keep in sync with migrations/001_initial.sql.

export type Role = 'patient' | 'nurse' | 'admin'
export type AdmissionStatus = 'admitted' | 'discharged' | 'pending'
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
export type AlertStatus = 'open' | 'acknowledged' | 'resolved'
export type MessageSender = 'patient' | 'assistant' | 'system' | 'nurse'
export type ToolStatus = 'success' | 'error' | 'mocked'

export interface Profile {
  id: string
  role: Role
  full_name: string | null
  phone: string | null
  created_at: string
}

export interface Patient {
  id: string
  profile_id: string | null
  room_number: string
  date_of_birth: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  nurse_id: string | null
  admission_status: AdmissionStatus
  created_at: string
  // joined fields
  profiles?: Profile
}

export interface PatientSummary {
  id: string
  patient_id: string
  summary_text: string | null
  allergies: string | null
  diagnoses_display: string | null
  precautions: string | null
  approved_by_nurse_id: string | null
  updated_at: string
}

export interface Medication {
  id: string
  patient_id: string
  med_name: string
  dose: string | null
  schedule_text: string | null
  nurse_notes: string | null
  active: boolean
  created_at: string
}

export interface ChatSession {
  id: string
  patient_id: string
  started_at: string
  ended_at: string | null
}

export interface ChatMessage {
  id: string
  session_id: string
  sender: MessageSender
  content: string
  tool_name: string | null
  flagged_incorrect: boolean
  created_at: string
}

export interface Alert {
  id: string
  patient_id: string
  severity: AlertSeverity
  reason: string
  created_by: string
  status: AlertStatus
  created_at: string
}

export interface Contact {
  id: string
  patient_id: string
  name: string
  relationship: string | null
  phone: string | null
  can_call: boolean
  can_text: boolean
  created_at: string
}

export interface RoomDevice {
  id: string
  patient_id: string
  device_type: string
  device_name: string | null
  state_json: Record<string, unknown>
  created_at: string
}

export interface ToolLog {
  id: string
  patient_id: string
  tool_name: string
  input_json: Record<string, unknown> | null
  output_json: Record<string, unknown> | null
  status: ToolStatus
  created_at: string
}

// Chat API types
export interface ChatRequestBody {
  patientId: string
  sessionId: string
  messages: { role: 'user' | 'assistant'; content: string }[]
}

export interface ChatResponseBody {
  message: string
  toolsUsed?: string[]
}

-- ============================================================
-- CareCompanion MVP — Initial Schema
-- Migration: 001_initial.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('patient', 'nurse', 'admin')),
  full_name text,
  phone text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  room_number text NOT NULL,
  date_of_birth date,
  emergency_contact_name text,
  emergency_contact_phone text,
  nurse_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  admission_status text DEFAULT 'admitted' CHECK (admission_status IN ('admitted', 'discharged', 'pending')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.patient_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  summary_text text,
  allergies text,
  diagnoses_display text,
  precautions text,
  approved_by_nurse_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  med_name text NOT NULL,
  dose text,
  schedule_text text,
  nurse_notes text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('patient', 'assistant', 'system')),
  content text NOT NULL,
  tool_name text,
  flagged_incorrect boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  reason text NOT NULL,
  created_by text DEFAULT 'assistant',
  status text DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text,
  phone text,
  can_call boolean DEFAULT true,
  can_text boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.room_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  device_type text NOT NULL,
  device_name text,
  state_json jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tool_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  tool_name text NOT NULL,
  input_json jsonb,
  output_json jsonb,
  status text DEFAULT 'success',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_logs ENABLE ROW LEVEL SECURITY;

-- HACKATHON DEV MODE: fully open policies for demo
-- TODO production hardening:
--   profiles: WHERE id = auth.uid()
--   patients (patient): WHERE profile_id = auth.uid()
--   patients (nurse): WHERE nurse_id = auth.uid()
--   patient_summaries, medications, contacts: join via patients above
--   tool_logs + chat_messages: nurse-read-only; service-role write via API
CREATE POLICY "dev_all_profiles"      ON public.profiles        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_patients"      ON public.patients        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_summaries"     ON public.patient_summaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_medications"   ON public.medications      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_chat_sessions" ON public.chat_sessions    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_chat_messages" ON public.chat_messages    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_alerts"        ON public.alerts           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_contacts"      ON public.contacts         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_room_devices"  ON public.room_devices     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_tool_logs"     ON public.tool_logs        FOR ALL USING (true) WITH CHECK (true);

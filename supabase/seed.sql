-- ============================================================
-- CareCompanion — Demo Seed Data
-- Run via Supabase MCP or: psql $DATABASE_URL -f supabase/seed.sql
-- Uses hardcoded UUIDs so re-runs are idempotent (ON CONFLICT DO NOTHING)
-- ============================================================

-- Demo auth users (requires service role or direct DB access)
INSERT INTO auth.users (id, email, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'nurse.sarah@demo.carecompanion.com',   now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000002', 'patient.john@demo.carecompanion.com',  now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000003', 'patient.maria@demo.carecompanion.com', now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, full_name, phone) VALUES
  ('00000000-0000-0000-0000-000000000001', 'nurse',   'Sarah Chen, RN', '+13105550001'),
  ('00000000-0000-0000-0000-000000000002', 'patient', 'John Martinez',  '+13105550002'),
  ('00000000-0000-0000-0000-000000000003', 'patient', 'Maria Thompson', '+13105550003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.patients (id, profile_id, room_number, date_of_birth, emergency_contact_name, emergency_contact_phone, nurse_id, admission_status)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '214A', '1958-04-12', 'Elena Martinez', '+13105550010', '00000000-0000-0000-0000-000000000001', 'admitted'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '307B', '1972-09-28', 'David Thompson',  '+13105550011', '00000000-0000-0000-0000-000000000001', 'admitted')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.patient_summaries (id, patient_id, summary_text, allergies, diagnoses_display, precautions, approved_by_nurse_id) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
   'Mr. Martinez is a 66-year-old male admitted for management of Type 2 Diabetes and hypertension. He is stable and responding well to IV insulin adjustment. Blood pressure is monitored every 4 hours. Diet is carbohydrate-controlled.',
   'Penicillin (rash), Sulfa drugs (anaphylaxis)',
   'Type 2 Diabetes Mellitus, Stage 2 Hypertension, Mild Peripheral Neuropathy',
   'Fall risk — call for assistance before getting out of bed. No high-sodium foods. Monitor blood glucose before every meal.',
   '00000000-0000-0000-0000-000000000001'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002',
   'Ms. Thompson is a 51-year-old female admitted following laparoscopic appendectomy. Surgery was uncomplicated. She is 18 hours post-op, tolerating clear liquids, pain well-controlled. Expected discharge in 24-48 hours.',
   'Latex (contact dermatitis), Codeine (nausea/vomiting)',
   'Post-operative care following laparoscopic appendectomy',
   'Latex-free environment required. Monitor incision site for signs of infection. Incentive spirometry every 2 hours while awake.',
   '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.medications (id, patient_id, med_name, dose, schedule_text, nurse_notes, active) VALUES
  ('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Metformin',       '500 mg',        'Twice daily with meals (8am, 6pm)',              'Watch for GI upset. Hold if NPO.', true),
  ('cccccccc-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'Lisinopril',      '10 mg',         'Once daily at 8am',                              'Hold if systolic BP < 100. Remind to rise slowly.', true),
  ('cccccccc-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'Regular Insulin', '4 units sliding scale', 'Before meals and at bedtime per sliding scale', 'Check glucose before administering.', true),
  ('cccccccc-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000002', 'Ibuprofen',       '400 mg',        'Every 6 hours as needed for pain (with food)',   'Do not exceed 4 doses in 24 hours.', true),
  ('cccccccc-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000002', 'Ondansetron',     '4 mg',          'Every 8 hours as needed for nausea',             'ODT formulation. Dissolve under tongue.', true),
  ('cccccccc-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000002', 'Cefazolin',       '1 g IV',        'Every 8 hours (6am, 2pm, 10pm) — post-op prophylaxis', 'Last dose tonight. Discontinue per MD order.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contacts (id, patient_id, name, relationship, phone, can_call, can_text) VALUES
  ('dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Elena Martinez', 'Daughter', '+13105550010', true, true),
  ('dddddddd-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'Carlos Martinez','Son',      '+13105550012', true, true),
  ('dddddddd-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002', 'David Thompson', 'Spouse',   '+13105550011', true, true),
  ('dddddddd-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000002', 'Alice Thompson', 'Sister',   '+13105550013', true, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.room_devices (id, patient_id, device_type, device_name, state_json) VALUES
  ('eeeeeeee-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'tv',         'Room TV',        '{"power": false, "channel": 5, "volume": 20}'),
  ('eeeeeeee-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'lights',     'Room Lights',    '{"power": true, "brightness": 80}'),
  ('eeeeeeee-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'bed',        'Adjustable Bed', '{"head_angle": 30, "foot_angle": 0}'),
  ('eeeeeeee-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'nurse_call', 'Nurse Call',     '{"active": false}'),
  ('eeeeeeee-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000002', 'tv',         'Room TV',        '{"power": true, "channel": 12, "volume": 15}'),
  ('eeeeeeee-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000002', 'lights',     'Room Lights',    '{"power": true, "brightness": 50}'),
  ('eeeeeeee-0000-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000002', 'bed',        'Adjustable Bed', '{"head_angle": 45, "foot_angle": 0}'),
  ('eeeeeeee-0000-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000002', 'nurse_call', 'Nurse Call',     '{"active": false}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.alerts (id, patient_id, severity, reason, created_by, status) VALUES
  ('ffffffff-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'high',   'Patient reported dizziness when standing — possible orthostatic hypotension.', 'assistant', 'open'),
  ('ffffffff-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'low',    'Patient asked about changing insulin dose. Nurse review requested.', 'assistant', 'acknowledged'),
  ('ffffffff-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002', 'medium', 'Patient reported incision site feels warm and slightly swollen.', 'assistant', 'open')
ON CONFLICT (id) DO NOTHING;

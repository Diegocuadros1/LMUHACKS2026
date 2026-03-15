-- ============================================================
-- CareCompanion — Create a new user via Supabase SQL Editor
-- Run each block separately, filling in the variables at the top.
-- ============================================================

-- ── STEP 1: Set your values ────────────────────────────────
-- Replace these before running.
DO $$
DECLARE
  v_email      TEXT    := 'nurse@hospital.com';   -- change me
  v_password   TEXT    := 'password123!';     -- change me
  v_role       TEXT    := 'nurse';                  -- 'nurse' | 'patient' | 'admin'
  v_full_name  TEXT    := 'Jane Smith';         -- change me
  v_phone      TEXT    := '+13105550099';           -- change me (optional)
  v_new_id     UUID    := gen_random_uuid();

  -- Patient-only fields (ignored if role != 'patient')
  v_room       TEXT    := '101A';
  v_nurse_id   UUID    := '00000000-0000-0000-0000-000000000001'; -- assigned nurse
BEGIN

  -- ── STEP 2: Create the auth user ──────────────────────────
  INSERT INTO auth.users (
    id, aud, role,
    email, encrypted_password,
    email_confirmed_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    v_new_id,
    'authenticated', 'authenticated',
    v_email,
    crypt(v_password, gen_salt('bf', 10)),
    now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}', '{}',
    now(), now()
  );

  -- ── STEP 3: Create the profile ────────────────────────────
  INSERT INTO public.profiles (id, role, full_name, phone)
  VALUES (v_new_id, v_role, v_full_name, v_phone);

  -- ── STEP 4 (patients only): Create the patient record ─────
  IF v_role = 'patient' THEN
    INSERT INTO public.patients (
      id, profile_id, room_number, nurse_id, admission_status
    ) VALUES (
      gen_random_uuid(), v_new_id, v_room, v_nurse_id, 'admitted'
    );
  END IF;

  RAISE NOTICE 'Created user % (%) with id %', v_email, v_role, v_new_id;
END $$;

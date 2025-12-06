-- FORCE CLEANUP AND CREATE
-- Run this in Supabase SQL Editor

-- 1. Aggressive Cleanup (Delete by Email AND ID)
-- We saw a conflict on ID '633d1abd-d9fc-460f-8469-fd55589b9db1' in previous errors.
DELETE FROM public.profiles WHERE id = '633d1abd-d9fc-460f-8469-fd55589b9db1';
DELETE FROM public.profiles WHERE email = 'atul.bharat@acropolis.in';
DELETE FROM auth.users WHERE email = 'atul.bharat@acropolis.in';

-- 2. Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Create Fresh User
DO $$
DECLARE
  new_id uuid := '633d1abd-d9fc-460f-8469-fd55589b9db1'; -- Reuse this ID to be consistent with whatever ghost was there, or gen_random_uuid()
  -- Actually, let's use a NEW random UUID to allow fresh start.
  actual_id uuid := gen_random_uuid();
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    actual_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'atul.bharat@acropolis.in',
    crypt('Password@123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Mr. Atul N Bharat", "role": "hod", "department": "Placement", "college": "Acropolis Institute of Technology and Research"}',
    now(),
    now()
  );

  -- Insert into public.profiles
  INSERT INTO public.profiles (
    id,
    email,
    role,
    full_name,
    department,
    college_name,
    is_approved
  ) VALUES (
    actual_id,
    'atul.bharat@acropolis.in',
    'hod',
    'Mr. Atul N Bharat',
    'Placement',
    'Acropolis Institute of Technology and Research',
    true
  );
END;
$$;

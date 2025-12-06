-- NUCLEAR OPTION: Delete and Recreate Atul Bharat User
-- Run this in Supabase SQL Editor

-- 1. Delete existing user (Cascade should handle profile, but let's be explicit)
DELETE FROM public.profiles WHERE email = 'atul.bharat@acropolis.in';
DELETE FROM auth.users WHERE email = 'atul.bharat@acropolis.in';

-- 2. Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Create fresh user
DO $$
DECLARE
  new_id uuid := gen_random_uuid();
BEGIN
  -- Insert into auth.users with explicit simple password hash
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
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    new_id,
    '00000000-0000-0000-0000-000000000000', -- Default instance_id
    'authenticated',
    'authenticated',
    'atul.bharat@acropolis.in',
    crypt('Password@123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Mr. Atul N Bharat", "role": "hod", "department": "Placement", "college": "Acropolis Institute of Technology and Research"}',
    now(),
    now(),
    '',
    ''
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
    new_id,
    'atul.bharat@acropolis.in',
    'hod',
    'Mr. Atul N Bharat',
    'Placement',
    'Acropolis Institute of Technology and Research',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    is_approved = EXCLUDED.is_approved,
    department = EXCLUDED.department,
    college_name = EXCLUDED.college_name;
END;
$$;

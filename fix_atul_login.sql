-- Force fix for Atul Bharat's login
-- Run this in Supabase SQL Editor

-- 1. Ensure Extension is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Direct Update to Auth User (Force verify and set password)
UPDATE auth.users
SET 
  encrypted_password = crypt('Password@123', gen_salt('bf')),
  email_confirmed_at = now(),
  raw_user_meta_data = jsonb_build_object(
    'full_name', 'Mr. Atul N Bharat',
    'department', 'Placement',
    'college', 'Acropolis Institute of Technology and Research',
    'role', 'hod'
  )
WHERE email = 'atul.bharat@acropolis.in';

-- 3. Direct Update to Public Profile (Ensure Approved and Role)
UPDATE public.profiles
SET 
  is_approved = true,
  role = 'hod',
  full_name = 'Mr. Atul N Bharat',
  department = 'Placement',
  college_name = 'Acropolis Institute of Technology and Research'
WHERE email = 'atul.bharat@acropolis.in';

-- 4. Check if we actually updated anything; if not, maybe the user doesn't exist at all?
-- If the above updates returned "0 rows", we need to INSERT.
-- But the previous script "should" have created it.
-- Just in case, this block will CREATE him if he is completely missing.
DO $$
DECLARE
  new_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'atul.bharat@acropolis.in') THEN
    new_id := gen_random_uuid();
    
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
    VALUES (
      new_id,
      'atul.bharat@acropolis.in',
      crypt('Password@123', gen_salt('bf')),
      now(),
      jsonb_build_object('full_name', 'Mr. Atul N Bharat', 'role', 'hod')
    );
    
    INSERT INTO public.profiles (id, email, role, full_name, is_approved)
    VALUES (new_id, 'atul.bharat@acropolis.in', 'hod', 'Mr. Atul N Bharat', true);
  END IF;
END;
$$;

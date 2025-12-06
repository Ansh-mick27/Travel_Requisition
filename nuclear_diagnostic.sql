-- NUCLEAR DIAGNOSTIC
-- Run in Supabase SQL Editor

-- 1. Check if user exists (output this!)
SELECT id, email FROM auth.users WHERE email = 'atul.bharat@acropolis.in';

-- 2. Rename profiles table to break the FK relationship
-- If the 500 error is due to public.profiles interaction, this will stop it.
ALTER TABLE public.profiles RENAME TO profiles_backup;

-- 3. Simulate Login Update
UPDATE auth.users 
SET last_sign_in_at = now() 
WHERE email = 'atul.bharat@acropolis.in';

-- 4. Passwords
UPDATE auth.users
SET encrypted_password = crypt('Password@123', gen_salt('bf'))
WHERE email = 'atul.bharat@acropolis.in';

-- DIAGNOSTIC & FIX: Drop Triggers and Test Update
-- Run this in Supabase SQL Editor

-- 1. Drop Potentially Crashing Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_role_change ON public.profiles;

-- 2. Drop the functions they used (to be safe)
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.sync_role_to_metadata();

-- 3. Disable RLS on Profiles (Ensure it is off)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 4. TEST: Manually simulate a login update.
-- If this query fails with 500 or error, we KNOW the DB is broken.
UPDATE auth.users 
SET last_sign_in_at = now() 
WHERE email = 'atul.bharat@acropolis.in';

-- 5. Force Password Reset (Just to be 100% sure)
UPDATE auth.users
SET encrypted_password = crypt('Password@123', gen_salt('bf'))
WHERE email = 'atul.bharat@acropolis.in';

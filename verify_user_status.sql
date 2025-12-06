-- VERIFY USER STATUS
-- Run this in Supabase SQL Editor

-- Check if the user exists in auth.users
SELECT id, email, role, last_sign_in_at FROM auth.users WHERE email = 'atul.bharat@acropolis.in';

-- Check if the profile exists
SELECT * FROM public.profiles WHERE email = 'atul.bharat@acropolis.in';

-- Count total users (just to see if we have ANY data)
SELECT count(*) as total_auth_users FROM auth.users;

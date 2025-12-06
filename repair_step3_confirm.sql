-- HYBRID REPAIR STEP 3: CONFIRM & PROMOTE
-- Run in Supabase SQL Editor AFTER the JS script runs

-- 1. Confirm the Email (Bypassing email link)
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'atul@acropolis.in';

-- 2. Ensure Profile Exists and is HOD
-- (The signup might have triggered handle_new_user, or not if we dropped it)
INSERT INTO public.profiles (id, email, role, full_name, department, college_name, is_approved)
SELECT 
    id, 
    email, 
    'hod', 
    'Mr. Atul N Bharat', 
    'Placement', 
    'Acropolis Institute of Technology and Research', 
    true
FROM auth.users 
WHERE email = 'atul@acropolis.in'
ON CONFLICT (id) DO UPDATE 
SET 
    role = 'hod',
    is_approved = true,
    full_name = 'Mr. Atul N Bharat';

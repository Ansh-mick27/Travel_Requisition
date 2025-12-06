-- HYBRID REPAIR STEP 1: CLEAN SLATE
-- Run in Supabase SQL Editor

-- Delete the corrupted user and profile
DELETE FROM public.profiles WHERE email IN ('atul@acropolis.in', 'atul.bharat@acropolis.in');
DELETE FROM auth.users WHERE email IN ('atul@acropolis.in', 'atul.bharat@acropolis.in');

-- Also delete the backup table if it still exists (cleanup)
DROP TABLE IF EXISTS public.profiles_backup;

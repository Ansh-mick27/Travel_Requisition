-- Disable Metadata Sync Trigger to fix 500 Error
-- Run this in Supabase SQL Editor

-- The trigger 'on_profile_role_change' might be failing or causing recursion during login/updates.
-- Let's drop it to see if Login starts working.

DROP TRIGGER IF EXISTS on_profile_role_change ON public.profiles;
DROP FUNCTION IF EXISTS public.sync_role_to_metadata();

-- Also ensure the user is definitely approved (just in case)
UPDATE public.profiles
SET is_approved = true
WHERE email = 'atul.bharat@acropolis.in';

-- REVERT AND RELOAD
-- Run this in Supabase SQL Editor

-- 1. Restore profiles table (if we renamed it)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles_backup') THEN
        ALTER TABLE public.profiles_backup RENAME TO profiles;
    END IF;
END $$;

-- 2. RELOAD SCHEMA CACHE (Fix for "Database error querying schema")
NOTIFY pgrst, 'reload config';

-- 3. Just to be sure, check user again
SELECT email, last_sign_in_at FROM auth.users WHERE email = 'atul.bharat@acropolis.in';

-- CHECK RENAME STATUS & USER
-- Run in Supabase SQL Editor

-- 1. Does profiles_backup exist?
SELECT to_regclass('public.profiles_backup') as backup_table_exists;

-- 2. Does public.profiles exist?
SELECT to_regclass('public.profiles') as original_table_exists;

-- 3. Check user again
SELECT id, email, last_sign_in_at FROM auth.users WHERE email = 'atul.bharat@acropolis.in';

-- CHECK SYSTEM STATE
-- Run in Supabase SQL Editor

-- 1. List all Triggers on auth.users and public.profiles
SELECT 
    event_object_schema as table_schema,
    event_object_table as table_name,
    trigger_name,
    action_timing,
    event_manipulation as trigger_event
FROM information_schema.triggers
WHERE event_object_table IN ('users', 'profiles');

-- 2. Check RLS Status
-- "relrowsecurity" is true if RLS is enabled
SELECT relname as "Table", relrowsecurity as "RLS Enabled"
FROM pg_class
WHERE relname IN ('profiles', 'vehicles', 'requisitions');

-- 3. Check Policies
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('profiles', 'vehicles', 'requisitions');

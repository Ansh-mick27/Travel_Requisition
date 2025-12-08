-- EMERGENCY RESET
-- We are resetting the "Search Path" to default settings.
-- This fixes the issue where the Auth System is looking in the wrong folder.

-- 1. Reset Role Configurations (Force them to look in public)
alter role authenticated set search_path = "$user", public, extensions;
alter role anon set search_path = "$user", public, extensions;
alter role service_role set search_path = "$user", public, extensions;
alter role postgres set search_path = "$user", public, extensions;

-- 2. Ensure Extension is definitely in Public
alter extension pgcrypto set schema public;

-- 3. Grant everything just to be safe
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;

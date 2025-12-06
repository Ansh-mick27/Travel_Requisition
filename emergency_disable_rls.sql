-- EMERGENCY: Disable RLS on Profiles to Diagnose 500 Error
-- Run this in Supabase SQL Editor

-- 500 Error on Login often means Infinite Recursion in RLS Policies.
-- Even if we dropped policies, sometimes they stick or there are hidden ones.
-- The ULTIMATE test is to disable RLS completely on this table.

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- If login works after this, we KNOW it was RLS.
-- We can re-enable it later with fixed policies.

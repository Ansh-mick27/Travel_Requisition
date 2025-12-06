-- ENHANCE REQUEST FORM
-- Run in Supabase SQL Editor

-- 1. Add new columns to requisitions table
ALTER TABLE public.requisitions
ADD COLUMN IF NOT EXISTS pickup_location text,
ADD COLUMN IF NOT EXISTS guest_name text,
ADD COLUMN IF NOT EXISTS guest_phone text;

-- 2. No new RLS needed as existing policies cover "all columns" usually, 
-- but if we had column-level security we'd need to check. 
-- Our policy was: `create policy "Users can insert their own profile" ...` 
-- and `create policy "Users can create requisitions" ...`
-- These usually allow full row inserts.

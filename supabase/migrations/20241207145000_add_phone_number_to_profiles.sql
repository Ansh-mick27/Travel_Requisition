-- Add phone_number column to profiles table if it doesn't exist
alter table public.profiles 
add column if not exists phone_number text;

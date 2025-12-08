-- PROMOTE TO ADMIN
-- Run this AFTER signing up as 'test_admin@example.com' via the App.

update public.profiles
set role = 'admin',
    is_approved = true,
    phone_number = '9876543212'
where email = 'test_admin@example.com';

-- Ensure Metadata Sync and Email Confirmation
update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb,
    email_confirmed_at = timezone('utc', now())
where email = 'test_admin@example.com';

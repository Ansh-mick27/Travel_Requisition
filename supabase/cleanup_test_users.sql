-- CLEANUP BROKEN TEST USERS
-- We suspect the manually generated passwords are invalid for this Supabase instance.
-- We will delete them so you can Sign Up manually.

delete from auth.users where email in ('test_req@example.com', 'test_hod@example.com', 'test_admin@example.com');
delete from public.profiles where email in ('test_req@example.com', 'test_hod@example.com', 'test_admin@example.com');

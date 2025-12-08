-- DIAGNOSTIC: Check if 'test_admin@example.com' exists
-- Run in Supabase SQL Editor and copy the results (JSON)

select 
    u.id as user_id, 
    u.email, 
    u.created_at, 
    u.email_confirmed_at,
    p.id as profile_id,
    p.role as profile_role
from auth.users u
left join public.profiles p on u.id = p.id
where u.email = 'test_admin@example.com';

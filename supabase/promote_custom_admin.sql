-- PROMOTE CUSTOM ADMIN
-- Replace 'PLACEHOLDER' with the real email.

update public.profiles
set 
    role = 'admin', 
    is_approved = true,
    full_name = 'Super Admin' -- Optional: Rename for clarity
where email = 'anshuloza@acropolis.in';

-- Also update Auth Metadata to match (Good practice)
update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
where email = 'anshuloza@acropolis.in';

-- Verify
select email, role, is_approved from public.profiles where email = 'anshuloza@acropolis.in';

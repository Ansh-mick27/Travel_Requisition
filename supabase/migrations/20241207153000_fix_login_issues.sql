-- 1. Ensure pgcrypto exists
create extension if not exists pgcrypto schema public;

-- 2. Drop the trigger that might be causing issues during User Creation/Update
-- (If this trigger is broken, it causes 500s)
drop trigger if exists on_auth_user_created on auth.users;

-- 3. Update the Seed Users to ensure they are set correctly
do $$
declare
    v_req_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    v_hod_id uuid := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
    v_adm_id uuid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
    v_password_hash text;
begin
    v_password_hash := crypt('password123', gen_salt('bf'));

    -- Update passwords if users exist
    update auth.users set encrypted_password = v_password_hash where email in ('test_req@example.com', 'test_hod@example.com', 'test_admin@example.com');
    
    -- Ensure Profiles have Phone Numbers (Fixing the previous Upsert miss)
    update public.profiles set phone_number = '7987613404' where id = v_req_id;
    update public.profiles set phone_number = '9876543211' where id = v_hod_id;
    update public.profiles set phone_number = '9876543212' where id = v_adm_id;

end $$;

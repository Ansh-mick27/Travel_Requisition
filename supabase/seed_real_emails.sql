-- SEED REAL EMAILS (Plan B - Final Fix)
-- Corrected Email: anshuloza@gmail.com

-- 0. SAFETY: Ensure pgcrypto is in PUBLIC (Fixes Database Error)
create extension if not exists pgcrypto schema public;
alter extension pgcrypto set schema public; 
grant execute on all functions in schema public to postgres, anon, authenticated, service_role;

-- 1. PROMOTE EXISTING ADMIN
update public.profiles
set role = 'admin', is_approved = true, phone_number = '9876543212'
where email = 'anshuloza@acropolis.in';

update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
where email = 'anshuloza@acropolis.in';

-- 2. CREATE/UPDATE REQUESTER & HOD
do $$
declare
    v_password_hash text;
    v_req_id uuid;
    v_hod_id uuid;
begin
    -- Calculate Hash
    v_password_hash := crypt('password123', gen_salt('bf'));

    -- A. REQUESTER: anshuloza@gmail.com (Fixed Typo)
    select id into v_req_id from auth.users where email = 'anshuloza@gmail.com';
    
    if v_req_id is not null then
        update auth.users set encrypted_password = v_password_hash, email_confirmed_at = now() where id = v_req_id;
    else
        v_req_id := gen_random_uuid();
        insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        values (v_req_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'anshuloza@gmail.com', v_password_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Real Requester"}', now(), now());
    end if;

    -- Profile for Requester
    insert into public.profiles (id, full_name, email, role, department, phone_number, is_approved)
    values (v_req_id, 'Real Requester', 'anshuloza@gmail.com', 'requester', 'CSE', '7987613404', true)
    on conflict (id) do update set is_approved = true, role = 'requester', phone_number = '7987613404';


    -- B. HOD: anshulmickey@gmail.com
    select id into v_hod_id from auth.users where email = 'anshulmickey@gmail.com';

    if v_hod_id is not null then
        update auth.users set encrypted_password = v_password_hash, email_confirmed_at = now() where id = v_hod_id;
    else
        v_hod_id := gen_random_uuid();
        insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        values (v_hod_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'anshulmickey@gmail.com', v_password_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Real HOD"}', now(), now());
    end if;

    -- Profile for HOD
    insert into public.profiles (id, full_name, email, role, department, phone_number, is_approved)
    values (v_hod_id, 'Real HOD', 'anshulmickey@gmail.com', 'hod', 'CSE', '9876543211', true)
    on conflict (id) do update set is_approved = true, role = 'hod';

end $$;

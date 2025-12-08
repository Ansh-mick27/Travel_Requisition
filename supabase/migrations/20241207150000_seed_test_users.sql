-- Enable pgcrypto for password hashing
create extension if not exists pgcrypto;

-- Helper to insert user if not exists
do $$
declare
    v_req_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    v_hod_id uuid := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
    v_adm_id uuid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
    v_password_hash text;
begin
    -- Generate Hash for 'password123' (Basic bcrypt)
    -- select crypt('password123', gen_salt('bf'));
    -- We'll just generate it dynamically.
    v_password_hash := crypt('password123', gen_salt('bf'));

    -- 1. Requester (test_req@example.com)
    if not exists (select 1 from auth.users where email = 'test_req@example.com') then
        insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        values (
            v_req_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'test_req@example.com',
            v_password_hash,
            now(), -- Confirmed
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Test Requester"}',
            now(),
            now()
        );
        
        insert into public.profiles (id, full_name, email, role, department, phone_number, is_approved)
        values (v_req_id, 'Test Requester', 'test_req@example.com', 'requester', 'CSE', '7987613404', true)
        on conflict (id) do update set is_approved = true;
    end if;

    -- 2. HOD (test_hod@example.com)
    if not exists (select 1 from auth.users where email = 'test_hod@example.com') then
        insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        values (
            v_hod_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'test_hod@example.com',
            v_password_hash,
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Test HOD"}',
            now(),
            now()
        );

        insert into public.profiles (id, full_name, email, role, department, phone_number, is_approved)
        values (v_hod_id, 'Test HOD', 'test_hod@example.com', 'hod', 'CSE', '9876543211', true)
        on conflict (id) do update set is_approved = true;
    end if;

    -- 3. Admin (test_admin@example.com)
    if not exists (select 1 from auth.users where email = 'test_admin@example.com') then
        insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        values (
            v_adm_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'test_admin@example.com',
            v_password_hash,
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Test Admin"}',
            now(),
            now()
        );

        insert into public.profiles (id, full_name, email, role, department, phone_number, is_approved)
        values (v_adm_id, 'Test Admin', 'test_admin@example.com', 'admin', 'Transport', '9876543212', true)
        on conflict (id) do update set is_approved = true;
    end if;

    -- 4. Test Driver
    if not exists (select 1 from public.drivers where phone_number = '9876500001') then
        insert into public.drivers (full_name, phone_number, status)
        values ('Ramesh Driver', '9876500001', 'active');
    end if;
end $$;

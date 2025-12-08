-- FINAL GOLDEN SEED SCRIPT
-- This script bypasses all Frontend/Email issues by creating users directly in the database.
-- It works because we have already dropped the problematic triggers.

-- 1. CLEANUP (Safety First)
delete from auth.users where email in ('test_req@example.com', 'test_hod@example.com', 'test_admin@example.com');
delete from public.profiles where email in ('test_req@example.com', 'test_hod@example.com', 'test_admin@example.com');
delete from public.drivers where phone_number = '9876500001';

-- 2. INSERT USERS (With Verified Email and Known Password)
do $$
declare
    v_req_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    v_hod_id uuid := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
    v_adm_id uuid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
    v_password_hash text;
begin
    -- Generate Hash for 'password123' check if pgcrypto is available
    -- If pgcrypto is missing, this might fail, but we added it in the fix script.
    -- Alternative: Use a known bcrypt hash for 'password123' to be safe?
    -- Hash: $2a$10$abcdef... (No, salts differ).
    -- We rely on gen_salt from pgcrypto.
    v_password_hash := crypt('password123', gen_salt('bf'));

    -- A. Requester
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values (v_req_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'test_req@example.com', v_password_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Test Requester"}', now(), now());
    
    insert into public.profiles (id, full_name, email, role, department, phone_number, is_approved)
    values (v_req_id, 'Test Requester', 'test_req@example.com', 'requester', 'CSE', '7987613404', true);

    -- B. HOD
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values (v_hod_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'test_hod@example.com', v_password_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Test HOD"}', now(), now());

    insert into public.profiles (id, full_name, email, role, department, phone_number, is_approved)
    values (v_hod_id, 'Test HOD', 'test_hod@example.com', 'hod', 'CSE', '9876543211', true);

    -- C. Admin
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values (v_adm_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'test_admin@example.com', v_password_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Test Admin"}', now(), now());

    insert into public.profiles (id, full_name, email, role, department, phone_number, is_approved)
    values (v_adm_id, 'Test Admin', 'test_admin@example.com', 'admin', 'Transport', '9876543212', true);

    -- 3. INSERT DRIVER
    insert into public.drivers (full_name, phone_number, status)
    values ('Ramesh Driver', '9876500001', 'active');

end $$;

-- GOLDEN SEED SCRIPT (The "Nuclear" Fix)
-- Run this in Supabase SQL Editor.
-- It will wipe the test data and recreate it perfectly.

-- 1. SETUP EXTENSIONS & CLEAN TRIGGERS
create extension if not exists pgcrypto schema public;

-- Drop ANY triggers that might crash Login/Signup
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_updated on auth.users;
drop trigger if exists on_profile_created on public.profiles;

-- 2. NUCLEAR CLEANUP (Handle Foreign Keys)
-- We remove data in order to prevent "Foreign Key Constraint" errors
delete from public.requisitions where requester_id in (select id from auth.users where email in ('test_req@example.com', 'test_hod@example.com', 'test_admin@example.com'));
-- delete from public.user_approvals; -- Table might not exist yet
delete from public.profiles where email in ('test_req@example.com', 'test_hod@example.com', 'test_admin@example.com');
delete from auth.users where email in ('test_req@example.com', 'test_hod@example.com', 'test_admin@example.com');
delete from public.drivers where phone_number = '9876500001';

-- 3. INSERT USERS (Directly into Database - No Email/Signup needed)
do $$
declare
    v_req_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    v_hod_id uuid := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
    v_adm_id uuid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
    v_password_hash text;
begin
    -- Generate Hash for 'password123'
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

    -- 4. INSERT DRIVER
    insert into public.drivers (full_name, phone_number, status)
    values ('Ramesh Driver', '9876500001', 'active');

end $$;

-- 5. VERIFY
select email, role, is_approved from public.profiles where email like 'test_%';

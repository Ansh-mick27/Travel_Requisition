-- CLEAN SLATE (Delete Users for Manual Signup)
-- Run this to allow you to Sign Up again with the Real Emails.

-- 1. DELETE DEPENDENCIES (Requisitions, etc)
delete from public.requisitions where requester_id in (select id from auth.users where email in ('anshuloza@gmail.com', 'anshulmickey@gmail.com', 'asnhuloza@gmail.com'));
delete from public.profiles where email in ('anshuloza@gmail.com', 'anshulmickey@gmail.com', 'asnhuloza@gmail.com');

-- 2. DELETE AUTH USERS
delete from auth.users where email in ('anshuloza@gmail.com', 'anshulmickey@gmail.com', 'asnhuloza@gmail.com');

-- 3. ENSURE EXTENSION IS READY (Just to be safe for new signups)
create extension if not exists pgcrypto schema public;
grant execute on all functions in schema public to postgres, anon, authenticated, service_role;
-- We leave it in 'public' ensuring no schema errors.

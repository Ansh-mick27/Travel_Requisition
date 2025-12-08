-- UNIVERSAL FIX (The Bridge)
-- This script explicitly exposes pgcrypto functions in BOTH schemas.
-- This solves the "Search Path" issue without needing a server restart.

-- 1. Ensure Extension is in 'extensions' (Best Practice)
create schema if not exists extensions;
create extension if not exists pgcrypto schema extensions;
do $$ begin
  alter extension pgcrypto set schema extensions;
exception when others then null; end $$;


-- 2. Create Wrappers in 'public' (For anyone looking there)
-- These forward the calls to the real functions in 'extensions'

create or replace function public.gen_salt(text) 
returns text as $$ 
    select extensions.gen_salt($1) 
$$ language sql security definer;

create or replace function public.crypt(text, text) 
returns text as $$ 
    select extensions.crypt($1, $2) 
$$ language sql security definer;

create or replace function public.uuid_generate_v4() 
returns uuid as $$ 
    select extensions.uuid_generate_v4() 
$$ language sql security definer;


-- 3. Permissions
grant usage on schema extensions to postgres, anon, authenticated, service_role;
grant usage on schema public to postgres, anon, authenticated, service_role;

grant execute on all functions in schema extensions to postgres, anon, authenticated, service_role;
grant execute on all functions in schema public to postgres, anon, authenticated, service_role;

-- 4. Verify
select public.gen_salt('bf');
select extensions.gen_salt('bf');

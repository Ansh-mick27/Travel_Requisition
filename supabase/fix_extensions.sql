-- FIX EXTENSIONS SCHEMA
-- The "Database error querying schema" often happens if pgcrypto is in 'public'
-- but Supabase Auth expects it in 'extensions'.

-- 1. Ensure 'extensions' schema exists
create schema if not exists extensions;

-- 2. Move pgcrypto to 'extensions' (if it's in public or elsewhere)
-- We use a DO block to handle errors gracefully if it's already there
do $$
begin
    alter extension pgcrypto set schema extensions;
exception
    when others then
        raise notice 'Extension pgcrypto is likely already in extensions or not installed';
end $$;

-- 3. Ensure 'extensions' is in the search path for everyone
alter role authenticated set search_path = public, extensions;
alter role anon set search_path = public, extensions;
alter role service_role set search_path = public, extensions;
alter database postgres set search_path = public, extensions;

-- 4. Grant usage
grant usage on schema extensions to postgres, anon, authenticated, service_role;
grant all on all functions in schema extensions to postgres, anon, authenticated, service_role;

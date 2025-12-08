-- REVERT EXTENSION TO PUBLIC
-- Since we cannot restart the server (Cloud/No-Docker),
-- we will move pgcrypto BACK to the 'public' schema where it is found by default.

-- 1. Move extension
alter extension pgcrypto set schema public;

-- 2. Grant permissions (just in case)
grant usage on schema public to postgres, anon, authenticated, service_role;
grant execute on all functions in schema public to postgres, anon, authenticated, service_role;

-- 3. Verify
select public.gen_salt('bf');

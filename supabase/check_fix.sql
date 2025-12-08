-- CHECK FIX STATUS
-- Run this to confirm pgcrypto is in the right place

-- 1. Check Extension Schema (Should be 'extensions')
select extname, n.nspname as schema_name
from pg_extension e
join pg_namespace n on e.extnamespace = n.oid
where e.extname = 'pgcrypto';

-- 2. Check Search Path for Roles
select rolname, rolconfig 
from pg_roles 
where rolname in ('authenticated', 'anon', 'service_role', 'postgres');

-- 3. Test Crypt Function (Should work without prefix if search_path is correct)
-- If this fails, the search_path is still wrong for the current user.
select public.gen_salt('bf'); -- Should work always
-- select gen_salt('bf'); -- Should work if search_path includes extensions

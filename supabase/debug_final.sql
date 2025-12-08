-- DEEP DEBUG SCRIPT
-- 1. Check Search Path for ALL roles
select rolname, rolconfig 
from pg_roles 
where rolname in ('authenticated', 'anon', 'service_role', 'postgres', 'supabase_admin');

-- 2. Check ALL locations of pgcrypto (Is it installed twice?)
select e.extname, n.nspname as schema_name, e.extversion
from pg_extension e
join pg_namespace n on e.extnamespace = n.oid;

-- 3. Check Permissions on Public Schema
select grantee, privilege_type 
from information_schema.role_usage_grants 
where object_schema = 'public' and object_name = 'gen_salt';

-- 4. Test blindly
select public.gen_salt('bf');
select gen_salt('bf');

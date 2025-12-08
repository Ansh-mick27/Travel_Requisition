-- VERIFY FIX (CORRECTED)
-- 1. This should return 'extensions'
select n.nspname as schema_name
from pg_extension e
join pg_namespace n on e.extnamespace = n.oid
where e.extname = 'pgcrypto';

-- 2. This should WORK now (calling it from 'extensions' schema explicitly)
select extensions.gen_salt('bf'); 

-- 3. If this works, the search_path is active for your current user
select gen_salt('bf');

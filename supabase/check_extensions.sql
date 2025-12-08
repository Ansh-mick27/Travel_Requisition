-- CHECK EXTENSIONS
select extname, n.nspname as schema_name
from pg_extension e
join pg_namespace n on e.extnamespace = n.oid;

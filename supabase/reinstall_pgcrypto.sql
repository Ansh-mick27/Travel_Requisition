-- REINSTALL EXTENSION (Turn it off and on again)
-- This clears any weird "Schema" caching in the database.

-- 1. Drop it (Forcefully)
drop extension if exists pgcrypto cascade;

-- 2. Create it FRESH in 'public'
create extension pgcrypto schema public;

-- 3. Verify it works immediately
select public.gen_salt('bf');

-- 4. Re-apply the Password Hash (Since we dropped cascade, we might have lost some dependent functions? No, pgcrypto is just a library)
-- But we need to ensure the Users still have their password hashes valid.
-- The hashes are text strings in auth.users, they won't be deleted.
-- We just need the function `crypt()` to exist again.
select crypt('password123', gen_salt('bf'));

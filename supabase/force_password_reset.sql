-- FORCE PASSWORD RESET
-- The "Invalid Login" means the Schema Error is GONE.
-- Now we just need to ensure the Password Hash is correct.

-- 1. Verify pgcrypto works
select public.gen_salt('bf'); 

-- 2. Force Reset Password to 'password123'
update auth.users
set encrypted_password = crypt('password123', gen_salt('bf'))
where email = 'anshuloza@gmail.com';

-- 3. Confirm Update
select email, encrypted_password from auth.users where email = 'anshuloza@gmail.com';

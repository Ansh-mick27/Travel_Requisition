-- Reset Password for 'korannekhyati999@gmail.com' to 'password123'

create extension if not exists pgcrypto;

update auth.users
set encrypted_password = crypt('password123', gen_salt('bf'))
where email = 'korannekhyati999@gmail.com';

-- Verify update
select email, updated_at from auth.users where email = 'korannekhyati999@gmail.com';

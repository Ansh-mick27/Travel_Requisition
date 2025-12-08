-- SIMULATE EMAIL CONFIRMATION
-- Since I cannot click the link in your inbox during testing,
-- I am marking your email as "Verified" in the database directly.

update auth.users
set email_confirmed_at = now()
where email = 'anshuloza@gmail.com';

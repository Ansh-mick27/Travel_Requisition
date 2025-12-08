-- CHECK APPROVAL STATUS
-- Diagnosing "Instant Logout". If is_approved is false, the app might be rejecting the session.

select id, email, role, is_approved 
from public.profiles 
where email = 'anshuloza@gmail.com';

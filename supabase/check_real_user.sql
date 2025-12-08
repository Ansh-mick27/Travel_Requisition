-- CHECK REAL USER STATUS
-- Verifying if the manual signup worked and if Profile exists.

select 
    u.email, 
    u.email_confirmed_at,
    p.id as profile_id,
    p.full_name,
    p.role,
    p.is_approved
from auth.users u
left join public.profiles p on u.id = p.id
where u.email = 'anshuloza@gmail.com';

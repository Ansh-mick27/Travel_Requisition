-- FIX MISSING PROFILE (For Manual Signup)
-- Since triggers were disabled, we must create the profile manually.

do $$
declare
    v_user_id uuid;
begin
    -- 1. Get the Auth User ID
    select id into v_user_id from auth.users where email = 'anshuloza@gmail.com';

    if v_user_id is not null then
        -- 2. Insert Profile (if not exists)
        insert into public.profiles (id, full_name, email, role, department, phone_number, is_approved)
        values (v_user_id, 'Real Requester', 'anshuloza@gmail.com', 'requester', 'CSE', '7987613404', true)
        on conflict (id) do update set is_approved = true;
        
        raise notice 'Profile Fixed for anshuloza@gmail.com';
    else
        raise notice 'User not found! Did you sign up?';
    end if;
end $$;

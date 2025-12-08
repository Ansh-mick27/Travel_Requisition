-- DISABLE ALL TRIGGERS (Diagnostic)
-- If Login works after this, we know a Trigger was the culprit.

-- 1. Drop known triggers
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_updated on auth.users;
drop trigger if exists on_profile_created on public.profiles;

-- 2. Drop any other potential triggers on auth.users (Dynamic SQL)
do $$
declare
    trg text;
begin
    for trg in 
        select trigger_name 
        from information_schema.triggers 
        where event_object_schema = 'auth' 
        and event_object_table = 'users'
    loop
        execute format('drop trigger if exists %I on auth.users', trg);
    end loop;
end $$;

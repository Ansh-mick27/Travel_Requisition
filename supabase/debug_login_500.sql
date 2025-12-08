-- DIAGNOSTIC SCRIPT FOR 500 ERROR

-- 1. Check Extensions
select * from pg_extension where extname = 'pgcrypto';

-- 2. List ALL Triggers on auth.users (This is likely the culprit)
select event_object_schema as table_schema,
       event_object_table as table_name,
       trigger_schema,
       trigger_name,
       string_agg(event_manipulation, ',') as event,
       action_timing as activation,
       action_condition as condition,
       action_statement as definition
from information_schema.triggers
where event_object_table = 'users'
group by 1,2,3,4,6,7,8;

-- 3. Check if the user exists
select id, email, encrypted_password, email_confirmed_at from auth.users where email = 'test_req@example.com';

-- 4. SIMULATE LOGIN (Update last_sign_in_at)
-- This is what Supabase does on login. If this fails here, we found the bug.
do $$
declare
    v_user_id uuid;
begin
    select id into v_user_id from auth.users where email = 'test_req@example.com';
    
    if v_user_id is not null then
        update auth.users set last_sign_in_at = now() where id = v_user_id;
        raise notice 'Update successful - Login should work';
    else
        raise notice 'User not found';
    end if;
end $$;

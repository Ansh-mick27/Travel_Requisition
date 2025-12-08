-- RESTORE TRIGGERS
-- This re-enables the automatic creation of Profiles during Signup.

-- 1. Create the Function to Handle New Users
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, department, phone_number, is_approved)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'requester'), -- Use selected role or default
    new.raw_user_meta_data->>'department',
    coalesce(new.raw_user_meta_data->>'phone_number', '7987613404'), -- Use input phone or default
    false -- Approval Status (Default: false, wait for admin)
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create the Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Ensure Permissions
grant execute on function public.handle_new_user() to postgres, anon, authenticated, service_role;

-- 4. Verify
select trigger_name 
from information_schema.triggers 
where event_object_schema = 'auth' 
and event_object_table = 'users'
and trigger_name = 'on_auth_user_created';

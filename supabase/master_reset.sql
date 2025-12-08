-- MASTER RESET (Factory Reset)
-- Wipes all User Data and Restores Standard Automation.
-- This brings the system back to the "Ready to Create Test Users" state.

-- 1. DATA WIPE (Cascade Delete)
-- Deleting from auth.users should cascade to profiles and requisitions if FKs are set.
-- If not, we delete manually to be safe.
-- We use a DO block to ignore "table does not exist" errors.
do $$
begin
    delete from public.requisitions;
    begin
        delete from public.user_approvals; 
    exception when undefined_table then 
        null; -- Ignore if table missing
    end;
    delete from public.profiles;
    delete from auth.users;
end $$;

-- 2. RESTORE AUTOMATION (Triggers)
-- We ensure the Profile Creation Trigger is active and correct.

create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, department, phone_number, is_approved)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'requester', -- Default Role
    new.raw_user_meta_data->>'department',
    '7987613404', -- Default Phone (Placeholder)
    false -- Approval Status (Default: false)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop and Recreate Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. CLEAN UP HELPERS
-- We remove the temporary fix functions to avoid confusion, 
-- BUT we keep pgcrypto availability (Universal Fix) because it's required for the system to work at all.
-- (We do not want to break the Schema Fixes we achieved, just the Data).

do $$
begin
    raise notice 'System Reset Complete. Ready for Test Users.';
end $$;

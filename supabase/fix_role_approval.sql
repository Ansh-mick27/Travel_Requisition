-- FIX RLS & TRIGGER (Role + Approval)

-- 1. FIX TRIGGER (Ensure Role is Captured)
-- We enforce the role from metadata.
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (
    id, full_name, email, role, department, phone_number, is_approved
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    -- Force lowercase and default to requester if active override missing
    lower(coalesce(new.raw_user_meta_data->>'role', 'requester')), 
    new.raw_user_meta_data->>'department',
    coalesce(new.raw_user_meta_data->>'phone_number', '7987613404'),
    false
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. FIX RLS (Allow Admins to Update Profiles)
-- This fixes the "Approval not saving" issue.
alter table public.profiles enable row level security;

-- Policy: Admin can update ANY profile
drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
on public.profiles
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Policy: Users can update their own profile (optional but good)
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ( id = auth.uid() );

-- Policy: Public/Auth can read profiles (needed for fetching list)
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
on public.profiles
for select
to authenticated
using ( true );

do $$
begin
    raise notice 'Fixed RLS and Trigger.';
end $$;

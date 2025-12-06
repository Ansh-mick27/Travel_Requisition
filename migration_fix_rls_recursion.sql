-- Fix Infinite Recursion in RLS

-- 1. Create a helper function to check admin status
-- SECURITY DEFINER ensures this runs with owner privileges, bypassing RLS recursion
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 2. Drop the problematic policies (if they exist)
drop policy if exists "Admins can update users" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;

-- 3. Re-create policies using the safe function
create policy "Admins can update users"
on public.profiles
for update
using ( is_admin() );

create policy "Admins can view all profiles"
on public.profiles
for select
using ( is_admin() );

-- Ensure basic read access for users to see their OWN profile is preserved (usually covered by other policies, but good to ensure)
create policy "Users can see own profile"
on public.profiles
for select
using ( auth.uid() = id );

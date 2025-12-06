-- Allow Admins to update any profile
-- (Use a subquery to check if the executing user has role 'admin')

create policy "Admins can update users"
on public.profiles
for update
using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- Also ensure they can Select (Read) all profiles (usually true, but good to be safe)
create policy "Admins can view all profiles"
on public.profiles
for select
using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- Ensure RLS is enabled
alter table public.profiles enable row level security;

-- Fix RLS policies for vehicles table
-- Allow admins to insert, update, and delete vehicles

-- Drop existing policies if they exist
drop policy if exists "Admins can insert vehicles" on vehicles;
drop policy if exists "Admins can update vehicles" on vehicles;
drop policy if exists "Admins can delete vehicles" on vehicles;

-- Create new policies for admin operations
create policy "Admins can insert vehicles" 
on vehicles for insert 
to authenticated
with check (
  exists (
    select 1 from profiles 
    where profiles.id = auth.uid() 
    and profiles.role = 'admin'
  )
);

create policy "Admins can update vehicles" 
on vehicles for update 
to authenticated
using (
  exists (
    select 1 from profiles 
    where profiles.id = auth.uid() 
    and profiles.role = 'admin'
  )
);

create policy "Admins can delete vehicles" 
on vehicles for delete 
to authenticated
using (
  exists (
    select 1 from profiles 
    where profiles.id = auth.uid() 
    and profiles.role = 'admin'
  )
);

-- Also add policies for drivers table while we're at it
drop policy if exists "Admins can insert drivers" on drivers;
drop policy if exists "Admins can update drivers" on drivers;
drop policy if exists "Admins can delete drivers" on drivers;

create policy "Admins can insert drivers" 
on drivers for insert 
to authenticated
with check (
  exists (
    select 1 from profiles 
    where profiles.id = auth.uid() 
    and profiles.role = 'admin'
  )
);

create policy "Admins can update drivers" 
on drivers for update 
to authenticated
using (
  exists (
    select 1 from profiles 
    where profiles.id = auth.uid() 
    and profiles.role = 'admin'
  )
);

create policy "Admins can delete drivers" 
on drivers for delete 
to authenticated
using (
  exists (
    select 1 from profiles 
    where profiles.id = auth.uid() 
    and profiles.role = 'admin'
  )
);

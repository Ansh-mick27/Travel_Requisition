-- REPAIR HOD DATA & FIX APPROVALS

-- 1. Fix the HOD Account (anshulmickey@gmail.com)
-- Set Role to 'HOD' (was stuck as Requester)
-- Approve the user (so they disappear from the list)
-- Reset Phone Number (User can edit it in Profile later, or we set to NULL)
update public.profiles
set 
    role = 'hod',
    is_approved = true,
    phone_number = null -- Clearing the "messy" hardcoded number so they can set it fresh.
where email = 'anshulmickey@gmail.com';

-- 2. Sync Auth Metadata (Best Practice)
update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role": "hod"}'::jsonb
where email = 'anshulmickey@gmail.com';

-- 3. CONFIRM RLS IS FIXED (Re-applying the Policy just in case)
-- This ensures the "Approve" button works for future users.
alter table public.profiles enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies 
        where policyname = 'Admins can update any profile' 
        and tablename = 'profiles'
    ) then
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
    end if;
end $$;

do $$
begin
    raise notice 'HOD Repaired and RLS Verified.';
end $$;

-- FIX TRIGGER TYPE MISMATCH
-- The previous trigger failed because it tried to insert 'text' into a 'user_role' enum column.

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
    -- CAST text to user_role enum
    lower(coalesce(new.raw_user_meta_data->>'role', 'requester'))::public.user_role, 
    new.raw_user_meta_data->>'department',
    coalesce(new.raw_user_meta_data->>'phone_number', '7987613404'),
    -- Auto-approve if HOD or Admin (for seeding purposes)
    case 
        when (new.raw_user_meta_data->>'role')::text = 'hod' then true 
        when (new.raw_user_meta_data->>'role')::text = 'admin' then true 
        else false 
    end
  );
  return new;
end;
$$ language plpgsql security definer;

DO $$
BEGIN
    RAISE NOTICE 'Fixed handle_new_user trigger with correct type casting.';
END $$;

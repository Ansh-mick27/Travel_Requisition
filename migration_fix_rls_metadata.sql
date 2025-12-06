-- ROBUST RLS FIX: Use User Metadata for Role Checks
-- This avoids querying the profiles table in policies, preventing recursion.

-- 1. Sync existing roles from profiles to auth.users metadata
-- This ensures all current users have their role in metadata
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id, role FROM public.profiles LOOP
    UPDATE auth.users
    SET raw_user_meta_data = 
      COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', user_record.role)
    WHERE id = user_record.id;
  END LOOP;
END;
$$;

-- 2. Create a trigger to keep metadata in sync when profiles.role changes
CREATE OR REPLACE FUNCTION public.sync_role_to_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_role_change ON public.profiles;
CREATE TRIGGER on_profile_role_change
AFTER UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_role_to_metadata();

-- 3. Drop old recursive policies
DROP POLICY IF EXISTS "Admins can update users" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;

-- 4. Create new, safe policies using Metadata
-- Check metadata for 'admin' role. No table access needed!
CREATE POLICY "Admins can update users"
ON public.profiles
FOR UPDATE
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Basic self-view policy
CREATE POLICY "Users can see own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
);

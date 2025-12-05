-- 1. Add is_approved column to profiles (default to false for new users, true for existing to avoid lockout)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;

-- 2. Update existing users to be approved (so you don't get locked out!)
UPDATE public.profiles SET is_approved = true WHERE is_approved IS NULL;

-- 3. Update the handle_new_user function to capture metadata from SignUp
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    role, 
    full_name,
    department, 
    college_name, 
    hod_name, 
    director_name,
    is_approved
  )
  VALUES (
    new.id, 
    new.email, 
    'requester', -- Default role is always requester
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'college_name',
    new.raw_user_meta_data->>'hod_name',
    new.raw_user_meta_data->>'director_name',
    false -- New users must be approved
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

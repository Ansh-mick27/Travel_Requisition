-- Enable pgcrypto for password hashing
create extension if not exists pgcrypto;

-- Helper function to create users easily
-- NOTE: We use a trusted PL/pgSQL function to insert into auth.users (which is usually restricted)
-- You must run this in the Supabase SQL Editor.

-- 1. Create a function to seed user
create or replace function public.seed_user(
    _email text, 
    _password text, 
    _full_name text, 
    _role user_role,
    _department text,
    _college text
)
returns void as $$
declare
  new_id uuid;
begin
  -- Check if user exists
  if exists (select 1 from auth.users where email = _email) then
     -- Update existing user to ensure password and metadata are correct
     UPDATE auth.users
     SET encrypted_password = crypt(_password, gen_salt('bf')),
         raw_user_meta_data = jsonb_build_object('full_name', _full_name, 'department', _department, 'college', _college),
         email_confirmed_at = COALESCE(email_confirmed_at, now())
     WHERE email = _email;
     
     -- Also ensure profile is correct
     UPDATE public.profiles
     SET role = _role,
         is_approved = true,
         full_name = _full_name,
         department = _department,
         college_name = _college
     WHERE email = _email;
     
     return;
  end if;

  -- Generate ID
  new_id := gen_random_uuid();

  -- Insert into auth.users
  insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  values (
    new_id,
    _email,
    crypt(_password, gen_salt('bf')),
    now(),
    jsonb_build_object('full_name', _full_name, 'department', _department, 'college', _college)
  );

  -- Insert into public.profiles (Trigger usually handles this, but since we are seeding manually and bypassing normal flow, let's be safe)
  -- Actually, the handle_new_user trigger MIGHT fire. Let's rely on it OR insert manually if it doesn't.
  -- But wait, our handle_new_user trigger sets is_approved=false. We want these to be TRUE.
  -- So we should insert manually or update immediately.
  
  -- Let's try inserting manual profile to ensure correctness.
  INSERT INTO public.profiles (
    id, email, role, full_name, department, college_name, is_approved
  )
  VALUES (
    new_id, _email, _role, _full_name, _department, _college, true
  )
  ON CONFLICT (id) DO UPDATE 
  SET is_approved = true, role = _role;
  
end;
$$ language plpgsql security definer;

-- 2. Seed the Users
-- Acropolis Institute of Management Studies and Research
select public.seed_user('principalaimsr@acropolis.in', 'Password@123', 'Dr. Rajesh Chaba', 'hod', 'Director', 'Acropolis Institute of Management Studies and Research');
select public.seed_user('anantgwal@acropolis.in', 'Password@123', 'Dr. Anant Gwal', 'hod', 'Department Of Business Administration', 'Acropolis Institute of Management Studies and Research');
select public.seed_user('pranotibelapurkar@acropolis.in', 'Password@123', 'Dr. Pranoti Belapurkar', 'hod', 'Department Of Biosciences', 'Acropolis Institute of Management Studies and Research');
select public.seed_user('smritijain@acropolis.in', 'Password@123', 'Dr. Smriti Jain', 'hod', 'Department Of Computer Science', 'Acropolis Institute of Management Studies and Research');
select public.seed_user('sonalijain@acropolis.in', 'Password@123', 'Dr. Sonali Jain', 'hod', 'Department Of Commerce', 'Acropolis Institute of Management Studies and Research');
select public.seed_user('poonam.singh@acropolis.in', 'Password@123', 'Dr. Poonam Singh', 'hod', 'Department of Humanities', 'Acropolis Institute of Management Studies and Research');

-- Acropolis Faculty of Management & Research
select public.seed_user('tarunkushwaha@acropolis.in', 'Password@123', 'Dr. Tarun Kushwaha', 'hod', 'Management', 'Acropolis Faculty of Management & Research');

-- Acropolis Institute of Law
select public.seed_user('principalail@acropolis.in', 'Password@123', 'Dr. Geetanjali Chandra', 'hod', 'Law', 'Acropolis Institute of Law');

-- Acropolis Institute of Pharmaceutical Education and Research
select public.seed_user('principalaiper@acropolis.in', 'Password@123', 'Dr. G.N. Darwhekar', 'hod', 'Pharmacy', 'Acropolis Institute of Pharmaceutical Education and Research');

-- Acropolis Institute of Technology and Research
select public.seed_user('directoraitr@acropolis.in', 'Password@123', 'Dr. S C SHARMA', 'hod', 'Director', 'Acropolis Institute of Technology and Research');
select public.seed_user('hodcs@acropolis.in', 'Password@123', 'Dr. Kamal K Sethi', 'hod', 'CSE', 'Acropolis Institute of Technology and Research');
select public.seed_user('hodcsit@acropolis.in', 'Password@123', 'Dr. Shilpa Bhalerao', 'hod', 'CSIT & CY', 'Acropolis Institute of Technology and Research');
select public.seed_user('hodit@acropolis.in', 'Password@123', 'Dr.(Prof.) Prashant Lakkadwala', 'hod', 'IT & DS', 'Acropolis Institute of Technology and Research');
select public.seed_user('hodaiml@acropolis.in', 'Password@123', 'Dr. Namrata Tapaswi', 'hod', 'AIML', 'Acropolis Institute of Technology and Research');
select public.seed_user('hodce@acropolis.in', 'Password@123', 'Dr. S.K. Sharma', 'hod', 'Civil', 'Acropolis Institute of Technology and Research');
select public.seed_user('hemantmarmat@acropolis.in', 'Password@123', 'Dr. Hemant Marmat', 'hod', 'MECH', 'Acropolis Institute of Technology and Research');
select public.seed_user('hodec@acropolis.in', 'Password@123', 'Dr. U. B. S Chandrawat', 'hod', 'EC&VLSI&ACT', 'Acropolis Institute of Technology and Research');
select public.seed_user('hodfca@acropolis.in', 'Password@123', 'Dr. Geeta Santhosh', 'hod', 'FCA', 'Acropolis Institute of Technology and Research');
select public.seed_user('prashantgeete@acropolis.in', 'Password@123', 'Dr. Prashant Geete', 'hod', 'First Year', 'Acropolis Institute of Technology and Research');
select public.seed_user('atul@acropolis.in', 'Password@123', 'Mr. Atul N Bharat', 'hod', 'Placement', 'Acropolis Institute of Technology and Research');

-- Cleanup function
drop function public.seed_user;

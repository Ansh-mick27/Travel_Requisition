-- Add new columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS college_name text DEFAULT 'Acropolis Institute',
ADD COLUMN IF NOT EXISTS hod_name text,
ADD COLUMN IF NOT EXISTS director_name text;

-- Update existing profiles with dummy data for testing
UPDATE public.profiles
SET 
  full_name = 'Anshul Verma',
  college_name = 'Acropolis Institute of Technology and Research',
  hod_name = 'Dr. S. C. Sharma',
  director_name = 'Dr. Jayantilal Bhandari',
  department = 'Computer Science'
WHERE email = 'anshulverma2024@gmail.com'; -- Replace with your actual email if different, or remove WHERE to update all

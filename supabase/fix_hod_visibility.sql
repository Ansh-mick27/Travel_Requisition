-- 1. Align Departments (So frontend filter works)
-- We set both "Requester" and "HOD" to the same department: 'Computer Science'
UPDATE public.profiles
SET department = 'Computer Science'
WHERE email IN ('anshuloza@gmail.com', 'anshulmickey@gmail.com');

-- 2. Enable RLS on Requisitions (if not already)
ALTER TABLE public.requisitions ENABLE ROW LEVEL SECURITY;

-- 3. Allow HODs and Admins to VIEW ALL Requisitions
DROP POLICY IF EXISTS "HODs and Admins can view all requisitions" ON public.requisitions;

CREATE POLICY "HODs and Admins can view all requisitions"
ON public.requisitions
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role IN ('hod', 'admin')
  )
);

-- 4. Allow HODs and Admins to UPDATE Requisitions (Approve/Reject)
DROP POLICY IF EXISTS "HODs and Admins can update requisitions" ON public.requisitions;

CREATE POLICY "HODs and Admins can update requisitions"
ON public.requisitions
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role IN ('hod', 'admin')
  )
);

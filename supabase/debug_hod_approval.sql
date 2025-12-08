-- Check latest requisition
SELECT * FROM public.requisitions ORDER BY created_at DESC LIMIT 1;

-- Check HOD user details (anshulmickey@gmail.com)
SELECT * FROM public.profiles WHERE email = 'anshulmickey@gmail.com';

-- Check RLS policies on requisitions
select * from pg_policies where tablename = 'requisitions';

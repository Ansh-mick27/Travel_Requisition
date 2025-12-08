-- 1. DELETE All Requisitions (Test Requests)
DELETE FROM public.requisitions;

-- 2. DELETE Test HOD Profile
DELETE FROM public.profiles WHERE email = 'anshulmickey@gmail.com';

-- 3. DELETE Test Requester
DELETE FROM public.profiles WHERE email = 'anshuloza@gmail.com';

DO $$
BEGIN
    RAISE NOTICE 'Cleanup Complete. All test data deleted.';
END $$;

DO $$
BEGIN
    RAISE NOTICE '--- CONSTRAINTS ---';
END $$;

SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.requisitions'::regclass;

DO $$
BEGIN
    RAISE NOTICE '--- TRIGGERS ---';
END $$;

SELECT tgname, pg_get_triggerdef(oid)
FROM pg_trigger
WHERE tgrelid = 'public.requisitions'::regclass;

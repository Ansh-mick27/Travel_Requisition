DO $$
BEGIN
    -- 1. Drop the incorrect Foreign Key (referencing profiles)
    -- We use IF EXISTS to avoid errors if it was already fixed or named differently
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'requisitions_assigned_driver_id_fkey'
    ) THEN
        ALTER TABLE public.requisitions DROP CONSTRAINT requisitions_assigned_driver_id_fkey;
        RAISE NOTICE 'Dropped incorrect FK constraint.';
    END IF;

    -- 2. Add the correct Foreign Key (referencing drivers)
    ALTER TABLE public.requisitions
    ADD CONSTRAINT requisitions_assigned_driver_id_fkey
    FOREIGN KEY (assigned_driver_id)
    REFERENCES public.drivers (id);
    
    RAISE NOTICE 'Fixed: assigned_driver_id now references public.drivers correctly.';
END $$;

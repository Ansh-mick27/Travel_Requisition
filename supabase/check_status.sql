SELECT 
    id, 
    status, 
    pickup_date, 
    assigned_vehicle_id, 
    assigned_driver_id, 
    admin_id,
    hod_id,
    admin_remarks
FROM public.requisitions 
ORDER BY created_at DESC 
LIMIT 1;

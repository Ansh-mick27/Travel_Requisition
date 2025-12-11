CREATE OR REPLACE FUNCTION get_active_available_vehicles(
    query_date DATE,
    query_start_time TIME,
    query_end_time TIME
)
RETURNS SETOF vehicles
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT v.*
    FROM vehicles v
    WHERE v.status = 'active'
    AND NOT EXISTS (
        SELECT 1
        FROM requisitions r
        WHERE r.assigned_vehicle_id = v.id
        AND r.status = 'approved'
        AND r.pickup_date = query_date
        -- Overlap logic: (StartA < EndB) AND (EndA > StartB)
        AND (
            (r.pickup_time::TIME < query_end_time) AND
            (r.drop_time::TIME > query_start_time)
        )
    );
END;
$$;

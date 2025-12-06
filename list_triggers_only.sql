-- LIST ACTIVE TRIGGERS
-- Run this in Supabase SQL Editor

SELECT 
    event_object_schema as schema,
    event_object_table as table,
    trigger_name
FROM information_schema.triggers
WHERE event_object_table IN ('users', 'profiles');

-- Inspect Foreign Keys
SELECT 
    'Foreign Key' as type,
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_name AS referenced_table
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'requisitions' AND tc.constraint_type = 'FOREIGN KEY'

UNION ALL

-- Inspect Unique Constraints
SELECT 
    'Unique Constraint' as type,
    tc.constraint_name,
    kcu.column_name,
    'N/A' as referenced_table
FROM 
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'requisitions' AND tc.constraint_type = 'UNIQUE';

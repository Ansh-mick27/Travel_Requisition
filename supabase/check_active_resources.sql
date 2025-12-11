-- Check Active Vehicles
SELECT count(*) as active_vehicles FROM vehicles WHERE status = 'active';
SELECT * FROM vehicles WHERE status = 'active' LIMIT 5;

-- Check Active Drivers
SELECT count(*) as active_drivers FROM drivers WHERE status = 'active';
SELECT * FROM drivers WHERE status = 'active' LIMIT 5;

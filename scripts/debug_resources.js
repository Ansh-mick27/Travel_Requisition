const { createClient } = require('@supabase/supabase-js');

const url = 'https://fhdhweeenabekekmhudu.supabase.co';
const key = 'sb_publishable_DmWEYKAmBo8CFTz8EXxwfQ_rH3jJGCX';
const supabase = createClient(url, key);

async function check() {
    console.log('--- DB RESOURCE CHECK ---');

    // 1. Check Vehicles
    console.log('\nFetching Vehicles...');
    const { data: vehicles, error: vError } = await supabase.from('vehicles').select('*');

    if (vError) {
        console.error('SERVER ERROR (Vehicles):', vError.message);
    } else {
        const activeVehicles = vehicles.filter(v => v.status === 'active');
        console.log(`Total Vehicles: ${vehicles.length}`);
        console.log(`Active Vehicles: ${activeVehicles.length}`);
        if (activeVehicles.length === 0 && vehicles.length > 0) {
            console.log('[WARN] Vehicles exist but none are active!');
        }
        if (vehicles.length > 0) {
            console.table(vehicles.map(v => ({ id: v.id, name: v.name, status: v.status })));
        }
    }

    // 2. Check Drivers
    console.log('\nFetching Drivers...');
    const { data: drivers, error: dError } = await supabase.from('drivers').select('*');

    if (dError) {
        console.error('SERVER ERROR (Drivers):', dError.message);
    } else {
        const activeDrivers = drivers.filter(d => d.status === 'active');
        console.log(`Total Drivers: ${drivers.length}`);
        console.log(`Active Drivers: ${activeDrivers.length}`);
        if (activeDrivers.length === 0 && drivers.length > 0) {
            console.log('[WARN] Drivers exist but none are active!');
        }
        if (drivers.length > 0) {
            console.table(drivers.map(d => ({ id: d.id, name: d.full_name, status: d.status })));
        }
    }
}

check();


const { createClient } = require('@supabase/supabase-js');

// Config
const SUPABASE_URL = 'https://fhdhweeenabekekmhudu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DmWEYKAmBo8CFTz8EXxwfQ_rH3jJGCX';

// MOCK CONSTANTS FROM APP
const request = {
    pickup_date: '2025-12-11', // Assuming Today (based on prompt time)
    pickup_time: '10:00:00', // Past
    drop_time: '12:00:00'    // Past
};

// We will fetch a vehicle that we KNOW is busy during 10-12 (from previous conversations, Bolero 2 or similar)
// Or just fetch ALL active vehicles and their conflicts for today.

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const parseDateTime = (dateStr, timeStr) => {
    try {
        const [y, m, d] = dateStr.split('-').map(Number);
        const timeParts = timeStr.split(':');
        const hours = Number(timeParts[0]);
        const minutes = Number(timeParts[1]);
        const seconds = timeParts[2] ? Number(timeParts[2]) : 0;
        return new Date(y, m - 1, d, hours, minutes, seconds);
    } catch (e) {
        return new Date(`${dateStr}T${timeStr}`);
    }
};

async function runDebug() {
    // 1. Authenticate (using HOD credentials to read everything)
    const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'directoraitr@acropolis.in',
        password: 'Password@123'
    });

    if (authError) {
        console.error('Auth Error:', authError);
        return;
    }

    console.log('Authenticated as:', session.user.email);

    // 2. Fetch Vehicles
    const { data: allVehicles } = await supabase.from('vehicles').select('*').eq('status', 'active');
    console.log(`Found ${allVehicles.length} active vehicles.`);

    // 3. Fetch Conflicts for Today
    const { data: conflicts } = await supabase
        .from('requisitions')
        .select('id, assigned_vehicle_id, pickup_time, drop_time')
        .eq('status', 'approved')
        .eq('pickup_date', request.pickup_date);

    console.log(`Found ${conflicts.length} approved bookings for ${request.pickup_date}.`);

    // 4. Run Logic
    let reqStart = parseDateTime(request.pickup_date, request.pickup_time);
    const reqEnd = parseDateTime(request.pickup_date, request.drop_time);

    // Simulate "Now" as being LATER in the day (e.g. 19:30)
    // NOTE: In the script, new Date() is the actual current time.
    const now = new Date();
    const isToday = reqStart.toDateString() === now.toDateString();

    console.log('\n--- INPUTS ---');
    console.log('Request Original Start:', reqStart.toLocaleString());
    console.log('Request End:', reqEnd.toLocaleString());
    console.log('Current Time (Now):', now.toLocaleString());
    console.log('Is Today?', isToday);

    // PRAGMATIC START LOGIC
    if (isToday && reqStart < now) {
        console.log('>> Pragmatic Start Applied: reqStart moved to Now');
        reqStart = now;
    }

    console.log('Effective Request Start:', reqStart.toLocaleString());

    // CHECK AVAILABILITY
    allVehicles.forEach(v => {
        console.log(`\nChecking Vehicle: ${v.name} (${v.id})`);

        const vehicleConflicts = conflicts.filter(c => c.assigned_vehicle_id === v.id);

        if (vehicleConflicts.length === 0) {
            console.log('  -> No bookings today. AVAILABLE.');
            return;
        }

        const hasConflict = vehicleConflicts.some(booking => {
            const existingStart = parseDateTime(request.pickup_date, booking.pickup_time);
            const existingEnd = parseDateTime(request.pickup_date, booking.drop_time);

            console.log(`  -> Booking ${booking.id}: ${booking.pickup_time} - ${booking.drop_time}`);
            console.log(`     (${existingStart.toLocaleString()} - ${existingEnd.toLocaleString()})`);

            // Check Overlap
            const isOverlap = (reqStart < existingEnd) && (reqEnd > existingStart);
            console.log(`     Overlap Check: (${reqStart.toLocaleTimeString()} < ${existingEnd.toLocaleTimeString()}) && (${reqEnd.toLocaleTimeString()} > ${existingStart.toLocaleTimeString()})`);
            console.log(`     Result: ${isOverlap}`);

            return isOverlap;
        });

        if (hasConflict) {
            console.log('  -> STATUS: BUSY ❌');
        } else {
            console.log('  -> STATUS: AVAILABLE ✅');
        }
    });

}

runDebug();

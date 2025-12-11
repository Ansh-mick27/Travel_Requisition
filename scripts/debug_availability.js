const { createClient } = require('@supabase/supabase-js');

const url = 'https://fhdhweeenabekekmhudu.supabase.co';
const key = 'sb_publishable_DmWEYKAmBo8CFTz8EXxwfQ_rH3jJGCX';
const supabase = createClient(url, key);

async function inspect() {
    console.log('--- Logging In ---');
    // Using credentials from hod_credentials.md
    const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
        email: 'directoraitr@acropolis.in',
        password: 'Password@123'
    });

    if (authError) {
        console.error('Login Failed:', authError.message);
        return;
    }

    console.log('--- Fetching Recent Requisitions ---');

    // Fetch last 10 requisitions
    const { data, error } = await supabase
        .from('requisitions')
        .select('id, pickup_date, pickup_time, drop_time, status, assigned_vehicle_id, vehicles(name)')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error(error);
        return;
    }

    console.log(JSON.stringify(data, null, 2));

    if (data && data.length > 0) {
        const boleroBooking = data.find(r => r.assigned_vehicle_id && r.vehicles && r.vehicles.name && r.vehicles.name.toLowerCase().includes('bolero'));

        if (boleroBooking) {
            console.log('\n--- Simulating Conflict Check for ' + boleroBooking.vehicles.name + ' ---');
            console.log('Existing Booking ID:', boleroBooking.id);
            console.log('Existing Time:', boleroBooking.pickup_time, 'to', boleroBooking.drop_time);
            console.log('Existing Date:', boleroBooking.pickup_date);

            // Current Time Request (e.g. Now)
            const now = new Date();
            const reqTimeStr = now.toLocaleTimeString('en-US', { hour12: false });

            console.log('\nScenario: User trying to book NOW (' + reqTimeStr + ')');

            // Logic from app/approval/[id].tsx
            const reqStart = new Date(`1970-01-01T${reqTimeStr}`);
            const reqEnd = new Date(reqStart.getTime() + 60 * 60 * 1000); // 1 hour duration

            const existingStart = new Date(`1970-01-01T${boleroBooking.pickup_time}`);
            const existingEnd = new Date(`1970-01-01T${boleroBooking.drop_time}`);

            console.log('Request Start (Parsed):', reqStart.toString());
            console.log('Request End (Parsed):  ', reqEnd.toString());
            console.log('Existing Start (Parsed):', existingStart.toString());
            console.log('Existing End (Parsed):  ', existingEnd.toString());

            const overlap = (reqStart < existingEnd) && (reqEnd > existingStart);
            console.log('Overlap Result (Should be false if now > drop_time):', overlap);

            // Debugging values
            console.log('Checking logic:');
            console.log(reqStart.getTime(), '<', existingEnd.getTime(), 'Result:', reqStart < existingEnd);
            console.log(reqEnd.getTime(), '>', existingStart.getTime(), 'Result:', reqEnd > existingStart);
        } else {
            console.log('No Bolero booking found in recent 10 records.');
        }
    }
}

inspect();

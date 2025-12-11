const { createClient } = require('@supabase/supabase-js');

const url = 'https://fhdhweeenabekekmhudu.supabase.co';
const key = 'sb_publishable_DmWEYKAmBo8CFTz8EXxwfQ_rH3jJGCX';
const supabase = createClient(url, key);

async function check() {
    console.log('--- Logging In ---');
    await supabase.auth.signInWithPassword({
        email: 'directoraitr@acropolis.in',
        password: 'Password@123'
    });

    console.log('--- CHECKING SCHEMA ---');
    // Since I can't query information_schema easily via client without RPC,
    // I will check the data type of the returned value from a SELECT.
    // JS client returns strings for Time/Date/Text.

    const { data, error } = await supabase.from('requisitions').select('pickup_time').limit(1);
    if (data && data.length > 0) {
        console.log('Value:', data[0].pickup_time);
        // We can infer if it's 24h or 12h formatted string
    }
}
check();

const { createClient } = require('@supabase/supabase-js');

const url = 'https://fhdhweeenabekekmhudu.supabase.co';
const key = 'sb_publishable_DmWEYKAmBo8CFTz8EXxwfQ_rH3jJGCX';
const supabase = createClient(url, key);

async function inspectPending() {
    console.log('--- Logging In ---');
    const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
        email: 'directoraitr@acropolis.in',
        password: 'Password@123'
    });

    if (authError) {
        console.error('Login Failed:', authError); // Should handle object now
        return;
    }

    console.log('--- Fetching Pending Requisitions ---');

    const { data, error } = await supabase
        .from('requisitions')
        .select('id, pickup_date, pickup_time, drop_time, status')
        // Status might be pending_admin or pending_hod
        .in('status', ['pending_admin', 'pending_hod'])
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error(error);
        return;
    }

    console.log(JSON.stringify(data, null, 2));
}

inspectPending();

const { createClient } = require('@supabase/supabase-js');

const url = 'https://fhdhweeenabekekmhudu.supabase.co';
const key = 'sb_publishable_DmWEYKAmBo8CFTz8EXxwfQ_rH3jJGCX';
const supabase = createClient(url, key);

async function check() {
    console.log('--- CHECKING SCHEMA ---');

    const { data, error } = await supabase.rpc('run_sql_query', {
        query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'requisitions'"
    }); // Note: This assumes I have a general SQL runner RPC, which I might not.

    // Alternative: Using a dummy query if I don't have direct SQL access
    // But wait, I have direct DB access via the user? No, I am the agent.
    // The user probably doesn't have a 'run_sql_query' RPC.
    // I should just insert a row and see the error? No.

    // Better approach: Just inspect via a select from 'requisitions' limit 1 and check types of returned object

    const { data: rows, error: rError } = await supabase.from('requisitions').select('*').limit(1);
    if (rError) {
        console.error(rError);
    } else if (rows.length > 0) {
        console.log('Row Sample:', rows[0]);
        console.log('Type of pickup_time:', typeof rows[0].pickup_time);
    } else {
        console.log('No rows found to inspect.');
    }
}

check();

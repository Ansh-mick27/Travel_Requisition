const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Load environment variables from .env

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log('Attempting login for: atul.bharat@acropolis.in');

    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'atul.bharat@acropolis.in',
        password: 'Password@123',
    });

    if (error) {
        console.error('Login Failed:', error.status, error.message);
        console.error('Full Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('Login SUCCESS!');
        console.log('User ID:', data.user.id);
        console.log('Access Token:', data.session.access_token.substring(0, 20) + '...');
    }
}

testLogin();

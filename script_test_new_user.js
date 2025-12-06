const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewUser() {
    const email = `test_entry_${Date.now()}@acropolis.in`;
    const password = 'TestPassword123!';

    console.log(`Creating user: ${email}`);

    // 1. Sign Up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Test User',
                role: 'requester'
            }
        }
    });

    if (signUpError) {
        console.error('Sign Up Failed:', signUpError);
        return;
    }
    console.log('Sign Up Success:', signUpData.user?.id);

    // 2. Sign In
    console.log('Attempting Login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError) {
        console.error('Sign In Failed:', signInError);
    } else {
        console.log('Sign In SUCCESS!');
        console.log('Token:', signInData.session.access_token.substring(0, 20) + '...');
    }
}

testNewUser();

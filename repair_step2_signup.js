const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

async function signUpHOD() {
    const email = 'atul@acropolis.in';
    const password = 'Password@123';

    console.log(`Signing Up Cleanly: ${email}`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Mr. Atul N Bharat',
                role: 'hod', // This might be ignored by RLS/Trigger, but we set it anyway
                department: 'Placement',
                college: 'Acropolis Institute of Technology and Research'
            }
        }
    });

    if (error) {
        console.error('Sign Up Failed:', error);
    } else {
        console.log('Sign Up SUCCESS. User ID:', data.user?.id);
        console.log('User is likely unconfirmed. Run Step 3 SQL to fix.');
    }
}

signUpHOD();

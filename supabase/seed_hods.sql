-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    new_user_id uuid;
    hod_record record;
BEGIN
    FOR hod_record IN 
        SELECT * FROM (VALUES 
            ('principalaimsr@acropolis.in', 'Dr. Rajesh Chaba', 'AIMSR', 'Director'),
            ('anantgwal@acropolis.in', 'Dr. Anant Gwal', 'AIMSR', 'Business Admin'),
            ('pranotibelapurkar@acropolis.in', 'Dr. Pranoti Belapurkar', 'AIMSR', 'Biosciences'),
            ('smritijain@acropolis.in', 'Dr. Smriti Jain', 'AIMSR', 'Computer Science'),
            ('sonalijain@acropolis.in', 'Dr. Sonali Jain', 'AIMSR', 'Commerce'),
            ('poonam.singh@acropolis.in', 'Dr. Poonam Singh', 'AIMSR', 'Humanities'),
            ('tarunkushwaha@acropolis.in', 'Dr. Tarun Kushwaha', 'AFMR', 'Director/HOD'),
            ('principalail@acropolis.in', 'Dr. Geetanjali Chandra', 'AIL', 'Director/HOD'),
            ('principalaiper@acropolis.in', 'Dr. G.N. Darwhekar', 'AIPER', 'Director/HOD'),
            ('directoraitr@acropolis.in', 'Dr. S C SHARMA', 'AITR', 'Director'),
            ('hodcs@acropolis.in', 'Dr. Kamal K Sethi', 'AITR', 'CSE'),
            ('hodcsit@acropolis.in', 'Dr. Shilpa Bhalerao', 'AITR', 'CSIT & CY'),
            ('hodit@acropolis.in', 'Dr.(Prof.) Prashant Lakkadwala', 'AITR', 'IT & DS'),
            ('hodaiml@acropolis.in', 'Dr. Namrata Tapaswi', 'AITR', 'AIML'),
            ('hodce@acropolis.in', 'Dr. S.K. Sharma', 'AITR', 'Civil'),
            ('hemantmarmat@acropolis.in', 'Dr. Hemant Marmat', 'AITR', 'MECH'),
            ('hodec@acropolis.in', 'Dr. U. B. S Chandrawat', 'AITR', 'EC&VLSI&ACT'),
            ('hodfca@acropolis.in', 'Dr. Geeta Santhosh', 'AITR', 'FCA'),
            ('prashantgeete@acropolis.in', 'Dr. Prashant Geete', 'AITR', 'First Year'),
            ('atul@acropolis.in', 'Mr. Atul N Bharat', 'AITR', 'Placement')
        ) AS t(email, full_name, college, department)
    LOOP
        -- 1. Check if user exists
        SELECT id INTO new_user_id FROM auth.users WHERE email = hod_record.email;

        -- 2. Create Identity if not exists
        IF new_user_id IS NULL THEN
            INSERT INTO auth.users (
                instance_id,
                id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at,
                raw_app_meta_data,
                raw_user_meta_data,
                created_at,
                updated_at,
                confirmation_token,
                email_change,
                email_change_token_new,
                recovery_token
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                gen_random_uuid(),
                'authenticated',
                'authenticated',
                hod_record.email,
                crypt('Password@123', gen_salt('bf')),
                now(),
                '{"provider":"email","providers":["email"]}',
                json_build_object(
                    'full_name', hod_record.full_name,
                    'college', hod_record.college,
                    'department', hod_record.department,
                    'role', 'hod'
                ),
                now(),
                now(),
                '',
                '',
                '',
                ''
            )
            RETURNING id INTO new_user_id;
        END IF;

        -- 2. Create/Update Profile in public.profiles
        INSERT INTO public.profiles (
            id,
            full_name,
            email,
            phone_number,
            college_name,
            department,
            role,
            is_approved,
            created_at
        ) VALUES (
            new_user_id,
            hod_record.full_name,
            hod_record.email,
            '9876543210', -- Default dummy phone
            hod_record.college,
            hod_record.department,
            'hod',
            true,
            now()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'hod',
            is_approved = true,
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email,
            phone_number = EXCLUDED.phone_number,
            college_name = EXCLUDED.college_name,
            department = EXCLUDED.department;

    END LOOP;

    RAISE NOTICE 'Seeding Complete: 20 HOD accounts created/updated.';
END $$;

-- MANUAL APPROVAL (Fix Instant Logout)
-- By default, new users are NOT approved.
-- If the App has a "Gate", it kicks them out.
-- We fix this by Approving the User.

update public.profiles
set is_approved = true
where email = 'anshuloza@gmail.com';

-- Verify
select email, is_approved from public.profiles where email = 'anshuloza@gmail.com';

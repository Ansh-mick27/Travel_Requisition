-- Replace 'YOUR_EMAIL@EXAMPLE.COM' with your actual email address
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@EXAMPLE.COM'
);

-- SQL script to set up admin access for Bryan
-- Run this in the Supabase SQL editor

-- 1. First, find Bryan's user ID
SELECT id, email, full_name 
FROM profiles 
WHERE email = 'bryan@percytech.com';

-- 2. Create user_roles entry for Bryan (replace USER_ID with actual ID from step 1)
-- Example: If Bryan's ID is '3394c0cc-5a1b-48f6-bcdd-43c4896aac75'
INSERT INTO user_roles (user_id, role, created_at)
VALUES ('3394c0cc-5a1b-48f6-bcdd-43c4896aac75', 'superadmin', NOW())
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Verify the role was created
SELECT u.user_id, u.role, p.email, p.full_name
FROM user_roles u
JOIN profiles p ON u.user_id = p.id
WHERE u.role = 'superadmin';

-- 4. Also check the admin views are accessible
SELECT * FROM admin_system_metrics;
SELECT * FROM admin_user_overview LIMIT 5;
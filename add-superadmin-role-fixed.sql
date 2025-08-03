-- Add superadmin to the app_role enum
-- Run this in your Supabase SQL editor

-- Add superadmin value to the enum (this will fail silently if it already exists)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'superadmin';

-- Grant the superadmin role to your user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'superadmin'::app_role
FROM auth.users
WHERE email = 'brfine@icloud.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the role was added
SELECT u.email, ur.role, ur.created_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'brfine@icloud.com' AND ur.role = 'superadmin';
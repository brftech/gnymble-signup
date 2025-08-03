-- Add superadmin to the app_role enum
-- Run this in your Supabase SQL editor

-- First, check if superadmin already exists in the enum
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'superadmin'
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'app_role'
        )
    ) THEN
        ALTER TYPE public.app_role ADD VALUE 'superadmin';
    END IF;
END $$;

-- Now grant the superadmin role to your user
-- Replace the email below with your actual email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'superadmin'
FROM auth.users
WHERE email = 'brfine@icloud.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the role was added
SELECT u.email, ur.role
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'brfine@icloud.com' AND ur.role = 'superadmin';
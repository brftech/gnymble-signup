-- Add superadmin role and create admin views for the dashboard
-- This migration adds system-wide admin capabilities

-- 1. Add superadmin to the app_role enum
-- Note: Adding enum values requires special handling
DO $$ 
BEGIN
    -- Check if superadmin already exists in the enum
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

-- 2. Create admin-specific views for efficient dashboard queries
-- User overview with all relevant information
CREATE OR REPLACE VIEW public.admin_user_overview AS
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.phone,
    p.payment_status,
    p.stripe_customer_id,
    p.payment_date,
    p.created_at,
    p.updated_at,
    ur.role as system_role,
    c.id as company_id,
    c.name as company_name,
    c.tcr_brand_id,
    c.brand_verification_status,
    ucr.role as company_role,
    (
        SELECT COUNT(*)
        FROM public.onboarding_submissions os
        WHERE os.user_id = p.id
    ) as submission_count,
    (
        SELECT MAX(os.submitted_at)
        FROM public.onboarding_submissions os
        WHERE os.user_id = p.id
    ) as last_submission_date
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.user_company_roles ucr ON p.id = ucr.user_id AND ucr.is_primary = true
LEFT JOIN public.companies c ON ucr.company_id = c.id
ORDER BY p.created_at DESC;

-- Grant access to authenticated users (will be filtered by RLS)
GRANT SELECT ON public.admin_user_overview TO authenticated;

-- 3. Create company overview for admin dashboard
CREATE OR REPLACE VIEW public.admin_company_overview AS
SELECT 
    c.*,
    (
        SELECT COUNT(DISTINCT ucr.user_id)
        FROM public.user_company_roles ucr
        WHERE ucr.company_id = c.id
    ) as user_count,
    (
        SELECT COUNT(*)
        FROM public.brands b
        WHERE b.company_id = c.id
    ) as brand_count,
    (
        SELECT COUNT(*)
        FROM public.campaigns camp
        JOIN public.brands b ON camp.brand_id = b.id
        WHERE b.company_id = c.id
    ) as campaign_count,
    (
        SELECT COUNT(*)
        FROM public.onboarding_submissions os
        WHERE os.company_id = c.id
    ) as submission_count
FROM public.companies c
ORDER BY c.created_at DESC;

-- Grant access to authenticated users
GRANT SELECT ON public.admin_company_overview TO authenticated;

-- 4. Create system metrics view
CREATE OR REPLACE VIEW public.admin_system_metrics AS
SELECT 
    (SELECT COUNT(*) FROM public.profiles) as total_users,
    (SELECT COUNT(*) FROM public.profiles WHERE payment_status = 'paid') as paid_users,
    (SELECT COUNT(*) FROM public.companies) as total_companies,
    (SELECT COUNT(*) FROM public.companies WHERE brand_verification_status = 'approved') as verified_companies,
    (SELECT COUNT(*) FROM public.onboarding_submissions) as total_submissions,
    (SELECT COUNT(*) FROM public.onboarding_submissions WHERE status = 'approved') as approved_submissions,
    (SELECT COUNT(*) FROM public.profiles WHERE created_at > NOW() - INTERVAL '7 days') as new_users_7d,
    (SELECT COUNT(*) FROM public.profiles WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
    (SELECT COUNT(*) FROM public.profiles WHERE payment_status = 'paid' AND payment_date > NOW() - INTERVAL '7 days') as new_payments_7d,
    (SELECT COUNT(*) FROM public.profiles WHERE payment_status = 'paid' AND payment_date > NOW() - INTERVAL '30 days') as new_payments_30d;

-- Grant access to authenticated users
GRANT SELECT ON public.admin_system_metrics TO authenticated;

-- 5. Create audit log table for tracking admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT, -- 'user', 'company', 'submission', etc.
    target_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create index for efficient queries
CREATE INDEX idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX idx_admin_audit_logs_target ON public.admin_audit_logs(target_type, target_id);

-- 6. Create RLS policies for superadmin access
-- Function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = 'superadmin'
    )
$$;

-- Superadmin policies for all tables
-- Profiles
CREATE POLICY "Superadmins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.is_superadmin(auth.uid()));

-- Companies
CREATE POLICY "Superadmins can view all companies" ON public.companies
    FOR SELECT USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can update all companies" ON public.companies
    FOR UPDATE USING (public.is_superadmin(auth.uid()));

-- User roles
CREATE POLICY "Superadmins can view all user roles" ON public.user_roles
    FOR SELECT USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can manage all user roles" ON public.user_roles
    FOR ALL USING (public.is_superadmin(auth.uid()));

-- Onboarding submissions
CREATE POLICY "Superadmins can view all submissions" ON public.onboarding_submissions
    FOR SELECT USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can update all submissions" ON public.onboarding_submissions
    FOR UPDATE USING (public.is_superadmin(auth.uid()));

-- Audit logs - only superadmins can view
CREATE POLICY "Superadmins can view audit logs" ON public.admin_audit_logs
    FOR SELECT USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can insert audit logs" ON public.admin_audit_logs
    FOR INSERT WITH CHECK (public.is_superadmin(auth.uid()));

-- 7. Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
    _action TEXT,
    _target_type TEXT DEFAULT NULL,
    _target_id UUID DEFAULT NULL,
    _details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.admin_audit_logs (
        admin_id,
        action,
        target_type,
        target_id,
        details
    ) VALUES (
        auth.uid(),
        _action,
        _target_type,
        _target_id,
        _details
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- 8. Create function to grant superadmin role
CREATE OR REPLACE FUNCTION public.grant_superadmin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if caller is superadmin
    IF NOT public.is_superadmin(auth.uid()) THEN
        RAISE EXCEPTION 'Only superadmins can grant superadmin role';
    END IF;
    
    -- Insert or update role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'superadmin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Log the action
    PERFORM public.log_admin_action(
        'grant_superadmin',
        'user',
        _user_id,
        jsonb_build_object('granted_by', auth.uid())
    );
    
    RETURN TRUE;
END;
$$;

-- 9. Create function to revoke superadmin role
CREATE OR REPLACE FUNCTION public.revoke_superadmin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if caller is superadmin
    IF NOT public.is_superadmin(auth.uid()) THEN
        RAISE EXCEPTION 'Only superadmins can revoke superadmin role';
    END IF;
    
    -- Prevent removing last superadmin
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'superadmin') <= 1 THEN
        RAISE EXCEPTION 'Cannot remove the last superadmin';
    END IF;
    
    -- Delete role
    DELETE FROM public.user_roles
    WHERE user_id = _user_id AND role = 'superadmin';
    
    -- Log the action
    PERFORM public.log_admin_action(
        'revoke_superadmin',
        'user',
        _user_id,
        jsonb_build_object('revoked_by', auth.uid())
    );
    
    RETURN TRUE;
END;
$$;

-- 10. Grant yourself superadmin role (replace with your user ID)
-- IMPORTANT: Uncomment and update this with your actual user ID after running the migration
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('YOUR-USER-ID-HERE', 'superadmin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Note: To find your user ID, run:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
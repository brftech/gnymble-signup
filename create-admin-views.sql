-- Create admin views for the superadmin dashboard
-- Run this in your Supabase SQL editor

-- 1. Create admin_user_overview view
CREATE OR REPLACE VIEW public.admin_user_overview AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.phone,
  p.payment_status,
  p.payment_date,
  p.created_at,
  p.updated_at,
  c.id as company_id,
  c.name as company_name,
  c.tcr_brand_id,
  c.brand_verification_status,
  COALESCE(ur.role, 'user') as system_role
FROM public.profiles p
LEFT JOIN public.user_company_roles ucr ON p.id = ucr.user_id AND ucr.is_primary = true
LEFT JOIN public.companies c ON ucr.company_id = c.id
LEFT JOIN public.user_roles ur ON p.id = ur.user_id;

-- Grant access to authenticated users (RLS will handle row filtering)
GRANT SELECT ON public.admin_user_overview TO authenticated;

-- 2. Create admin_system_metrics view
CREATE OR REPLACE VIEW public.admin_system_metrics AS
SELECT 
  COUNT(DISTINCT p.id) as total_users,
  COUNT(DISTINCT CASE WHEN p.payment_status = 'paid' THEN p.id END) as paid_users,
  COUNT(DISTINCT c.id) as total_companies,
  COUNT(DISTINCT CASE WHEN c.brand_verification_status = 'approved' THEN c.id END) as verified_companies,
  COUNT(DISTINCT os.id) as total_submissions,
  COUNT(DISTINCT CASE WHEN os.status = 'approved' THEN os.id END) as approved_submissions,
  COUNT(DISTINCT CASE WHEN p.created_at >= NOW() - INTERVAL '7 days' THEN p.id END) as new_users_7d,
  COUNT(DISTINCT CASE WHEN p.created_at >= NOW() - INTERVAL '30 days' THEN p.id END) as new_users_30d,
  COUNT(DISTINCT CASE WHEN p.payment_status = 'paid' AND p.payment_date >= NOW() - INTERVAL '7 days' THEN p.id END) as new_payments_7d,
  COUNT(DISTINCT CASE WHEN p.payment_status = 'paid' AND p.payment_date >= NOW() - INTERVAL '30 days' THEN p.id END) as new_payments_30d
FROM public.profiles p
LEFT JOIN public.user_company_roles ucr ON p.id = ucr.user_id
LEFT JOIN public.companies c ON ucr.company_id = c.id
LEFT JOIN public.onboarding_submissions os ON c.id = os.company_id;

-- Grant access to authenticated users
GRANT SELECT ON public.admin_system_metrics TO authenticated;

-- 3. Create admin_audit_logs table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_user_id ON public.admin_audit_logs(user_id);

-- Enable RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy: only superadmins can view audit logs
CREATE POLICY "Superadmins can view audit logs" ON public.admin_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'superadmin'
    )
  );

-- 4. Create RLS policies for the admin views
CREATE POLICY "Superadmins can view all users" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'superadmin'
    )
    OR id = auth.uid()
  );

CREATE POLICY "Superadmins can view all companies" ON public.companies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'superadmin'
    )
    OR id IN (
      SELECT company_id FROM public.user_company_roles
      WHERE user_id = auth.uid()
    )
  );

-- 5. Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  _action TEXT,
  _target_type TEXT,
  _target_id TEXT,
  _details JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.admin_audit_logs (user_id, user_email, action, target_type, target_id, details)
  VALUES (
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    _action,
    _target_type,
    _target_id,
    _details
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.log_admin_action TO authenticated;

-- Test that everything works
SELECT 'Admin views and tables created successfully!' as status;
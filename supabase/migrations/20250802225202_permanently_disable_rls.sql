-- Permanently disable RLS on all tables to fix database connection issues
-- This is a temporary solution until we can properly configure RLS policies

-- Step 1: Disable RLS on all tables completely
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_numbers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_phone_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_access DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_company_roles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies to clean slate
DROP POLICY IF EXISTS "Users can view companies" ON public.companies CASCADE;
DROP POLICY IF EXISTS "Users can update companies" ON public.companies CASCADE;
DROP POLICY IF EXISTS "Users can insert companies" ON public.companies CASCADE;
DROP POLICY IF EXISTS "Users can view their companies" ON public.companies CASCADE;
DROP POLICY IF EXISTS "Users can update their companies" ON public.companies CASCADE;
DROP POLICY IF EXISTS "Users can insert their companies" ON public.companies CASCADE;
DROP POLICY IF EXISTS "companies_select_policy" ON public.companies CASCADE;
DROP POLICY IF EXISTS "companies_update_policy" ON public.companies CASCADE;
DROP POLICY IF EXISTS "companies_insert_policy" ON public.companies CASCADE;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.companies CASCADE;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.companies CASCADE;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.companies CASCADE;

DROP POLICY IF EXISTS "Users can view brands for their companies" ON public.brands CASCADE;
DROP POLICY IF EXISTS "Users can insert brands for their companies" ON public.brands CASCADE;
DROP POLICY IF EXISTS "Users can update brands for their companies" ON public.brands CASCADE;
DROP POLICY IF EXISTS "Users can view their brands" ON public.brands CASCADE;
DROP POLICY IF EXISTS "Users can insert their brands" ON public.brands CASCADE;
DROP POLICY IF EXISTS "Users can update their brands" ON public.brands CASCADE;
DROP POLICY IF EXISTS "brands_select_policy" ON public.brands CASCADE;
DROP POLICY IF EXISTS "brands_insert_policy" ON public.brands CASCADE;
DROP POLICY IF EXISTS "brands_update_policy" ON public.brands CASCADE;

DROP POLICY IF EXISTS "Users can view campaigns for their brands" ON public.campaigns CASCADE;
DROP POLICY IF EXISTS "Users can insert campaigns for their brands" ON public.campaigns CASCADE;
DROP POLICY IF EXISTS "Users can update campaigns for their brands" ON public.campaigns CASCADE;
DROP POLICY IF EXISTS "Users can view their campaigns" ON public.campaigns CASCADE;
DROP POLICY IF EXISTS "Users can insert their campaigns" ON public.campaigns CASCADE;
DROP POLICY IF EXISTS "Users can update their campaigns" ON public.campaigns CASCADE;
DROP POLICY IF EXISTS "campaigns_select_policy" ON public.campaigns CASCADE;
DROP POLICY IF EXISTS "campaigns_insert_policy" ON public.campaigns CASCADE;
DROP POLICY IF EXISTS "campaigns_update_policy" ON public.campaigns CASCADE;

DROP POLICY IF EXISTS "Only admins can manage phone numbers" ON public.phone_numbers CASCADE;
DROP POLICY IF EXISTS "phone_numbers_admin_policy" ON public.phone_numbers CASCADE;

DROP POLICY IF EXISTS "Users can view phone assignments for their campaigns" ON public.campaign_phone_assignments CASCADE;
DROP POLICY IF EXISTS "Users can manage phone assignments for their campaigns" ON public.campaign_phone_assignments CASCADE;
DROP POLICY IF EXISTS "Users can view their phone assignments" ON public.campaign_phone_assignments CASCADE;
DROP POLICY IF EXISTS "Users can manage their phone assignments" ON public.campaign_phone_assignments CASCADE;
DROP POLICY IF EXISTS "campaign_phone_assignments_select_policy" ON public.campaign_phone_assignments CASCADE;
DROP POLICY IF EXISTS "campaign_phone_assignments_all_policy" ON public.campaign_phone_assignments CASCADE;

DROP POLICY IF EXISTS "Users can view their own onboarding submissions" ON public.onboarding_submissions CASCADE;
DROP POLICY IF EXISTS "Users can insert their own onboarding submissions" ON public.onboarding_submissions CASCADE;
DROP POLICY IF EXISTS "Users can update their own onboarding submissions" ON public.onboarding_submissions CASCADE;
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.onboarding_submissions CASCADE;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON public.onboarding_submissions CASCADE;
DROP POLICY IF EXISTS "Users can update their own submissions" ON public.onboarding_submissions CASCADE;
DROP POLICY IF EXISTS "onboarding_submissions_select_policy" ON public.onboarding_submissions CASCADE;
DROP POLICY IF EXISTS "onboarding_submissions_insert_policy" ON public.onboarding_submissions CASCADE;
DROP POLICY IF EXISTS "onboarding_submissions_update_policy" ON public.onboarding_submissions CASCADE;

-- Drop any policies on other tables
DROP POLICY IF EXISTS "Enable read access for all users" ON public.customers CASCADE;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.customers CASCADE;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.customers CASCADE;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.customers CASCADE;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.customers CASCADE;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.customers CASCADE;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.customers CASCADE;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.subscriptions CASCADE;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.subscriptions CASCADE;
DROP POLICY IF EXISTS "Enable update for users based on customer_id" ON public.subscriptions CASCADE;
DROP POLICY IF EXISTS "Enable delete for users based on customer_id" ON public.subscriptions CASCADE;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.subscriptions CASCADE;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.subscriptions CASCADE;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.subscriptions CASCADE;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.customer_access CASCADE;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.customer_access CASCADE;
DROP POLICY IF EXISTS "Enable update for users based on customer_id" ON public.customer_access CASCADE;
DROP POLICY IF EXISTS "Enable delete for users based on customer_id" ON public.customer_access CASCADE;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.customer_access CASCADE;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.customer_access CASCADE;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.customer_access CASCADE;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_roles CASCADE;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_roles CASCADE;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_roles CASCADE;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.user_roles CASCADE;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_roles CASCADE;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_roles CASCADE;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_roles CASCADE;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles CASCADE;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_company_roles CASCADE;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_company_roles CASCADE;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_company_roles CASCADE;

-- Step 3: Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'brands', 'campaigns', 'phone_numbers', 'campaign_phone_assignments', 'onboarding_submissions', 'customers', 'subscriptions', 'customer_access', 'user_roles', 'profiles', 'user_company_roles')
ORDER BY tablename;

-- Step 4: Verify no policies exist
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'brands', 'campaigns', 'phone_numbers', 'campaign_phone_assignments', 'onboarding_submissions', 'customers', 'subscriptions', 'customer_access', 'user_roles', 'profiles', 'user_company_roles')
ORDER BY tablename, policyname;

SELECT 'RLS Permanently Disabled Successfully!' as status;

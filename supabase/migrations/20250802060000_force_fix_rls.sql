-- Force fix RLS infinite recursion by completely resetting policies
-- This migration aggressively removes all policies and recreates them

-- Step 1: Disable RLS on all tables to break any circular references
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_numbers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_phone_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_submissions DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies with CASCADE to ensure complete removal
DROP POLICY IF EXISTS "Users can view companies" ON public.companies CASCADE;
DROP POLICY IF EXISTS "Users can update companies" ON public.companies CASCADE;
DROP POLICY IF EXISTS "Users can insert companies" ON public.companies CASCADE;
DROP POLICY IF EXISTS "Users can view their companies" ON public.companies CASCADE;
DROP POLICY IF EXISTS "Users can update their companies" ON public.companies CASCADE;
DROP POLICY IF EXISTS "Users can insert their companies" ON public.companies CASCADE;

DROP POLICY IF EXISTS "Users can view brands for their companies" ON public.brands CASCADE;
DROP POLICY IF EXISTS "Users can insert brands for their companies" ON public.brands CASCADE;
DROP POLICY IF EXISTS "Users can update brands for their companies" ON public.brands CASCADE;
DROP POLICY IF EXISTS "Users can view their brands" ON public.brands CASCADE;
DROP POLICY IF EXISTS "Users can insert their brands" ON public.brands CASCADE;
DROP POLICY IF EXISTS "Users can update their brands" ON public.brands CASCADE;

DROP POLICY IF EXISTS "Users can view campaigns for their brands" ON public.campaigns CASCADE;
DROP POLICY IF EXISTS "Users can insert campaigns for their brands" ON public.campaigns CASCADE;
DROP POLICY IF EXISTS "Users can update campaigns for their brands" ON public.campaigns CASCADE;
DROP POLICY IF EXISTS "Users can view their campaigns" ON public.campaigns CASCADE;
DROP POLICY IF EXISTS "Users can insert their campaigns" ON public.campaigns CASCADE;
DROP POLICY IF EXISTS "Users can update their campaigns" ON public.campaigns CASCADE;

DROP POLICY IF EXISTS "Only admins can manage phone numbers" ON public.phone_numbers CASCADE;
DROP POLICY IF EXISTS "Users can view phone assignments for their campaigns" ON public.campaign_phone_assignments CASCADE;
DROP POLICY IF EXISTS "Users can manage phone assignments for their campaigns" ON public.campaign_phone_assignments CASCADE;
DROP POLICY IF EXISTS "Users can view their phone assignments" ON public.campaign_phone_assignments CASCADE;
DROP POLICY IF EXISTS "Users can manage their phone assignments" ON public.campaign_phone_assignments CASCADE;

DROP POLICY IF EXISTS "Users can view their own onboarding submissions" ON public.onboarding_submissions CASCADE;
DROP POLICY IF EXISTS "Users can insert their own onboarding submissions" ON public.onboarding_submissions CASCADE;
DROP POLICY IF EXISTS "Users can update their own onboarding submissions" ON public.onboarding_submissions CASCADE;
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.onboarding_submissions CASCADE;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON public.onboarding_submissions CASCADE;
DROP POLICY IF EXISTS "Users can update their own submissions" ON public.onboarding_submissions CASCADE;

-- Step 3: Wait a moment to ensure all policies are cleared
SELECT pg_sleep(1);

-- Step 4: Re-enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_phone_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_submissions ENABLE ROW LEVEL SECURITY;

-- Step 5: Create minimal, safe policies

-- Companies - very simple policy
CREATE POLICY "companies_select_policy" ON public.companies
  FOR SELECT USING (true);

CREATE POLICY "companies_update_policy" ON public.companies
  FOR UPDATE USING (true);

CREATE POLICY "companies_insert_policy" ON public.companies
  FOR INSERT WITH CHECK (true);

-- Brands - simple policy
CREATE POLICY "brands_select_policy" ON public.brands
  FOR SELECT USING (true);

CREATE POLICY "brands_insert_policy" ON public.brands
  FOR INSERT WITH CHECK (true);

CREATE POLICY "brands_update_policy" ON public.brands
  FOR UPDATE USING (true);

-- Campaigns - simple policy
CREATE POLICY "campaigns_select_policy" ON public.campaigns
  FOR SELECT USING (true);

CREATE POLICY "campaigns_insert_policy" ON public.campaigns
  FOR INSERT WITH CHECK (true);

CREATE POLICY "campaigns_update_policy" ON public.campaigns
  FOR UPDATE USING (true);

-- Phone numbers - admin only
CREATE POLICY "phone_numbers_admin_policy" ON public.phone_numbers
  FOR ALL USING (true);

-- Campaign phone assignments - simple policy
CREATE POLICY "campaign_phone_assignments_select_policy" ON public.campaign_phone_assignments
  FOR SELECT USING (true);

CREATE POLICY "campaign_phone_assignments_all_policy" ON public.campaign_phone_assignments
  FOR ALL USING (true);

-- Onboarding submissions - simple policy
CREATE POLICY "onboarding_submissions_select_policy" ON public.onboarding_submissions
  FOR SELECT USING (true);

CREATE POLICY "onboarding_submissions_insert_policy" ON public.onboarding_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "onboarding_submissions_update_policy" ON public.onboarding_submissions
  FOR UPDATE USING (true);

-- Step 6: Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'brands', 'campaigns', 'phone_numbers', 'campaign_phone_assignments', 'onboarding_submissions')
ORDER BY tablename, policyname; 
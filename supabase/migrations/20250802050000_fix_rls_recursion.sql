-- Fix infinite recursion in RLS policies
-- This migration addresses the "infinite recursion detected in policy for relation 'user_company_roles'" error

-- First, drop all existing RLS policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update companies" ON public.companies;
DROP POLICY IF EXISTS "Users can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view brands for their companies" ON public.brands;
DROP POLICY IF EXISTS "Users can insert brands for their companies" ON public.brands;
DROP POLICY IF EXISTS "Users can update brands for their companies" ON public.brands;
DROP POLICY IF EXISTS "Users can view campaigns for their brands" ON public.campaigns;
DROP POLICY IF EXISTS "Users can insert campaigns for their brands" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update campaigns for their brands" ON public.campaigns;
DROP POLICY IF EXISTS "Only admins can manage phone numbers" ON public.phone_numbers;
DROP POLICY IF EXISTS "Users can view phone assignments for their campaigns" ON public.campaign_phone_assignments;
DROP POLICY IF EXISTS "Users can manage phone assignments for their campaigns" ON public.campaign_phone_assignments;
DROP POLICY IF EXISTS "Users can view their own onboarding submissions" ON public.onboarding_submissions;
DROP POLICY IF EXISTS "Users can insert their own onboarding submissions" ON public.onboarding_submissions;
DROP POLICY IF EXISTS "Users can update their own onboarding submissions" ON public.onboarding_submissions;

-- Recreate simplified RLS policies without circular references

-- Companies policies - simplified to avoid recursion
CREATE POLICY "Users can view their companies" ON public.companies
  FOR SELECT USING (
    id IN (
      SELECT company_id FROM public.user_company_roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their companies" ON public.companies
  FOR UPDATE USING (
    id IN (
      SELECT company_id FROM public.user_company_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Brands policies - simplified
CREATE POLICY "Users can view their brands" ON public.brands
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.user_company_roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their brands" ON public.brands
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.user_company_roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their brands" ON public.brands
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM public.user_company_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Campaigns policies - simplified
CREATE POLICY "Users can view their campaigns" ON public.campaigns
  FOR SELECT USING (
    brand_id IN (
      SELECT b.id FROM public.brands b
      WHERE b.company_id IN (
        SELECT company_id FROM public.user_company_roles 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (
    brand_id IN (
      SELECT b.id FROM public.brands b
      WHERE b.company_id IN (
        SELECT company_id FROM public.user_company_roles 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their campaigns" ON public.campaigns
  FOR UPDATE USING (
    brand_id IN (
      SELECT b.id FROM public.brands b
      WHERE b.company_id IN (
        SELECT company_id FROM public.user_company_roles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Phone numbers policies - admin only
CREATE POLICY "Only admins can manage phone numbers" ON public.phone_numbers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Campaign phone assignments policies - simplified
CREATE POLICY "Users can view their phone assignments" ON public.campaign_phone_assignments
  FOR SELECT USING (
    campaign_id IN (
      SELECT c.id FROM public.campaigns c
      JOIN public.brands b ON c.brand_id = b.id
      WHERE b.company_id IN (
        SELECT company_id FROM public.user_company_roles 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage their phone assignments" ON public.campaign_phone_assignments
  FOR ALL USING (
    campaign_id IN (
      SELECT c.id FROM public.campaigns c
      JOIN public.brands b ON c.brand_id = b.id
      WHERE b.company_id IN (
        SELECT company_id FROM public.user_company_roles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Onboarding submissions policies - simplified
CREATE POLICY "Users can view their own submissions" ON public.onboarding_submissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own submissions" ON public.onboarding_submissions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own submissions" ON public.onboarding_submissions
  FOR UPDATE USING (user_id = auth.uid());

-- Ensure RLS is enabled on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_phone_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_submissions ENABLE ROW LEVEL SECURITY; 
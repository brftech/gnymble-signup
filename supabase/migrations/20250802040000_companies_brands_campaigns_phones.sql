-- Comprehensive database structure for companies, brands, campaigns, and phone numbers
-- This migration sets up the complete tracking system for SMS compliance

-- 1. Update companies table with comprehensive company information
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS legal_company_name TEXT,
ADD COLUMN IF NOT EXISTS dba_brand_name TEXT,
ADD COLUMN IF NOT EXISTS country_of_registration TEXT,
ADD COLUMN IF NOT EXISTS tax_number_ein TEXT,
ADD COLUMN IF NOT EXISTS tax_issuing_country TEXT,
ADD COLUMN IF NOT EXISTS address_street TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state_region TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS vertical_type TEXT,
ADD COLUMN IF NOT EXISTS legal_form TEXT,
ADD COLUMN IF NOT EXISTS business_phone TEXT,
ADD COLUMN IF NOT EXISTS point_of_contact_email TEXT,
ADD COLUMN IF NOT EXISTS tcr_brand_id TEXT,
ADD COLUMN IF NOT EXISTS brand_verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS brand_verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create brands table (companies can have multiple brands)
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  dba_name TEXT,
  description TEXT,
  vertical_type TEXT,
  tcr_brand_id TEXT,
  brand_verification_status TEXT DEFAULT 'pending',
  brand_verification_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, brand_name)
);

-- 3. Create campaigns table (brands can have multiple campaigns)
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  description TEXT,
  use_case TEXT,
  tcr_campaign_id TEXT,
  campaign_approval_status TEXT DEFAULT 'pending',
  campaign_approval_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id, campaign_name)
);

-- 4. Create phone_numbers table to track purchased phone numbers
CREATE TABLE IF NOT EXISTS public.phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  country_code TEXT DEFAULT 'US',
  area_code TEXT,
  phone_type TEXT DEFAULT 'local', -- local, toll-free, etc.
  status TEXT DEFAULT 'available', -- available, assigned, suspended, etc.
  twilio_sid TEXT,
  twilio_phone_sid TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  monthly_cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create campaign_phone_assignments table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.campaign_phone_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  phone_number_id UUID NOT NULL REFERENCES public.phone_numbers(id) ON DELETE CASCADE,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active', -- active, inactive, suspended
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, phone_number_id)
);

-- 6. Create onboarding_submissions table to track onboarding data
CREATE TABLE IF NOT EXISTS public.onboarding_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  submission_data JSONB NOT NULL,
  status TEXT DEFAULT 'submitted', -- submitted, processing, approved, rejected
  tcr_brand_id TEXT,
  tcr_campaign_id TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_tcr_brand_id ON public.companies(tcr_brand_id);
CREATE INDEX IF NOT EXISTS idx_companies_verification_status ON public.companies(brand_verification_status);
CREATE INDEX IF NOT EXISTS idx_brands_company_id ON public.brands(company_id);
CREATE INDEX IF NOT EXISTS idx_brands_tcr_brand_id ON public.brands(tcr_brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON public.campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_tcr_campaign_id ON public.campaigns(tcr_campaign_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_status ON public.phone_numbers(status);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_country_code ON public.phone_numbers(country_code);
CREATE INDEX IF NOT EXISTS idx_campaign_phone_assignments_campaign_id ON public.campaign_phone_assignments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_phone_assignments_phone_number_id ON public.campaign_phone_assignments(phone_number_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_submissions_user_id ON public.onboarding_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_submissions_company_id ON public.onboarding_submissions(company_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_submissions_status ON public.onboarding_submissions(status);

-- 8. Add RLS policies
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_phone_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_submissions ENABLE ROW LEVEL SECURITY;

-- Brands policies
CREATE POLICY "Users can view brands for their companies" ON public.brands
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.user_company_roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert brands for their companies" ON public.brands
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.user_company_roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update brands for their companies" ON public.brands
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM public.user_company_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Campaigns policies
CREATE POLICY "Users can view campaigns for their brands" ON public.campaigns
  FOR SELECT USING (
    brand_id IN (
      SELECT b.id FROM public.brands b
      JOIN public.user_company_roles ucr ON b.company_id = ucr.company_id
      WHERE ucr.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert campaigns for their brands" ON public.campaigns
  FOR INSERT WITH CHECK (
    brand_id IN (
      SELECT b.id FROM public.brands b
      JOIN public.user_company_roles ucr ON b.company_id = ucr.company_id
      WHERE ucr.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update campaigns for their brands" ON public.campaigns
  FOR UPDATE USING (
    brand_id IN (
      SELECT b.id FROM public.brands b
      JOIN public.user_company_roles ucr ON b.company_id = ucr.company_id
      WHERE ucr.user_id = auth.uid()
    )
  );

-- Phone numbers policies (admin only for now)
CREATE POLICY "Only admins can manage phone numbers" ON public.phone_numbers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Campaign phone assignments policies
CREATE POLICY "Users can view phone assignments for their campaigns" ON public.campaign_phone_assignments
  FOR SELECT USING (
    campaign_id IN (
      SELECT c.id FROM public.campaigns c
      JOIN public.brands b ON c.brand_id = b.id
      JOIN public.user_company_roles ucr ON b.company_id = ucr.company_id
      WHERE ucr.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage phone assignments for their campaigns" ON public.campaign_phone_assignments
  FOR ALL USING (
    campaign_id IN (
      SELECT c.id FROM public.campaigns c
      JOIN public.brands b ON c.brand_id = b.id
      JOIN public.user_company_roles ucr ON b.company_id = ucr.company_id
      WHERE ucr.user_id = auth.uid()
    )
  );

-- Onboarding submissions policies
CREATE POLICY "Users can view their own onboarding submissions" ON public.onboarding_submissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own onboarding submissions" ON public.onboarding_submissions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own onboarding submissions" ON public.onboarding_submissions
  FOR UPDATE USING (user_id = auth.uid());

-- 9. Create functions for common operations
-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_user_companies(UUID);
DROP FUNCTION IF EXISTS public.get_company_brands(UUID);
DROP FUNCTION IF EXISTS public.get_brand_campaigns(UUID);

CREATE OR REPLACE FUNCTION public.get_user_companies(user_uuid UUID)
RETURNS TABLE (
  company_id UUID,
  company_name TEXT,
  legal_company_name TEXT,
  brand_verification_status TEXT,
  role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.legal_company_name,
    c.brand_verification_status,
    ucr.role
  FROM public.companies c
  JOIN public.user_company_roles ucr ON c.id = ucr.company_id
  WHERE ucr.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_company_brands(company_uuid UUID)
RETURNS TABLE (
  brand_id UUID,
  brand_name TEXT,
  dba_name TEXT,
  vertical_type TEXT,
  brand_verification_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.brand_name,
    b.dba_name,
    b.vertical_type,
    b.brand_verification_status
  FROM public.brands b
  WHERE b.company_id = company_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_brand_campaigns(brand_uuid UUID)
RETURNS TABLE (
  campaign_id UUID,
  campaign_name TEXT,
  description TEXT,
  use_case TEXT,
  campaign_approval_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.campaign_name,
    c.description,
    c.use_case,
    c.campaign_approval_status
  FROM public.campaigns c
  WHERE c.brand_id = brand_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_phone_numbers_updated_at
  BEFORE UPDATE ON public.phone_numbers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_phone_assignments_updated_at
  BEFORE UPDATE ON public.campaign_phone_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_submissions_updated_at
  BEFORE UPDATE ON public.onboarding_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 
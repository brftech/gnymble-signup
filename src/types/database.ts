// Database types for Gnymble SMS platform

export interface Company {
  id: string;
  name: string;
  legal_company_name?: string;
  dba_brand_name?: string;
  country_of_registration?: string;
  tax_number_ein?: string;
  tax_issuing_country?: string;
  address_street?: string;
  city?: string;
  state_region?: string;
  postal_code?: string;
  country?: string;
  website?: string;
  vertical_type?: string;
  legal_form?: string;
  business_phone?: string;
  point_of_contact_email?: string;
  tcr_brand_id?: string;
  brand_verification_status?: 'pending' | 'submitted' | 'approved' | 'rejected';
  brand_verification_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  company_id: string;
  brand_name: string;
  dba_name?: string;
  description?: string;
  vertical_type?: string;
  tcr_brand_id?: string;
  brand_verification_status?: 'pending' | 'submitted' | 'approved' | 'rejected';
  brand_verification_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  brand_id: string;
  campaign_name: string;
  description?: string;
  use_case?: string;
  tcr_campaign_id?: string;
  campaign_approval_status?: 'pending' | 'submitted' | 'approved' | 'rejected';
  campaign_approval_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PhoneNumber {
  id: string;
  phone_number: string;
  country_code?: string;
  area_code?: string;
  phone_type?: 'local' | 'toll-free' | 'international';
  status?: 'available' | 'assigned' | 'suspended' | 'deactivated';
  twilio_sid?: string;
  twilio_phone_sid?: string;
  purchase_date?: string;
  monthly_cost?: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignPhoneAssignment {
  id: string;
  campaign_id: string;
  phone_number_id: string;
  assigned_date?: string;
  status?: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface OnboardingSubmission {
  id: string;
  user_id: string;
  company_id: string;
  submission_data: Record<string, any>;
  status?: 'submitted' | 'processing' | 'approved' | 'rejected';
  tcr_brand_id?: string;
  tcr_campaign_id?: string;
  submitted_at?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  user_id: string;
  role: 'user' | 'admin' | 'customer';
  created_at: string;
}

export interface UserCompanyRole {
  user_id: string;
  company_id: string;
  role: 'owner' | 'admin' | 'member';
  is_primary: boolean;
  created_at: string;
}

// Database function return types
export interface UserCompany {
  company_id: string;
  company_name: string;
  legal_company_name?: string;
  brand_verification_status?: string;
  role: string;
}

export interface CompanyBrand {
  brand_id: string;
  brand_name: string;
  dba_name?: string;
  vertical_type?: string;
  brand_verification_status?: string;
}

export interface BrandCampaign {
  campaign_id: string;
  campaign_name: string;
  description?: string;
  use_case?: string;
  campaign_approval_status?: string;
}

// Onboarding form data type
export interface OnboardingData {
  // Brand Verification Fields
  legal_company_name: string;
  dba_brand_name: string;
  country_of_registration: string;
  tax_number_ein: string;
  tax_issuing_country: string;
  address_street: string;
  city: string;
  state_region: string;
  postal_code: string;
  country: string;
  website: string;
  vertical_type: string;
  legal_form: string;
  business_phone: string;
  point_of_contact_email: string;

  // Campaign Approval Fields
  stock_symbol: string;
  stock_exchange: string;
  reference_id: string;
  duns_giin_lei: string;

  // Contact Information
  first_name: string;
  last_name: string;
  mobile_phone: string;
} 
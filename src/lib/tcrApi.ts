// The Campaign Registry (TCR) API Integration
// Staging Environment: https://csp-api-staging.campaignregistry.com/v2/restAPI

const TCR_BASE_URL = 'https://csp-api-staging.campaignregistry.com/v2';
const TCR_SECRET = '7456068D62D049C8A72FC32352D8F792';
const TCR_KEY = 'AA36CC19C3454EFC8937E7407329FB9F';

// TCR API Types
export interface TCRBrandRequest {
  brandId?: string;
  brandName: string;
  dbaName?: string;
  countryOfRegistration: string;
  taxNumber: string;
  taxIssuingCountry: string;
  address: {
    street: string;
    city: string;
    stateRegion: string;
    postalCode: string;
    country: string;
  };
  website?: string;
  verticalType: string;
  legalForm: string;
  businessPhone: string;
  pointOfContact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export interface TCRBrandResponse {
  brandId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
  errors?: string[];
}

export interface TCRCampaignRequest {
  campaignId?: string;
  brandId: string;
  campaignName: string;
  description?: string;
  useCase: string;
  verticalType: string;
  referenceId?: string;
  dunsGiinLei?: string;
}

export interface TCRCampaignResponse {
  campaignId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
  errors?: string[];
}

// Helper function to create authentication headers
function getAuthHeaders(): HeadersInit {
  const authString = `${TCR_KEY}:${TCR_SECRET}`;
  const base64Auth = btoa(authString);
  
  return {
    'Authorization': `Basic ${base64Auth}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

// Helper function to map our vertical types to TCR vertical types
function mapVerticalType(ourVerticalType: string): string {
  const verticalMap: Record<string, string> = {
    'CIGAR_RETAIL': 'RETAIL_AND_CONSUMER_PRODUCTS',
    'SPEAKEASY': 'FOOD_AND_BEVERAGE',
    'RESTAURANT': 'FOOD_AND_BEVERAGE',
    'BAR': 'FOOD_AND_BEVERAGE',
    'LOUNGE': 'FOOD_AND_BEVERAGE',
    'OTHER': 'OTHER',
  };
  
  return verticalMap[ourVerticalType] || 'OTHER';
}

// Helper function to map our legal forms to TCR legal forms
function mapLegalForm(ourLegalForm: string): string {
  const legalFormMap: Record<string, string> = {
    'PRIVATE_PROFIT': 'PRIVATE_PROFIT',
    'PUBLIC_PROFIT': 'PUBLIC_PROFIT',
    'NON_PROFIT': 'NON_PROFIT',
    'GOVERNMENT': 'GOVERNMENT',
  };
  
  return legalFormMap[ourLegalForm] || 'PRIVATE_PROFIT';
}

// Submit brand verification to TCR
export async function submitBrandVerification(brandData: TCRBrandRequest): Promise<TCRBrandResponse> {
  try {
    console.log('🚀 Submitting brand verification to TCR:', brandData);
    
    const response = await fetch(`${TCR_BASE_URL}/brands`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        brandId: brandData.brandId,
        brandName: brandData.brandName,
        dbaName: brandData.dbaName,
        countryOfRegistration: brandData.countryOfRegistration,
        taxNumber: brandData.taxNumber,
        taxIssuingCountry: brandData.taxIssuingCountry,
        address: brandData.address,
        website: brandData.website,
        verticalType: mapVerticalType(brandData.verticalType),
        legalForm: mapLegalForm(brandData.legalForm),
        businessPhone: brandData.businessPhone,
        pointOfContact: brandData.pointOfContact,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ TCR Brand API Error:', response.status, errorText);
      throw new Error(`TCR API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ TCR Brand Response:', result);
    
    return {
      brandId: result.brandId || result.id,
      status: result.status || 'PENDING',
      message: result.message,
      errors: result.errors,
    };
  } catch (error) {
    console.error('💥 TCR Brand Verification Error:', error);
    throw error;
  }
}

// Submit campaign approval to TCR
export async function submitCampaignApproval(campaignData: TCRCampaignRequest): Promise<TCRCampaignResponse> {
  try {
    console.log('🚀 Submitting campaign approval to TCR:', campaignData);
    
    const response = await fetch(`${TCR_BASE_URL}/campaigns`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        campaignId: campaignData.campaignId,
        brandId: campaignData.brandId,
        campaignName: campaignData.campaignName,
        description: campaignData.description,
        useCase: campaignData.useCase,
        verticalType: mapVerticalType(campaignData.verticalType),
        referenceId: campaignData.referenceId,
        dunsGiinLei: campaignData.dunsGiinLei,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ TCR Campaign API Error:', response.status, errorText);
      throw new Error(`TCR API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ TCR Campaign Response:', result);
    
    return {
      campaignId: result.campaignId || result.id,
      status: result.status || 'PENDING',
      message: result.message,
      errors: result.errors,
    };
  } catch (error) {
    console.error('💥 TCR Campaign Approval Error:', error);
    throw error;
  }
}

// Check brand verification status
export async function checkBrandStatus(brandId: string): Promise<TCRBrandResponse> {
  try {
    console.log('🔍 Checking brand status for:', brandId);
    
    const response = await fetch(`${TCR_BASE_URL}/brands/${brandId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ TCR Brand Status Error:', response.status, errorText);
      throw new Error(`TCR API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ TCR Brand Status Response:', result);
    
    return {
      brandId: result.brandId || result.id,
      status: result.status || 'PENDING',
      message: result.message,
      errors: result.errors,
    };
  } catch (error) {
    console.error('💥 TCR Brand Status Check Error:', error);
    throw error;
  }
}

// Check campaign approval status
export async function checkCampaignStatus(campaignId: string): Promise<TCRCampaignResponse> {
  try {
    console.log('🔍 Checking campaign status for:', campaignId);
    
    const response = await fetch(`${TCR_BASE_URL}/campaigns/${campaignId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ TCR Campaign Status Error:', response.status, errorText);
      throw new Error(`TCR API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ TCR Campaign Status Response:', result);
    
    return {
      campaignId: result.campaignId || result.id,
      status: result.status || 'PENDING',
      message: result.message,
      errors: result.errors,
    };
  } catch (error) {
    console.error('💥 TCR Campaign Status Check Error:', error);
    throw error;
  }
}

// Helper function to transform our onboarding data to TCR format
export function transformOnboardingDataToTCR(onboardingData: any): {
  brandRequest: TCRBrandRequest;
  campaignRequest: TCRCampaignRequest;
} {
  const brandRequest: TCRBrandRequest = {
    brandName: onboardingData.legal_company_name,
    dbaName: onboardingData.dba_brand_name,
    countryOfRegistration: onboardingData.country_of_registration,
    taxNumber: onboardingData.tax_number_ein,
    taxIssuingCountry: onboardingData.tax_issuing_country,
    address: {
      street: onboardingData.address_street,
      city: onboardingData.city,
      stateRegion: onboardingData.state_region,
      postalCode: onboardingData.postal_code,
      country: onboardingData.country,
    },
    website: onboardingData.website,
    verticalType: onboardingData.vertical_type,
    legalForm: onboardingData.legal_form,
    businessPhone: onboardingData.business_phone,
    pointOfContact: {
      firstName: onboardingData.first_name,
      lastName: onboardingData.last_name,
      email: onboardingData.point_of_contact_email,
      phone: onboardingData.mobile_phone,
    },
  };

  const campaignRequest: TCRCampaignRequest = {
    brandId: '', // Will be set after brand creation
    campaignName: `${onboardingData.legal_company_name} - Default Campaign`,
    description: 'Default campaign created during onboarding',
    useCase: 'General business communications',
    verticalType: onboardingData.vertical_type,
    referenceId: onboardingData.reference_id,
    dunsGiinLei: onboardingData.duns_giin_lei,
  };

  return { brandRequest, campaignRequest };
} 
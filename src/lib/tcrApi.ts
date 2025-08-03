// The Campaign Registry (TCR) API Integration
// Using Supabase Edge Function proxy to avoid CORS issues
import { authConfig } from "../config/auth";
import {
  validateAndFormatEIN,
  validateAndFormatState,
  validateAndFormatPhone,
  validateAndFormatWebsite,
} from "./validation";

const TCR_PROXY_URL =
  "https://rndpcearcqnvrnjxabgq.supabase.co/functions/v1/tcr-proxy";

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
  status: "PENDING" | "APPROVED" | "REJECTED";
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
  status: "PENDING" | "APPROVED" | "REJECTED";
  message?: string;
  errors?: string[];
}

// Helper function to create authentication headers
// Helper function to create proxy headers
function getProxyHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${authConfig.supabase.anonKey}`,
  };
}

// Submit brand verification to TCR
export async function submitBrandVerification(
  brandData: TCRBrandRequest
): Promise<TCRBrandResponse> {
  try {
    console.log(
      "🚀 Submitting brand verification to TCR via proxy:",
      brandData
    );

    const response = await fetch(TCR_PROXY_URL, {
      method: "POST",
      headers: getProxyHeaders(),
      body: JSON.stringify({
        action: "submitBrand",
        data: brandData,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ TCR Proxy Error:", response.status, errorText);
      throw new Error(`TCR Proxy Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ TCR Brand Response:", result);

    if (!result.success) {
      throw new Error(result.error || "Unknown TCR error");
    }

    return {
      brandId: result.brandId,
      status: result.status,
      message: result.message,
      errors: result.errors,
    };
  } catch (error) {
    console.error("💥 TCR Brand Verification Error:", error);
    throw error;
  }
}

// Submit campaign approval to TCR
export async function submitCampaignApproval(
  campaignData: TCRCampaignRequest
): Promise<TCRCampaignResponse> {
  try {
    console.log(
      "🚀 Submitting campaign approval to TCR via proxy:",
      campaignData
    );

    const response = await fetch(TCR_PROXY_URL, {
      method: "POST",
      headers: getProxyHeaders(),
      body: JSON.stringify({
        action: "submitCampaign",
        data: campaignData,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ TCR Proxy Error:", response.status, errorText);
      throw new Error(`TCR Proxy Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ TCR Campaign Response:", result);

    if (!result.success) {
      throw new Error(result.error || "Unknown TCR error");
    }

    return {
      campaignId: result.campaignId,
      status: result.status,
      message: result.message,
      errors: result.errors,
    };
  } catch (error) {
    console.error("💥 TCR Campaign Approval Error:", error);
    throw error;
  }
}

// Check brand verification status
export async function checkBrandStatus(
  brandId: string
): Promise<TCRBrandResponse> {
  try {
    console.log("🔍 Checking brand status for:", brandId);

    const response = await fetch(TCR_PROXY_URL, {
      method: "POST",
      headers: getProxyHeaders(),
      body: JSON.stringify({
        action: "checkBrandStatus",
        data: { brandId },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ TCR Proxy Error:", response.status, errorText);
      throw new Error(`TCR Proxy Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ TCR Brand Status Response:", result);

    if (!result.success) {
      throw new Error(result.error || "Unknown TCR error");
    }

    return {
      brandId: result.brandId,
      status: result.status,
      message: result.message,
      errors: result.errors,
    };
  } catch (error) {
    console.error("💥 TCR Brand Status Check Error:", error);
    throw error;
  }
}

// Check campaign approval status
export async function checkCampaignStatus(
  campaignId: string
): Promise<TCRCampaignResponse> {
  try {
    console.log("🔍 Checking campaign status for:", campaignId);

    const response = await fetch(TCR_PROXY_URL, {
      method: "POST",
      headers: getProxyHeaders(),
      body: JSON.stringify({
        action: "checkCampaignStatus",
        data: { campaignId },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ TCR Proxy Error:", response.status, errorText);
      throw new Error(`TCR Proxy Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ TCR Campaign Status Response:", result);

    if (!result.success) {
      throw new Error(result.error || "Unknown TCR error");
    }

    return {
      campaignId: result.campaignId,
      status: result.status,
      message: result.message,
      errors: result.errors,
    };
  } catch (error) {
    console.error("💥 TCR Campaign Status Check Error:", error);
    throw error;
  }
}

// Helper function to transform our onboarding data to TCR format
export function transformOnboardingDataToTCR(onboardingData: {
  legal_company_name: string;
  dba_brand_name?: string;
  country_of_registration?: string;
  tax_number_ein: string;
  tax_issuing_country?: string;
  address_street: string;
  city: string;
  state_region: string;
  postal_code: string;
  country?: string;
  website?: string;
  vertical_type?: string;
  legal_form?: string;
  business_phone: string;
  first_name: string;
  last_name: string;
  support_email?: string;
  point_of_contact_email?: string;
  mobile_phone?: string;
  reference_id?: string;
  duns_giin_lei?: string;
}): {
  brandRequest: TCRBrandRequest;
  campaignRequest: TCRCampaignRequest;
} {
  // Validate and format the data
  const einValidation = validateAndFormatEIN(onboardingData.tax_number_ein);
  const stateValidation = validateAndFormatState(onboardingData.state_region);
  const phoneValidation = validateAndFormatPhone(onboardingData.business_phone);
  const websiteValidation = validateAndFormatWebsite(
    onboardingData.website || ""
  );

  // Throw errors if validation fails
  if (!einValidation.isValid) {
    throw new Error(`EIN validation failed: ${einValidation.error}`);
  }
  if (!stateValidation.isValid) {
    throw new Error(`State validation failed: ${stateValidation.error}`);
  }
  if (!phoneValidation.isValid) {
    throw new Error(`Phone validation failed: ${phoneValidation.error}`);
  }
  if (!websiteValidation.isValid) {
    throw new Error(`Website validation failed: ${websiteValidation.error}`);
  }

  const brandRequest: TCRBrandRequest = {
    brandName: onboardingData.legal_company_name,
    dbaName: onboardingData.dba_brand_name || "",
    countryOfRegistration: onboardingData.country_of_registration || "US",
    taxNumber: einValidation.formatted, // Use formatted EIN
    taxIssuingCountry: onboardingData.tax_issuing_country || "US",
    address: {
      street: onboardingData.address_street,
      city: onboardingData.city,
      stateRegion: stateValidation.formatted, // Use formatted state code
      postalCode: onboardingData.postal_code,
      country: onboardingData.country || "US",
    },
    website: websiteValidation.formatted, // Use formatted website
    verticalType:
      onboardingData.vertical_type || "RETAIL_AND_CONSUMER_PRODUCTS",
    legalForm: onboardingData.legal_form || "PRIVATE_PROFIT",
    businessPhone: phoneValidation.formatted, // Use formatted phone
    pointOfContact: {
      firstName: onboardingData.first_name,
      lastName: onboardingData.last_name,
      email:
        onboardingData.support_email ||
        onboardingData.point_of_contact_email ||
        "",
      phone: phoneValidation.formatted, // Use formatted phone
    },
  };

  const campaignRequest: TCRCampaignRequest = {
    brandId: "", // Will be set after brand creation
    campaignName: `${onboardingData.legal_company_name} - Default Campaign`,
    description: "Default campaign created during onboarding",
    useCase: "General business communications",
    verticalType:
      onboardingData.vertical_type || "RETAIL_AND_CONSUMER_PRODUCTS", // Use form value with fallback
    referenceId: onboardingData.reference_id || "",
    dunsGiinLei: onboardingData.duns_giin_lei || "",
  };

  return { brandRequest, campaignRequest };
}

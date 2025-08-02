import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// TCR Configuration
const TCR_BASE_URL = "https://csp-api-staging.campaignregistry.com";
const TCR_SECRET = "7456068D62D049C8A72FC32352D8F792";
const TCR_KEY = "AA36CC19C3454EFC8937E7407329FB9F";

// Helper function to create authentication headers
function getAuthHeaders(): HeadersInit {
  const authString = `${TCR_KEY}:${TCR_SECRET}`;
  const base64Auth = btoa(authString);

  return {
    Authorization: `Basic ${base64Auth}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

// Helper function to map our vertical types to TCR vertical types
function mapVerticalType(ourVerticalType: string): string {
  const verticalMap: Record<string, string> = {
    CIGAR_RETAIL: "RETAIL_AND_CONSUMER_PRODUCTS",
    SPEAKEASY: "FOOD_AND_BEVERAGE",
    RESTAURANT: "FOOD_AND_BEVERAGE",
    BAR: "FOOD_AND_BEVERAGE",
    LOUNGE: "FOOD_AND_BEVERAGE",
    OTHER: "OTHER",
  };

  return verticalMap[ourVerticalType] || "RETAIL_AND_CONSUMER_PRODUCTS";
}

// Helper function to map our legal forms to TCR legal forms
function mapLegalForm(ourLegalForm: string): string {
  const legalFormMap: Record<string, string> = {
    PRIVATE_PROFIT: "PRIVATE_PROFIT",
    PUBLIC_PROFIT: "PUBLIC_PROFIT",
    NON_PROFIT: "NON_PROFIT",
    GOVERNMENT: "GOVERNMENT",
  };

  return legalFormMap[ourLegalForm] || "PRIVATE_PROFIT";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();

    console.log(`🎯 TCR Proxy: ${action}`, data);

    switch (action) {
      case "submitBrand":
        return await handleBrandSubmission(data);
      case "submitCampaign":
        return await handleCampaignSubmission(data);
      case "checkBrandStatus":
        return await handleBrandStatusCheck(data);
      case "checkCampaignStatus":
        return await handleCampaignStatusCheck(data);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("💥 TCR Proxy Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

interface TCRBrandData {
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

interface TCRCampaignData {
  campaignId?: string;
  brandId: string;
  campaignName: string;
  description?: string;
  useCase: string;
  verticalType: string;
  referenceId?: string;
  dunsGiinLei?: string;
}

async function handleBrandSubmission(brandData: TCRBrandData) {
  try {
    console.log("🚀 Submitting brand verification to TCR:", brandData);

    const response = await fetch(`${TCR_BASE_URL}/v2/brands`, {
      method: "POST",
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
      console.error("❌ TCR Brand API Error:", response.status, errorText);
      throw new Error(`TCR API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ TCR Brand Response:", result);

    return new Response(
      JSON.stringify({
        success: true,
        brandId: result.brandId || result.id,
        status: result.status || "PENDING",
        message: result.message,
        errors: result.errors,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("💥 TCR Brand Verification Error:", error);
    throw error;
  }
}

async function handleCampaignSubmission(campaignData: TCRCampaignData) {
  try {
    console.log("🚀 Submitting campaign approval to TCR:", campaignData);

    const response = await fetch(`${TCR_BASE_URL}/v2/campaigns`, {
      method: "POST",
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
      console.error("❌ TCR Campaign API Error:", response.status, errorText);
      throw new Error(`TCR API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ TCR Campaign Response:", result);

    return new Response(
      JSON.stringify({
        success: true,
        campaignId: result.campaignId || result.id,
        status: result.status || "PENDING",
        message: result.message,
        errors: result.errors,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("💥 TCR Campaign Approval Error:", error);
    throw error;
  }
}

async function handleBrandStatusCheck(data: { brandId: string }) {
  try {
    console.log("🔍 Checking brand status for:", data.brandId);

    const response = await fetch(`${TCR_BASE_URL}/v2/brand/${data.brandId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ TCR Brand Status Error:", response.status, errorText);
      throw new Error(`TCR API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ TCR Brand Status Response:", result);

    return new Response(
      JSON.stringify({
        success: true,
        brandId: result.brandId || result.id,
        status: result.status || "PENDING",
        message: result.message,
        errors: result.errors,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("💥 TCR Brand Status Check Error:", error);
    throw error;
  }
}

async function handleCampaignStatusCheck(data: { campaignId: string }) {
  try {
    console.log("🔍 Checking campaign status for:", data.campaignId);

    const response = await fetch(
      `${TCR_BASE_URL}/v2/campaign/${data.campaignId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ TCR Campaign Status Error:",
        response.status,
        errorText
      );
      throw new Error(`TCR API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ TCR Campaign Status Response:", result);

    return new Response(
      JSON.stringify({
        success: true,
        campaignId: result.campaignId || result.id,
        status: result.status || "PENDING",
        message: result.message,
        errors: result.errors,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("💥 TCR Campaign Status Check Error:", error);
    throw error;
  }
}

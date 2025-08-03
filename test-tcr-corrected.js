// Test script to verify the corrected TCR API endpoints
// Testing the fixed endpoints: /v2/restAPI/brand/nonBlocking

const TCR_BASE_URL = "https://csp-api-staging.campaignregistry.com";
const TCR_SECRET = "7456068D62D049C8A72FC32352D8F792";
const TCR_KEY = "AA36CC19C3454EFC8937E7407329FB9F";

// Helper function to create authentication headers
function getAuthHeaders() {
  const authString = `${TCR_KEY}:${TCR_SECRET}`;
  const base64Auth = Buffer.from(authString).toString('base64');

  return {
    'Authorization': `Basic ${base64Auth}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
}

// Test brand data
const testBrandData = {
  brandName: "Premium Cigar Emporium LLC",
  dbaName: "Premium Cigar Emporium",
  countryOfRegistration: "US",
  taxNumber: "12-3456789",
  taxIssuingCountry: "US",
  address: {
    street: "123 Main Street",
    city: "Miami",
    stateRegion: "FL",
    postalCode: "33101",
    country: "United States"
  },
  website: "https://premiumcigaremporium.com",
  verticalType: "RETAIL_AND_CONSUMER_PRODUCTS",
  legalForm: "PRIVATE_PROFIT",
  businessPhone: "+13055551234",
  pointOfContact: {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@premiumcigaremporium.com",
    phone: "+13055551234"
  }
};

async function testCorrectedTCR() {
  try {
    console.log("🚀 Testing Corrected TCR API Endpoint...");
    console.log("📋 Brand Data:", JSON.stringify(testBrandData, null, 2));
    console.log("🔑 Using TCR Staging Environment");
    console.log("🌐 URL:", `${TCR_BASE_URL}/v2/restAPI/brand/nonBlocking`);

    const response = await fetch(`${TCR_BASE_URL}/v2/restAPI/brand/nonBlocking`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(testBrandData)
    });

    console.log("📡 Response Status:", response.status);
    console.log("📡 Response Headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ TCR API Error:", response.status, errorText);
      throw new Error(`TCR API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ TCR Corrected Response:", JSON.stringify(result, null, 2));

    if (result.brandId || result.id) {
      console.log("🎉 Brand submission successful!");
      console.log("📋 Brand ID:", result.brandId || result.id);
      console.log("📋 Status:", result.status);
      
      if (result.message) {
        console.log("📋 Message:", result.message);
      }
      
      if (result.errors && result.errors.length > 0) {
        console.log("⚠️  Errors:", result.errors);
      }
    } else {
      console.error("❌ Brand submission failed - no brand ID returned");
    }

  } catch (error) {
    console.error("💥 Corrected TCR test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Test the corrected API
testCorrectedTCR().catch(console.error); 
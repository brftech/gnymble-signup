// Test script to verify our corrected Supabase Edge Function proxy
// Testing the updated tcr-proxy function with the correct format

const TCR_PROXY_URL = "https://rndpcearcqnvrnjxabgq.supabase.co/functions/v1/tcr-proxy";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuangxYmJncSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQzNDQ0NjQ2LCJleHAiOjIwNTkwMjA2NDZ9.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM";

// Test brand data that matches our onboarding form structure
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
  verticalType: "CIGAR_RETAIL",
  legalForm: "PRIVATE_PROFIT",
  businessPhone: "+13055551234",
  pointOfContact: {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@premiumcigaremporium.com",
    phone: "+13055551234"
  }
};

async function testTCRProxyCorrected() {
  try {
    console.log("🚀 Testing Corrected TCR Proxy...");
    console.log("📋 Brand Data:", JSON.stringify(testBrandData, null, 2));
    console.log("🌐 Proxy URL:", TCR_PROXY_URL);

    const response = await fetch(TCR_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        action: "submitBrand",
        data: testBrandData
      })
    });

    console.log("📡 Response Status:", response.status);
    console.log("📡 Response Headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ TCR Proxy Error:", response.status, errorText);
      throw new Error(`TCR Proxy Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ TCR Proxy Response:", JSON.stringify(result, null, 2));

    if (result.success) {
      console.log("🎉 Brand submission through proxy successful!");
      console.log("📋 Brand ID:", result.brandId);
      console.log("📋 Status:", result.status);
      
      if (result.message) {
        console.log("📋 Message:", result.message);
      }
      
      if (result.errors && result.errors.length > 0) {
        console.log("⚠️  Errors:", result.errors);
      }
    } else {
      console.error("❌ Brand submission through proxy failed");
      console.error("📋 Error:", result.error);
    }

  } catch (error) {
    console.error("💥 TCR Proxy test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Test the corrected proxy
testTCRProxyCorrected().catch(console.error); 
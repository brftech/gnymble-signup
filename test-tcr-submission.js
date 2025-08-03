// Test script to submit a brand to The Campaign Registry (TCR) staging environment
// Run with: node test-tcr-submission.js

const TCR_PROXY_URL = "https://rndpcearcqnvrnjxabgq.supabase.co/functions/v1/tcr-proxy";

// Supabase anon key for authentication
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuangxYmJncSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQzNDQ0NjQ2LCJleHAiOjIwNTkwMjA2NDZ9.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM";

// Test brand data - using realistic information for a cigar retail business
const testBrandData = {
  brandName: "Premium Cigar Emporium LLC",
  dbaName: "Premium Cigar Emporium",
  countryOfRegistration: "US",
  taxNumber: "12-3456789", // Test EIN
  taxIssuingCountry: "US",
  address: {
    street: "123 Main Street",
    city: "Miami",
    stateRegion: "FL",
    postalCode: "33101",
    country: "United States"
  },
  website: "https://premiumcigaremporium.com",
  verticalType: "CIGAR_RETAIL", // Will be mapped to RETAIL_AND_CONSUMER_PRODUCTS
  legalForm: "PRIVATE_PROFIT",
  businessPhone: "+13055551234",
  pointOfContact: {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@premiumcigaremporium.com",
    phone: "+13055551234"
  }
};

async function testTCRBrandSubmission() {
  try {
    console.log("🚀 Testing TCR Brand Submission...");
    console.log("📋 Brand Data:", JSON.stringify(testBrandData, null, 2));

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
    console.log("✅ TCR Brand Response:", JSON.stringify(result, null, 2));

    if (result.success) {
      console.log("🎉 Brand submission successful!");
      console.log("📋 Brand ID:", result.brandId);
      console.log("📋 Status:", result.status);
      
      if (result.message) {
        console.log("📋 Message:", result.message);
      }
      
      if (result.errors && result.errors.length > 0) {
        console.log("⚠️  Errors:", result.errors);
      }
      
      return result.brandId; // Return brand ID for campaign submission
    } else {
      console.error("❌ Brand submission failed:", result.error);
      return null;
    }

  } catch (error) {
    console.error("💥 Test failed:", error.message);
    console.error("Stack trace:", error.stack);
    return null;
  }
}

// Test campaign submission after brand is created
async function testTCRCampaignSubmission(brandId) {
  try {
    console.log("\n🚀 Testing TCR Campaign Submission...");
    
    const testCampaignData = {
      brandId: brandId,
      campaignName: "Premium Cigar Emporium - Customer Communications",
      description: "General business communications for premium cigar retail business",
      useCase: "General business communications",
      verticalType: "CIGAR_RETAIL",
      referenceId: "TEST-CAMPAIGN-001",
      dunsGiinLei: ""
    };

    console.log("📋 Campaign Data:", JSON.stringify(testCampaignData, null, 2));

    const response = await fetch(TCR_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        action: "submitCampaign",
        data: testCampaignData
      })
    });

    console.log("📡 Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ TCR Proxy Error:", response.status, errorText);
      throw new Error(`TCR Proxy Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ TCR Campaign Response:", JSON.stringify(result, null, 2));

    if (result.success) {
      console.log("🎉 Campaign submission successful!");
      console.log("📋 Campaign ID:", result.campaignId);
      console.log("📋 Status:", result.status);
    } else {
      console.error("❌ Campaign submission failed:", result.error);
    }

  } catch (error) {
    console.error("💥 Campaign test failed:", error.message);
  }
}

// Main test function
async function runTCRTests() {
  console.log("🧪 Starting TCR Integration Tests...\n");
  
  // Test brand submission
  const brandId = await testTCRBrandSubmission();
  
  if (brandId) {
    // Test campaign submission with the actual brandId
    console.log("\n⏳ Waiting 5 seconds before testing campaign submission...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await testTCRCampaignSubmission(brandId);
  } else {
    console.log("\n⚠️  Skipping campaign submission due to brand submission failure");
  }
  
  console.log("\n✅ TCR Integration Tests Complete!");
}

// Run the tests
runTCRTests().catch(console.error); 
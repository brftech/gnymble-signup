// Test script using the working format from the provided script
// Testing the corrected TCR API approach

const TCR_BASE_URL = "https://csp-api-staging.campaignregistry.com/v2";
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

// Test brand data using the working format
const testBrandData = {
  displayName: "Premium Cigar Emporium",
  companyName: "Premium Cigar Emporium LLC",
  ein: "12-3456789",
  entityType: "PRIVATE_PROFIT",
  vertical: "RETAIL",
  website: "https://premiumcigaremporium.com",
  street: "123 Main Street",
  city: "Miami",
  state: "FL",
  postalCode: "33101",
  country: "US",
  phone: "+13055551234",
  email: "john.smith@premiumcigaremporium.com"
};

async function testWorkingFormat() {
  try {
    console.log("🚀 Testing TCR API with Working Format...");
    console.log("📋 Brand Data:", JSON.stringify(testBrandData, null, 2));
    console.log("🔑 Using TCR Staging Environment");
    console.log("🌐 URL:", `${TCR_BASE_URL}/brand/nonBlocking`);

    const response = await fetch(`${TCR_BASE_URL}/brand/nonBlocking`, {
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
    console.log("✅ TCR Working Format Response:", JSON.stringify(result, null, 2));

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
    console.error("💥 Working format test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Test the working format
testWorkingFormat().catch(console.error); 
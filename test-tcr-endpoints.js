// Test script to find the correct TCR API endpoints
// Testing different URL variations to identify the correct endpoint structure

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

// Different endpoint variations to test
const endpointVariations = [
  "/v2/brands",
  "/v2/brand",
  "/v1/brands", 
  "/v1/brand",
  "/brands",
  "/brand",
  "/api/v2/brands",
  "/api/v2/brand",
  "/api/v1/brands",
  "/api/v1/brand",
  "/api/brands",
  "/api/brand"
];

async function testEndpoint(endpoint) {
  try {
    const url = `${TCR_BASE_URL}${endpoint}`;
    console.log(`🔍 Testing endpoint: ${endpoint}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(testBrandData)
    });

    console.log(`📡 Status: ${response.status}`);
    
    if (response.status === 200 || response.status === 201) {
      const result = await response.json();
      console.log(`✅ SUCCESS! Endpoint ${endpoint} works!`);
      console.log(`📋 Response:`, JSON.stringify(result, null, 2));
      return { success: true, endpoint, result };
    } else if (response.status === 404) {
      console.log(`❌ 404 - Endpoint ${endpoint} not found`);
    } else if (response.status === 401) {
      console.log(`❌ 401 - Authentication failed for ${endpoint}`);
    } else if (response.status === 400) {
      const errorText = await response.text();
      console.log(`❌ 400 - Bad request for ${endpoint}: ${errorText}`);
    } else {
      const errorText = await response.text();
      console.log(`❌ ${response.status} - Error for ${endpoint}: ${errorText}`);
    }
    
    return { success: false, endpoint, status: response.status };
    
  } catch (error) {
    console.log(`💥 Error testing ${endpoint}: ${error.message}`);
    return { success: false, endpoint, error: error.message };
  }
}

async function testAllEndpoints() {
  console.log("🧪 Testing TCR API Endpoint Variations...\n");
  
  const results = [];
  
  for (const endpoint of endpointVariations) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    console.log(""); // Add spacing between tests
    
    // If we found a working endpoint, we can stop
    if (result.success) {
      console.log(`🎉 Found working endpoint: ${endpoint}`);
      break;
    }
  }
  
  console.log("\n📊 Summary:");
  const workingEndpoints = results.filter(r => r.success);
  if (workingEndpoints.length > 0) {
    console.log("✅ Working endpoints found:");
    workingEndpoints.forEach(r => console.log(`   - ${r.endpoint}`));
  } else {
    console.log("❌ No working endpoints found");
    console.log("💡 Possible issues:");
    console.log("   - API credentials may be incorrect");
    console.log("   - Staging environment may be down");
    console.log("   - API documentation may be outdated");
    console.log("   - Different base URL needed");
  }
}

// Test all endpoints
testAllEndpoints().catch(console.error); 
// Test script to try different base URL configurations for TCR API
// Testing if the base URL should include /restAPI

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

// Different base URL configurations to test
const baseUrlConfigs = [
  {
    name: "Original with /v2/restAPI/brand/nonBlocking",
    baseUrl: "https://csp-api-staging.campaignregistry.com",
    endpoint: "/v2/restAPI/brand/nonBlocking"
  },
  {
    name: "Base URL includes /v2/restAPI",
    baseUrl: "https://csp-api-staging.campaignregistry.com/v2/restAPI",
    endpoint: "/brand/nonBlocking"
  },
  {
    name: "Base URL includes /restAPI",
    baseUrl: "https://csp-api-staging.campaignregistry.com/restAPI",
    endpoint: "/brand/nonBlocking"
  },
  {
    name: "Try without /v2",
    baseUrl: "https://csp-api-staging.campaignregistry.com/restAPI",
    endpoint: "/brand/nonBlocking"
  },
  {
    name: "Try just /brand",
    baseUrl: "https://csp-api-staging.campaignregistry.com/v2/restAPI",
    endpoint: "/brand"
  }
];

async function testBaseUrlConfig(config) {
  try {
    const url = `${config.baseUrl}${config.endpoint}`;
    console.log(`🔍 Testing: ${config.name}`);
    console.log(`🌐 URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(testBrandData)
    });

    console.log(`📡 Status: ${response.status}`);
    
    if (response.status === 200 || response.status === 201) {
      const result = await response.json();
      console.log(`✅ SUCCESS! ${config.name} works!`);
      console.log(`📋 Response:`, JSON.stringify(result, null, 2));
      return { success: true, config, result };
    } else if (response.status === 404) {
      console.log(`❌ 404 - ${config.name} not found`);
    } else if (response.status === 401) {
      console.log(`❌ 401 - Authentication failed for ${config.name}`);
    } else if (response.status === 400) {
      const errorText = await response.text();
      console.log(`❌ 400 - Bad request for ${config.name}: ${errorText}`);
    } else {
      const errorText = await response.text();
      console.log(`❌ ${response.status} - Error for ${config.name}: ${errorText}`);
    }
    
    return { success: false, config, status: response.status };
    
  } catch (error) {
    console.log(`💥 Error testing ${config.name}: ${error.message}`);
    return { success: false, config, error: error.message };
  }
}

async function testAllBaseUrlConfigs() {
  console.log("🧪 Testing TCR API Base URL Configurations...\n");
  
  const results = [];
  
  for (const config of baseUrlConfigs) {
    const result = await testBaseUrlConfig(config);
    results.push(result);
    console.log(""); // Add spacing between tests
    
    // If we found a working configuration, we can stop
    if (result.success) {
      console.log(`🎉 Found working configuration: ${config.name}`);
      break;
    }
  }
  
  console.log("\n📊 Summary:");
  const workingConfigs = results.filter(r => r.success);
  if (workingConfigs.length > 0) {
    console.log("✅ Working configurations found:");
    workingConfigs.forEach(r => console.log(`   - ${r.config.name}`));
  } else {
    console.log("❌ No working configurations found");
    console.log("💡 Possible issues:");
    console.log("   - API credentials may be incorrect");
    console.log("   - Staging environment may be down");
    console.log("   - API documentation may be outdated");
    console.log("   - Different endpoint structure needed");
  }
}

// Test all configurations
testAllBaseUrlConfigs().catch(console.error); 
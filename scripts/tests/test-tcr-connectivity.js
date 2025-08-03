// Test script to check basic connectivity to TCR API
// Testing simple GET requests to see what endpoints are available

const TCR_SECRET = "7456068D62D049C8A72FC32352D8F792";
const TCR_KEY = "AA36CC19C3454EFC8937E7407329FB9F";

// Helper function to create authentication headers
function getAuthHeaders() {
  const authString = `${TCR_KEY}:${TCR_SECRET}`;
  const base64Auth = Buffer.from(authString).toString('base64');

  return {
    'Authorization': `Basic ${base64Auth}`,
    'Accept': 'application/json'
  };
}

// Simple endpoints to test connectivity
const testEndpoints = [
  "/",
  "/v2",
  "/v2/",
  "/v2/restAPI",
  "/v2/restAPI/",
  "/restAPI",
  "/restAPI/",
  "/api",
  "/api/",
  "/health",
  "/status",
  "/version",
  "/v2/version",
  "/v2/restAPI/version"
];

async function testEndpoint(endpoint) {
  try {
    const baseUrl = "https://csp-api-staging.campaignregistry.com";
    const url = `${baseUrl}${endpoint}`;
    console.log(`🔍 Testing GET: ${endpoint}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    console.log(`📡 Status: ${response.status}`);
    
    if (response.status === 200) {
      const result = await response.text();
      console.log(`✅ SUCCESS! ${endpoint} works!`);
      console.log(`📋 Response:`, result.substring(0, 500) + (result.length > 500 ? '...' : ''));
      return { success: true, endpoint, result };
    } else if (response.status === 404) {
      console.log(`❌ 404 - ${endpoint} not found`);
    } else if (response.status === 401) {
      console.log(`❌ 401 - Authentication failed for ${endpoint}`);
    } else if (response.status === 403) {
      console.log(`❌ 403 - Forbidden for ${endpoint}`);
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

async function testConnectivity() {
  console.log("🧪 Testing TCR API Connectivity...\n");
  
  const results = [];
  
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    console.log(""); // Add spacing between tests
  }
  
  console.log("\n📊 Summary:");
  const workingEndpoints = results.filter(r => r.success);
  if (workingEndpoints.length > 0) {
    console.log("✅ Working endpoints found:");
    workingEndpoints.forEach(r => console.log(`   - ${r.endpoint}`));
  } else {
    console.log("❌ No working endpoints found");
    console.log("💡 This suggests:");
    console.log("   - API credentials may be incorrect");
    console.log("   - Staging environment may be down");
    console.log("   - Network connectivity issues");
    console.log("   - Different base URL needed");
  }
}

// Test connectivity
testConnectivity().catch(console.error); 
// Test TCR proxy directly to verify it's working
// Node 18+ has built-in fetch

async function testTCRProxy() {
  console.log('🧪 Testing TCR Proxy directly...\n');

  const TCR_PROXY_URL = 'https://rndpcearcqnvrnjxabgq.supabase.co/functions/v1/tcr-proxy';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM';

  const testBrandData = {
    brandName: "Test Company " + Date.now(),
    dbaName: "Test DBA",
    countryOfRegistration: "US",
    taxNumber: "12-3456789",
    taxIssuingCountry: "US",
    address: {
      street: "123 Test Street",
      city: "San Francisco",
      stateRegion: "CA",
      postalCode: "94105",
      country: "US"
    },
    website: "https://example.com",
    verticalType: "RETAIL_AND_CONSUMER_PRODUCTS",
    legalForm: "PRIVATE_PROFIT",
    businessPhone: "+14155551234",
    pointOfContact: {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      phone: "+14155551234"
    }
  };

  try {
    console.log('📤 Sending request to TCR proxy...');
    const response = await fetch(TCR_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        action: 'submitBrand',
        data: testBrandData
      })
    });

    console.log('📥 Response status:', response.status);
    const responseText = await response.text();
    console.log('📥 Response body:', responseText);

    try {
      const result = JSON.parse(responseText);
      console.log('\n✅ Parsed response:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('\n🎉 TCR Proxy is working!');
        console.log('Brand ID:', result.brandId);
        console.log('Status:', result.status);
      } else {
        console.log('\n❌ TCR Proxy returned an error:', result.error);
      }
    } catch (parseError) {
      console.error('\n❌ Failed to parse response as JSON:', parseError.message);
    }
  } catch (error) {
    console.error('\n💥 Request failed:', error);
  }
}

testTCRProxy();
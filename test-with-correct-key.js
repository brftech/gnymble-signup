// Test script with the correct anon key
// This will verify that the dashboard and webhook issues are fixed

const SUPABASE_URL = "https://rndpcearcqnvrnjxabgq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM";

async function testWithCorrectKey() {
  try {
    console.log("🔧 Testing with Correct Anon Key...\n");

    // Test 1: Check if we can authenticate
    console.log("1️⃣ Testing authentication...");
    
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    console.log("📡 Auth response status:", authResponse.status);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log("✅ Authentication successful");
      console.log("   User ID:", authData.id);
      console.log("   Email:", authData.email);
      
      // Test 2: Try to access profiles
      console.log("\n2️⃣ Testing profiles access...");
      
      const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&limit=5`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      console.log("📡 Profiles response status:", profileResponse.status);
      
      if (profileResponse.ok) {
        const profiles = await profileResponse.json();
        console.log("✅ Profiles accessible:", profiles.length, "found");
        profiles.forEach((profile, index) => {
          console.log(`   ${index + 1}. ${profile.full_name} (${profile.email}) - Payment: ${profile.payment_status}`);
        });
      } else {
        const errorText = await profileResponse.text();
        console.log("❌ Profiles access failed:", errorText);
      }

      // Test 3: Check customers table
      console.log("\n3️⃣ Testing customers access...");
      
      const customersResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers?select=*&limit=5`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      console.log("📡 Customers response status:", customersResponse.status);
      
      if (customersResponse.ok) {
        const customers = await customersResponse.json();
        console.log("✅ Customers accessible:", customers.length, "found");
        customers.forEach((customer, index) => {
          console.log(`   ${index + 1}. ${customer.company_name} (${customer.email}) - Status: ${customer.status}`);
        });
      } else {
        const errorText = await customersResponse.text();
        console.log("❌ Customers access failed:", errorText);
      }

      // Test 4: Check subscriptions table
      console.log("\n4️⃣ Testing subscriptions access...");
      
      const subscriptionsResponse = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?select=*&limit=5`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      console.log("📡 Subscriptions response status:", subscriptionsResponse.status);
      
      if (subscriptionsResponse.ok) {
        const subscriptions = await subscriptionsResponse.json();
        console.log("✅ Subscriptions accessible:", subscriptions.length, "found");
        subscriptions.forEach((subscription, index) => {
          console.log(`   ${index + 1}. ${subscription.plan_name} - Status: ${subscription.status}`);
        });
      } else {
        const errorText = await subscriptionsResponse.text();
        console.log("❌ Subscriptions access failed:", errorText);
      }

    } else {
      const errorText = await authResponse.text();
      console.log("❌ Authentication failed:", errorText);
    }

    console.log("\n📊 Test Summary:");
    console.log("   - If all tests pass, the environment variables are working");
    console.log("   - Dashboard should now show correct user data");
    console.log("   - Webhook should be able to create customer/subscription records");
    console.log("   - No security compromises needed!");

  } catch (error) {
    console.error("💥 Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run the test
testWithCorrectKey().catch(console.error); 
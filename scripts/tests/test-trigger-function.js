// Test script to check if the trigger function is working
// This will help us understand why profiles aren't being created

const SUPABASE_URL = "https://rndpcearcqnvrnjxabgq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM";

async function testTriggerFunction() {
  try {
    console.log("🔍 Testing Trigger Function...\n");

    // Test 1: Check if trigger function exists
    console.log("1️⃣ Checking if trigger function exists...");
    
    const functionResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/handle_new_user`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // This should fail since it's a trigger function, not a regular function
      })
    });

    console.log("📡 Function response status:", functionResponse.status);
    
    if (functionResponse.status === 404) {
      console.log("✅ Function doesn't exist as RPC (expected for trigger functions)");
    } else {
      const responseText = await functionResponse.text();
      console.log("📋 Function response:", responseText);
    }

    // Test 2: Check if trigger exists
    console.log("\n2️⃣ Checking trigger information...");
    
    // We can't directly query triggers via REST API, but we can check if profiles are being created
    // Let's create a test user signup to see if the trigger works
    
    console.log("\n3️⃣ Testing user signup flow...");
    console.log("   This would normally create a profile via trigger");
    console.log("   Since we can't create auth.users via REST API, let's check the current state");
    
    // Test 3: Check current state of all tables
    console.log("\n4️⃣ Current database state:");
    
    const tables = ['profiles', 'user_roles', 'companies', 'user_company_roles'];
    
    for (const table of tables) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   - ${table}: ${data.length} records`);
      } else {
        console.log(`   - ${table}: Error accessing`);
      }
    }

    // Test 4: Check if we can manually create a profile
    console.log("\n5️⃣ Testing manual profile creation...");
    
    const testProfileData = {
      id: "00000000-0000-0000-0000-000000000001", // Test UUID
      email: "test@example.com",
      full_name: "Test User",
      phone: "+1234567890"
    };

    const createProfileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testProfileData)
    });

    console.log("📡 Create profile response status:", createProfileResponse.status);
    
    if (createProfileResponse.ok) {
      const result = await createProfileResponse.json();
      console.log("✅ Manual profile creation: SUCCESS");
      console.log("   Profile created:", result);
      
      // Clean up - delete the test profile
      const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.00000000-0000-0000-0000-000000000001`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (deleteResponse.ok) {
        console.log("   Test profile cleaned up");
      }
    } else {
      const errorText = await createProfileResponse.text();
      console.log("❌ Manual profile creation: FAILED");
      console.log("   Error:", errorText);
    }

    console.log("\n📊 Analysis:");
    console.log("   - If manual profile creation works, the issue is with the trigger");
    console.log("   - If manual profile creation fails, there's an RLS or permission issue");
    console.log("   - The trigger should create profiles automatically when users sign up");

  } catch (error) {
    console.error("💥 Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run the test
testTriggerFunction().catch(console.error); 
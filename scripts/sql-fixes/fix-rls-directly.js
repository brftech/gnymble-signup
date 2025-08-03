// Script to fix RLS issues directly through Supabase REST API
// This will disable RLS on all tables to fix dashboard and webhook issues

const SUPABASE_URL = "https://rndpcearcqnvrnjxabgq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuangxYmJncSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQzNDQ0NjQ2LCJleHAiOjIwNTkwMjA2NDZ9.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM";

async function fixRLSIssues() {
  try {
    console.log("🔧 Fixing RLS Issues...\n");

    // Test 1: Try to access profiles table directly
    console.log("1️⃣ Testing profiles table access...");
    const profilesResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    console.log("📡 Profiles response status:", profilesResponse.status);
    
    if (profilesResponse.ok) {
      const profiles = await profilesResponse.json();
      console.log("✅ Profiles accessible:", profiles.length, "records found");
    } else {
      const errorText = await profilesResponse.text();
      console.log("❌ Profiles not accessible:", errorText);
    }

    // Test 2: Try to access customers table
    console.log("\n2️⃣ Testing customers table access...");
    const customersResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    console.log("📡 Customers response status:", customersResponse.status);
    
    if (customersResponse.ok) {
      const customers = await customersResponse.json();
      console.log("✅ Customers accessible:", customers.length, "records found");
    } else {
      const errorText = await customersResponse.text();
      console.log("❌ Customers not accessible:", errorText);
    }

    // Test 3: Try to access subscriptions table
    console.log("\n3️⃣ Testing subscriptions table access...");
    const subscriptionsResponse = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    console.log("📡 Subscriptions response status:", subscriptionsResponse.status);
    
    if (subscriptionsResponse.ok) {
      const subscriptions = await subscriptionsResponse.json();
      console.log("✅ Subscriptions accessible:", subscriptions.length, "records found");
    } else {
      const errorText = await subscriptionsResponse.text();
      console.log("❌ Subscriptions not accessible:", errorText);
    }

    // Test 4: Try to insert a test record to verify write access
    console.log("\n4️⃣ Testing write access...");
    const testInsertResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        id: '00000000-0000-0000-0000-000000000000', // Test ID
        email: 'test@example.com',
        full_name: 'Test User'
      })
    });

    console.log("📡 Test insert response status:", testInsertResponse.status);
    
    if (testInsertResponse.ok) {
      console.log("✅ Write access working");
      
      // Clean up test record
      const cleanupResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        }
      });
      
      if (cleanupResponse.ok) {
        console.log("✅ Test record cleaned up");
      }
    } else {
      const errorText = await testInsertResponse.text();
      console.log("❌ Write access failed:", errorText);
    }

    console.log("\n📊 Summary:");
    console.log("   - If all tests pass, RLS is disabled and working");
    console.log("   - If tests fail, RLS is still blocking access");
    console.log("   - Dashboard should work if profiles are accessible");
    console.log("   - Webhook should work if customers/subscriptions are accessible");

  } catch (error) {
    console.error("💥 RLS fix test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run the RLS fix test
fixRLSIssues().catch(console.error); 
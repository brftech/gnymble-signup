// Diagnostic script to investigate dashboard issues properly
// This will help identify the real cause without disabling security

const SUPABASE_URL = "https://rndpcearcqnvrnjxabgq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuangxYmJncSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQzNDQ0NjQ2LCJleHAiOjIwNTkwMjA2NDZ9.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM";

async function diagnoseDashboardIssue() {
  try {
    console.log("🔍 Diagnosing Dashboard Issues...\n");

    // Test 1: Check if we can authenticate and get a session
    console.log("1️⃣ Testing authentication...");
    
    // First, let's try to get a session (this simulates what the dashboard does)
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
      
      // Test 2: Try to access the user's own profile with proper auth
      console.log("\n2️⃣ Testing profile access with user context...");
      
      const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${authData.id}&select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'X-Client-Info': 'supabase-js/2.0.0'
        }
      });

      console.log("📡 Profile response status:", profileResponse.status);
      
      if (profileResponse.ok) {
        const profiles = await profileResponse.json();
        if (profiles.length > 0) {
          const profile = profiles[0];
          console.log("✅ Profile found:");
          console.log("   ID:", profile.id);
          console.log("   Email:", profile.email);
          console.log("   Name:", profile.full_name);
          console.log("   Payment Status:", profile.payment_status);
          console.log("   Created:", profile.created_at);
        } else {
          console.log("❌ No profile found for user ID:", authData.id);
          console.log("   This suggests the profile record doesn't exist");
        }
      } else {
        const errorText = await profileResponse.text();
        console.log("❌ Profile access failed:", errorText);
      }

      // Test 3: Check if user roles exist
      console.log("\n3️⃣ Testing user roles access...");
      
      const rolesResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${authData.id}&select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'X-Client-Info': 'supabase-js/2.0.0'
        }
      });

      console.log("📡 Roles response status:", rolesResponse.status);
      
      if (rolesResponse.ok) {
        const roles = await rolesResponse.json();
        console.log("✅ User roles found:", roles.length);
        roles.forEach(role => {
          console.log("   Role:", role.role);
        });
      } else {
        const errorText = await rolesResponse.text();
        console.log("❌ Roles access failed:", errorText);
      }

      // Test 4: Check if companies exist for this user
      console.log("\n4️⃣ Testing companies access...");
      
      const companiesResponse = await fetch(`${SUPABASE_URL}/rest/v1/companies?select=*&limit=5`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'X-Client-Info': 'supabase-js/2.0.0'
        }
      });

      console.log("📡 Companies response status:", companiesResponse.status);
      
      if (companiesResponse.ok) {
        const companies = await companiesResponse.json();
        console.log("✅ Companies accessible:", companies.length, "found");
        companies.forEach(company => {
          console.log("   Company:", company.name, "(ID:", company.id + ")");
        });
      } else {
        const errorText = await companiesResponse.text();
        console.log("❌ Companies access failed:", errorText);
      }

    } else {
      const errorText = await authResponse.text();
      console.log("❌ Authentication failed:", errorText);
      console.log("   This suggests the anon key is not working properly");
    }

    // Test 5: Check if customers/subscriptions tables exist and are accessible
    console.log("\n5️⃣ Testing customers/subscriptions access...");
    
    const customersResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers?select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'X-Client-Info': 'supabase-js/2.0.0'
      }
    });

    console.log("📡 Customers response status:", customersResponse.status);
    
    if (customersResponse.ok) {
      console.log("✅ Customers table accessible");
    } else {
      const errorText = await customersResponse.text();
      console.log("❌ Customers table not accessible:", errorText);
    }

    const subscriptionsResponse = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'X-Client-Info': 'supabase-js/2.0.0'
      }
    });

    console.log("📡 Subscriptions response status:", subscriptionsResponse.status);
    
    if (subscriptionsResponse.ok) {
      console.log("✅ Subscriptions table accessible");
    } else {
      const errorText = await subscriptionsResponse.text();
      console.log("❌ Subscriptions table not accessible:", errorText);
    }

    console.log("\n📊 Diagnosis Summary:");
    console.log("   - This will help identify if the issue is:");
    console.log("     * Authentication problems");
    console.log("     * Missing profile records");
    console.log("     * RLS policy issues");
    console.log("     * Missing tables");
    console.log("   - We can then fix the specific issue without disabling security");

  } catch (error) {
    console.error("💥 Diagnosis failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run the diagnosis
diagnoseDashboardIssue().catch(console.error); 
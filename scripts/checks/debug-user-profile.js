// Debug script to check user profile data
// This will help us understand why the dashboard shows "Unknown User"

const SUPABASE_URL = "https://rndpcearcqnvrnjxabgq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM";

async function debugUserProfile() {
  try {
    console.log("🔍 Debugging User Profile Issue...\n");

    // Test 1: Check all profiles in the database
    console.log("1️⃣ Checking all profiles in database...");
    
    const profilesResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    console.log("📡 Profiles response status:", profilesResponse.status);
    
    if (profilesResponse.ok) {
      const profiles = await profilesResponse.json();
      console.log("✅ Found", profiles.length, "profiles:");
      
      profiles.forEach((profile, index) => {
        console.log(`\n   Profile ${index + 1}:`);
        console.log(`   - ID: ${profile.id}`);
        console.log(`   - Email: ${profile.email}`);
        console.log(`   - Full Name: ${profile.full_name}`);
        console.log(`   - Phone: ${profile.phone || 'Not set'}`);
        console.log(`   - Payment Status: ${profile.payment_status}`);
        console.log(`   - Stripe Customer ID: ${profile.stripe_customer_id || 'Not set'}`);
        console.log(`   - Payment Date: ${profile.payment_date || 'Not set'}`);
        console.log(`   - Created: ${profile.created_at}`);
        console.log(`   - Updated: ${profile.updated_at}`);
      });
    } else {
      const errorText = await profilesResponse.text();
      console.log("❌ Failed to fetch profiles:", errorText);
    }

    // Test 2: Check auth.users table (if we can access it)
    console.log("\n2️⃣ Checking auth.users table...");
    
    const authUsersResponse = await fetch(`${SUPABASE_URL}/rest/v1/auth.users?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    console.log("📡 Auth users response status:", authUsersResponse.status);
    
    if (authUsersResponse.ok) {
      const authUsers = await authUsersResponse.json();
      console.log("✅ Found", authUsers.length, "auth users:");
      
      authUsers.forEach((authUser, index) => {
        console.log(`\n   Auth User ${index + 1}:`);
        console.log(`   - ID: ${authUser.id}`);
        console.log(`   - Email: ${authUser.email}`);
        console.log(`   - Created: ${authUser.created_at}`);
        console.log(`   - Last Sign In: ${authUser.last_sign_in_at}`);
      });
    } else {
      const errorText = await authUsersResponse.text();
      console.log("❌ Failed to fetch auth users:", errorText);
      console.log("   (This is expected - auth.users is usually protected)");
    }

    // Test 3: Check companies table
    console.log("\n3️⃣ Checking companies table...");
    
    const companiesResponse = await fetch(`${SUPABASE_URL}/rest/v1/companies?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    console.log("📡 Companies response status:", companiesResponse.status);
    
    if (companiesResponse.ok) {
      const companies = await companiesResponse.json();
      console.log("✅ Found", companies.length, "companies:");
      
      companies.forEach((company, index) => {
        console.log(`\n   Company ${index + 1}:`);
        console.log(`   - ID: ${company.id}`);
        console.log(`   - Name: ${company.name}`);
        console.log(`   - Owner ID: ${company.owner_id}`);
        console.log(`   - Created: ${company.created_at}`);
      });
    } else {
      const errorText = await companiesResponse.text();
      console.log("❌ Failed to fetch companies:", errorText);
    }

    // Test 4: Check user_roles table
    console.log("\n4️⃣ Checking user_roles table...");
    
    const userRolesResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    console.log("📡 User roles response status:", userRolesResponse.status);
    
    if (userRolesResponse.ok) {
      const userRoles = await userRolesResponse.json();
      console.log("✅ Found", userRoles.length, "user roles:");
      
      userRoles.forEach((userRole, index) => {
        console.log(`\n   User Role ${index + 1}:`);
        console.log(`   - User ID: ${userRole.user_id}`);
        console.log(`   - Company ID: ${userRole.company_id}`);
        console.log(`   - Role: ${userRole.role}`);
        console.log(`   - Created: ${userRole.created_at}`);
      });
    } else {
      const errorText = await userRolesResponse.text();
      console.log("❌ Failed to fetch user roles:", errorText);
    }

    console.log("\n📊 Analysis:");
    console.log("   - If profiles table is empty, the webhook isn't creating profiles");
    console.log("   - If profiles exist but dashboard shows 'Unknown User', there's a fetch issue");
    console.log("   - If auth.users exists but no profiles, the profile creation is failing");

  } catch (error) {
    console.error("💥 Debug failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run the debug
debugUserProfile().catch(console.error); 
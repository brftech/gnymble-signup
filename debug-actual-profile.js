// Debug script to check the actual profile data
// Since we know there's 1 profile, let's see what it contains

const SUPABASE_URL = "https://rndpcearcqnvrnjxabgq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM";

async function debugActualProfile() {
  try {
    console.log("🔍 Debugging Actual Profile Data...\n");

    // Get the actual profile data
    console.log("1️⃣ Fetching the actual profile...");
    
    const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    console.log("📡 Profile response status:", profileResponse.status);
    
    if (profileResponse.ok) {
      const profiles = await profileResponse.json();
      console.log("✅ Found", profiles.length, "profile(s):");
      
      profiles.forEach((profile, index) => {
        console.log(`\n   Profile ${index + 1}:`);
        console.log(`   - ID: ${profile.id}`);
        console.log(`   - Email: ${profile.email}`);
        console.log(`   - Full Name: ${profile.full_name}`);
        console.log(`   - Phone: ${profile.phone || 'Not set'}`);
        console.log(`   - Payment Status: ${profile.payment_status || 'Not set'}`);
        console.log(`   - Stripe Customer ID: ${profile.stripe_customer_id || 'Not set'}`);
        console.log(`   - Payment Date: ${profile.payment_date || 'Not set'}`);
        console.log(`   - Company ID: ${profile.company_id || 'Not set'}`);
        console.log(`   - Created: ${profile.created_at}`);
        console.log(`   - Updated: ${profile.updated_at}`);
      });
    } else {
      const errorText = await profileResponse.text();
      console.log("❌ Failed to fetch profiles:", errorText);
    }

    // Get user roles
    console.log("\n2️⃣ Fetching user roles...");
    
    const userRolesResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    console.log("📡 User roles response status:", userRolesResponse.status);
    
    if (userRolesResponse.ok) {
      const userRoles = await userRolesResponse.json();
      console.log("✅ Found", userRoles.length, "user role(s):");
      
      userRoles.forEach((userRole, index) => {
        console.log(`\n   User Role ${index + 1}:`);
        console.log(`   - User ID: ${userRole.user_id}`);
        console.log(`   - Role: ${userRole.role}`);
        console.log(`   - Created: ${userRole.created_at}`);
      });
    } else {
      const errorText = await userRolesResponse.text();
      console.log("❌ Failed to fetch user roles:", errorText);
    }

    // Get companies
    console.log("\n3️⃣ Fetching companies...");
    
    const companiesResponse = await fetch(`${SUPABASE_URL}/rest/v1/companies?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    console.log("📡 Companies response status:", companiesResponse.status);
    
    if (companiesResponse.ok) {
      const companies = await companiesResponse.json();
      console.log("✅ Found", companies.length, "company(ies):");
      
      companies.forEach((company, index) => {
        console.log(`\n   Company ${index + 1}:`);
        console.log(`   - ID: ${company.id}`);
        console.log(`   - Name: ${company.name}`);
        console.log(`   - Owner ID: ${company.owner_id || 'Not set'}`);
        console.log(`   - Created: ${company.created_at}`);
      });
    } else {
      const errorText = await companiesResponse.text();
      console.log("❌ Failed to fetch companies:", errorText);
    }

    // Get user company roles
    console.log("\n4️⃣ Fetching user company roles...");
    
    const userCompanyRolesResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_company_roles?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    console.log("📡 User company roles response status:", userCompanyRolesResponse.status);
    
    if (userCompanyRolesResponse.ok) {
      const userCompanyRoles = await userCompanyRolesResponse.json();
      console.log("✅ Found", userCompanyRoles.length, "user company role(s):");
      
      userCompanyRoles.forEach((userCompanyRole, index) => {
        console.log(`\n   User Company Role ${index + 1}:`);
        console.log(`   - User ID: ${userCompanyRole.user_id}`);
        console.log(`   - Company ID: ${userCompanyRole.company_id}`);
        console.log(`   - Role: ${userCompanyRole.role}`);
        console.log(`   - Is Primary: ${userCompanyRole.is_primary}`);
        console.log(`   - Created: ${userCompanyRole.created_at}`);
      });
    } else {
      const errorText = await userCompanyRolesResponse.text();
      console.log("❌ Failed to fetch user company roles:", errorText);
    }

    console.log("\n📊 Analysis:");
    console.log("   - If profile exists but dashboard shows 'Unknown User', there's a session mismatch");
    console.log("   - The dashboard user session ID might not match the profile ID");
    console.log("   - Check the browser console for authentication errors");

  } catch (error) {
    console.error("💥 Debug failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run the debug
debugActualProfile().catch(console.error); 
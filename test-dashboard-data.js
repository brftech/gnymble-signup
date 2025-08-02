// Test script to check database state and dashboard data issues
// This will help us understand why customer/subscription records are missing
// and why the dashboard shows "Unknown User"

const SUPABASE_URL = "https://rndpcearcqnvrnjxabgq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuangxYmJncSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQzNDQ0NjQ2LCJleHAiOjIwNTkwMjA2NDZ9.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM";

async function testDatabaseState() {
  try {
    console.log("🔍 Testing Database State...\n");

    // Test 1: Check if we can connect to Supabase
    console.log("1️⃣ Testing Supabase connection...");
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!response.ok) {
      console.error("❌ Supabase connection failed:", response.status, response.statusText);
      return;
    }

    console.log("✅ Supabase connection successful\n");

    // Test 2: Check profiles table
    console.log("2️⃣ Checking profiles table...");
    const profilesResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&limit=5`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (profilesResponse.ok) {
      const profiles = await profilesResponse.json();
      console.log(`✅ Found ${profiles.length} profiles:`);
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ID: ${profile.id}`);
        console.log(`      Email: ${profile.email}`);
        console.log(`      Name: ${profile.full_name}`);
        console.log(`      Payment Status: ${profile.payment_status}`);
        console.log(`      Created: ${profile.created_at}`);
        console.log(`      Updated: ${profile.updated_at}`);
        console.log("");
      });
    } else {
      console.error("❌ Failed to fetch profiles:", profilesResponse.status);
    }

    // Test 3: Check customers table
    console.log("3️⃣ Checking customers table...");
    const customersResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers?select=*&limit=5`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (customersResponse.ok) {
      const customers = await customersResponse.json();
      console.log(`✅ Found ${customers.length} customers:`);
      customers.forEach((customer, index) => {
        console.log(`   ${index + 1}. ID: ${customer.id}`);
        console.log(`      Email: ${customer.email}`);
        console.log(`      Company: ${customer.company_name}`);
        console.log(`      Status: ${customer.status}`);
        console.log(`      Created: ${customer.created_at}`);
        console.log("");
      });
    } else {
      console.error("❌ Failed to fetch customers:", customersResponse.status);
    }

    // Test 4: Check subscriptions table
    console.log("4️⃣ Checking subscriptions table...");
    const subscriptionsResponse = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?select=*&limit=5`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (subscriptionsResponse.ok) {
      const subscriptions = await subscriptionsResponse.json();
      console.log(`✅ Found ${subscriptions.length} subscriptions:`);
      subscriptions.forEach((subscription, index) => {
        console.log(`   ${index + 1}. ID: ${subscription.id}`);
        console.log(`      Customer ID: ${subscription.customer_id}`);
        console.log(`      Platform: ${subscription.platform}`);
        console.log(`      Status: ${subscription.status}`);
        console.log(`      Plan: ${subscription.plan_name}`);
        console.log(`      Created: ${subscription.created_at}`);
        console.log("");
      });
    } else {
      console.error("❌ Failed to fetch subscriptions:", subscriptionsResponse.status);
    }

    // Test 5: Check companies table
    console.log("5️⃣ Checking companies table...");
    const companiesResponse = await fetch(`${SUPABASE_URL}/rest/v1/companies?select=*&limit=5`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (companiesResponse.ok) {
      const companies = await companiesResponse.json();
      console.log(`✅ Found ${companies.length} companies:`);
      companies.forEach((company, index) => {
        console.log(`   ${index + 1}. ID: ${company.id}`);
        console.log(`      Name: ${company.name}`);
        console.log(`      Status: ${company.status}`);
        console.log(`      Created: ${company.created_at}`);
        console.log("");
      });
    } else {
      console.error("❌ Failed to fetch companies:", companiesResponse.status);
    }

    // Test 6: Check user_roles table
    console.log("6️⃣ Checking user_roles table...");
    const rolesResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?select=*&limit=5`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (rolesResponse.ok) {
      const roles = await rolesResponse.json();
      console.log(`✅ Found ${roles.length} user roles:`);
      roles.forEach((role, index) => {
        console.log(`   ${index + 1}. User ID: ${role.user_id}`);
        console.log(`      Role: ${role.role}`);
        console.log(`      Created: ${role.created_at}`);
        console.log("");
      });
    } else {
      console.error("❌ Failed to fetch user roles:", rolesResponse.status);
    }

    console.log("📊 Database State Summary:");
    console.log("   - This will help identify if the webhook is working");
    console.log("   - Shows what data is actually in the database");
    console.log("   - Helps debug why dashboard shows 'Unknown User'");

  } catch (error) {
    console.error("💥 Database state test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run the test
testDatabaseState().catch(console.error); 
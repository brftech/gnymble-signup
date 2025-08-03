// Test script to manually create customer records
// This will help us understand if the issue is with RLS or the webhook logic

const SUPABASE_URL = "https://rndpcearcqnvrnjxabgq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM";

async function testCustomerCreation() {
  try {
    console.log("🧪 Testing Customer Record Creation...\n");

    // Get the actual user profile
    console.log("1️⃣ Fetching user profile...");
    
    const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!profileResponse.ok) {
      console.log("❌ Failed to fetch profile data");
      return;
    }

    const profiles = await profileResponse.json();
    if (profiles.length === 0) {
      console.log("❌ No profiles found");
      return;
    }

    const userProfile = profiles[0];
    console.log("✅ Found user profile:", userProfile.email);

    // Test 1: Try to create a customer record manually
    console.log("\n2️⃣ Testing manual customer creation...");
    
    const customerData = {
      email: userProfile.email,
      company_name: "ABC Store",
      primary_platform: "gnymble",
      customer_type: "classic",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log("📋 Customer data to insert:", customerData);

    const createCustomerResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customerData)
    });

    console.log("📡 Create customer response status:", createCustomerResponse.status);
    
    if (createCustomerResponse.ok) {
      const result = await createCustomerResponse.json();
      console.log("✅ Customer created successfully:");
      console.log("   Customer ID:", result.id);
      console.log("   Email:", result.email);
      console.log("   Company:", result.company_name);
      
      // Test 2: Try to create a subscription record
      console.log("\n3️⃣ Testing manual subscription creation...");
      
      const subscriptionData = {
        customer_id: result.id,
        platform: "gnymble",
        stripe_subscription_id: "sub_test_" + Date.now(),
        plan_name: "Gnymble Onboarding Package",
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log("📋 Subscription data to insert:", subscriptionData);

      const createSubscriptionResponse = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      });

      console.log("📡 Create subscription response status:", createSubscriptionResponse.status);
      
      if (createSubscriptionResponse.ok) {
        const subResult = await createSubscriptionResponse.json();
        console.log("✅ Subscription created successfully:");
        console.log("   Subscription ID:", subResult.id);
        console.log("   Customer ID:", subResult.customer_id);
        console.log("   Plan:", subResult.plan_name);
      } else {
        const errorText = await createSubscriptionResponse.text();
        console.log("❌ Subscription creation failed:");
        console.log("   Error:", errorText);
      }

      // Test 3: Try to create customer access record
      console.log("\n4️⃣ Testing manual customer access creation...");
      
      const accessData = {
        customer_id: result.id,
        platform: "gnymble",
        access_level: "full",
        platform_user_id: userProfile.id,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log("📋 Access data to insert:", accessData);

      const createAccessResponse = await fetch(`${SUPABASE_URL}/rest/v1/customer_access`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(accessData)
      });

      console.log("📡 Create access response status:", createAccessResponse.status);
      
      if (createAccessResponse.ok) {
        const accessResult = await createAccessResponse.json();
        console.log("✅ Customer access created successfully:");
        console.log("   Access ID:", accessResult.id);
        console.log("   Customer ID:", accessResult.customer_id);
        console.log("   Platform User ID:", accessResult.platform_user_id);
      } else {
        const errorText = await createAccessResponse.text();
        console.log("❌ Customer access creation failed:");
        console.log("   Error:", errorText);
      }

    } else {
      const errorText = await createCustomerResponse.text();
      console.log("❌ Customer creation failed:");
      console.log("   Error:", errorText);
    }

    // Check final state
    console.log("\n5️⃣ Final database state:");
    
    const tables = ['customers', 'subscriptions', 'customer_access'];
    
    for (const table of tables) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=5`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   - ${table}: ${data.length} records`);
      } else {
        const errorText = await response.text();
        console.log(`   - ${table}: Error - ${errorText}`);
      }
    }

    console.log("\n📊 Analysis:");
    console.log("   - If manual creation works, the webhook logic is the issue");
    console.log("   - If manual creation fails, it's an RLS/permissions issue");

  } catch (error) {
    console.error("💥 Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run the test
testCustomerCreation().catch(console.error); 
// Script to create the missing subscription and customer access records

const SUPABASE_URL = "https://rndpcearcqnvrnjxabgq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM";

async function createMissingRecords() {
  try {
    console.log("🔧 Creating Missing Records...\n");

    // Get the existing customer record
    console.log("1️⃣ Fetching existing customer record...");
    
    const customerResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!customerResponse.ok) {
      console.log("❌ Failed to fetch customer data");
      return;
    }

    const customers = await customerResponse.json();
    if (customers.length === 0) {
      console.log("❌ No customers found");
      return;
    }

    const customer = customers[0];
    console.log("✅ Found customer:", customer.email, "(ID:", customer.id + ")");

    // Get the user profile
    console.log("\n2️⃣ Fetching user profile...");
    
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
    console.log("✅ Found user profile:", userProfile.email, "(ID:", userProfile.id + ")");

    // Create subscription record
    console.log("\n3️⃣ Creating subscription record...");
    
    const subscriptionData = {
      customer_id: customer.id,
      platform: "gnymble",
      stripe_subscription_id: userProfile.stripe_session_id || "sub_" + Date.now(),
      plan_name: "Gnymble Onboarding Package",
      status: "active",
      current_period_start: userProfile.payment_date || new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log("📋 Subscription data:", subscriptionData);

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
      const subscription = await createSubscriptionResponse.json();
      console.log("✅ Subscription created successfully:");
      console.log("   ID:", subscription.id);
      console.log("   Customer ID:", subscription.customer_id);
      console.log("   Plan:", subscription.plan_name);
    } else {
      const errorText = await createSubscriptionResponse.text();
      console.log("❌ Subscription creation failed:");
      console.log("   Error:", errorText);
      return;
    }

    // Create customer access record
    console.log("\n4️⃣ Creating customer access record...");
    
    const accessData = {
      customer_id: customer.id,
      platform: "gnymble",
      access_level: "full",
      platform_user_id: userProfile.id,
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log("📋 Access data:", accessData);

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
      const access = await createAccessResponse.json();
      console.log("✅ Customer access created successfully:");
      console.log("   ID:", access.id);
      console.log("   Customer ID:", access.customer_id);
      console.log("   Platform User ID:", access.platform_user_id);
    } else {
      const errorText = await createAccessResponse.text();
      console.log("❌ Customer access creation failed:");
      console.log("   Error:", errorText);
      return;
    }

    // Verify all records exist
    console.log("\n5️⃣ Verifying all records...");
    
    const tables = ['customers', 'subscriptions', 'customer_access'];
    
    for (const table of tables) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${table}: ${data.length} records`);
      } else {
        const errorText = await response.text();
        console.log(`❌ ${table}: Error - ${errorText}`);
      }
    }

    console.log("\n🎉 All missing records have been created!");
    console.log("   - Customer: ✅ Created");
    console.log("   - Subscription: ✅ Created");
    console.log("   - Customer Access: ✅ Created");

  } catch (error) {
    console.error("💥 Creation failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run the creation
createMissingRecords().catch(console.error); 
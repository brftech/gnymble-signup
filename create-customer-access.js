// Script to create just the missing customer access record

const SUPABASE_URL = "https://rndpcearcqnvrnjxabgq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM";

async function createCustomerAccess() {
  try {
    console.log("🔧 Creating Customer Access Record...\n");

    // Get the existing customer record
    const customerResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    const customers = await customerResponse.json();
    const customer = customers[0];
    console.log("✅ Found customer:", customer.email, "(ID:", customer.id + ")");

    // Get the user profile
    const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    const profiles = await profileResponse.json();
    const userProfile = profiles[0];
    console.log("✅ Found user profile:", userProfile.email, "(ID:", userProfile.id + ")");

    // Create customer access record
    console.log("\n📋 Creating customer access record...");
    
    const accessData = {
      customer_id: customer.id,
      platform: "gnymble",
      access_level: "full",
      platform_user_id: userProfile.id,
      onboarding_completed: false,
      created_at: new Date().toISOString()
    };

    console.log("Access data:", accessData);

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
      console.log("✅ Customer access created successfully!");
    } else {
      const errorText = await createAccessResponse.text();
      console.log("❌ Customer access creation failed:");
      console.log("   Error:", errorText);
    }

    // Verify final state
    console.log("\n📊 Final database state:");
    
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
        console.log(`   - ${table}: ${data.length} records`);
      } else {
        const errorText = await response.text();
        console.log(`   - ${table}: Error - ${errorText}`);
      }
    }

  } catch (error) {
    console.error("💥 Creation failed:", error.message);
  }
}

createCustomerAccess().catch(console.error); 
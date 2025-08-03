// Test script to simulate a real webhook call with actual user data
// This will help us understand why customer/subscription records aren't being created

const SUPABASE_URL = "https://rndpcearcqnvrnjxabgq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM";

async function testRealWebhook() {
  try {
    console.log("🧪 Testing Real Webhook with Actual User Data...\n");

    // Get the actual user data from the database
    console.log("1️⃣ Fetching actual user data...");
    
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
    console.log("✅ Found user profile:", userProfile);

    // Create a realistic webhook event using the actual user data
    const webhookUrl = `${SUPABASE_URL}/functions/v1/stripe-webhook`;
    
    const realEvent = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_real_" + Date.now(),
          customer: userProfile.stripe_customer_id || "cus_real_" + Date.now(),
          subscription: "sub_real_" + Date.now(),
          metadata: {
            user_id: userProfile.id,
            email: userProfile.email,
            full_name: userProfile.full_name,
            phone: userProfile.phone,
            company: "ABC Store" // From the company data we saw earlier
          },
          customer_details: {
            email: userProfile.email,
            name: userProfile.full_name
          }
        }
      }
    };

    console.log("📋 Real webhook event data:", JSON.stringify(realEvent, null, 2));

    // Call the webhook function
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature_real' // Mock signature
      },
      body: JSON.stringify(realEvent)
    });

    console.log("📡 Webhook response status:", webhookResponse.status);
    
    if (webhookResponse.ok) {
      const result = await webhookResponse.json();
      console.log("✅ Webhook call successful:");
      console.log("   Response:", JSON.stringify(result, null, 2));
    } else {
      const errorText = await webhookResponse.text();
      console.log("❌ Webhook call failed:");
      console.log("   Error:", errorText);
    }

    // Check if any new records were created
    console.log("\n2️⃣ Checking if new records were created...");
    
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
        if (data.length > 0) {
          console.log(`     Sample record:`, JSON.stringify(data[0], null, 2));
        }
      } else {
        const errorText = await response.text();
        console.log(`   - ${table}: Error - ${errorText}`);
      }
    }

    // Check if the profile was updated
    console.log("\n3️⃣ Checking if profile was updated...");
    
    const updatedProfileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${userProfile.id}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (updatedProfileResponse.ok) {
      const updatedProfiles = await updatedProfileResponse.json();
      if (updatedProfiles.length > 0) {
        const updatedProfile = updatedProfiles[0];
        console.log("   - Profile payment status:", updatedProfile.payment_status);
        console.log("   - Stripe customer ID:", updatedProfile.stripe_customer_id);
        console.log("   - Payment date:", updatedProfile.payment_date);
      }
    }

    console.log("\n📊 Analysis:");
    console.log("   - If webhook succeeds but no records created, there's a database issue");
    console.log("   - If webhook fails, we need to check the webhook logs");
    console.log("   - The webhook should create customer, subscription, and customer_access records");

  } catch (error) {
    console.error("💥 Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run the test
testRealWebhook().catch(console.error); 
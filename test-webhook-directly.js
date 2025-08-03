// Test script to call the webhook directly
// This will simulate a successful payment and see if it creates the missing records

const SUPABASE_URL = "https://rndpcearcqnvrnjxabgq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM";

async function testWebhookDirectly() {
  try {
    console.log("🧪 Testing Webhook Directly...\n");

    // First, let's check what user ID we should use
    // Since you mentioned there's 1 profile, let's try to get it with a different approach
    
    console.log("1️⃣ Trying to access profile with service role approach...");
    
    // We'll call the webhook function directly with test data
    const webhookUrl = `${SUPABASE_URL}/functions/v1/stripe-webhook`;
    
    // Create a mock Stripe webhook event
    const mockEvent = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_" + Date.now(),
          customer: "cus_test_" + Date.now(),
          subscription: "sub_test_" + Date.now(),
          metadata: {
            user_id: "00000000-0000-0000-0000-000000000001", // Test user ID
            email: "test@example.com",
            full_name: "Test User",
            phone: "+1234567890",
            company: "Test Company"
          },
          customer_details: {
            email: "test@example.com",
            name: "Test User"
          }
        }
      }
    };

    console.log("📋 Mock event data:", JSON.stringify(mockEvent, null, 2));

    // Call the webhook function
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature' // Mock signature
      },
      body: JSON.stringify(mockEvent)
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

    // Now let's check if any records were created
    console.log("\n2️⃣ Checking if records were created...");
    
    const tables = ['profiles', 'customers', 'subscriptions', 'customer_access'];
    
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

    console.log("\n📊 Analysis:");
    console.log("   - If webhook succeeds, it should create profile, customer, and subscription records");
    console.log("   - If it fails, we need to check the webhook logs for errors");

  } catch (error) {
    console.error("💥 Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run the test
testWebhookDirectly().catch(console.error); 
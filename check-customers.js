// Quick script to check if customer records exist

const SUPABASE_URL = "https://rndpcearcqnvrnjxabgq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM";

async function checkCustomers() {
  try {
    console.log("🔍 Checking Customer Records...\n");

    const tables = ['customers', 'subscriptions', 'customer_access'];
    
    for (const table of tables) {
      console.log(`Checking ${table} table...`);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${table}: ${data.length} records`);
        
        if (data.length > 0) {
          data.forEach((record, index) => {
            console.log(`   Record ${index + 1}:`, JSON.stringify(record, null, 2));
          });
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ ${table}: Error - ${errorText}`);
      }
      
      console.log("");
    }

  } catch (error) {
    console.error("💥 Check failed:", error.message);
  }
}

checkCustomers().catch(console.error); 
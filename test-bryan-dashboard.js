import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rndpcearcqnvrnjxabgq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM';

const supabase = createClient(supabaseUrl, supabaseKey);

// Bryan's user ID from previous test
const BRYAN_USER_ID = '3394c0cc-5a1b-48f6-bcdd-43c4896aac75';

async function testDashboardQuery() {
  console.log('🔍 Testing exact dashboard query for Bryan...\n');

  // 1. Get profile (exactly like dashboard does)
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", BRYAN_USER_ID)
    .single();

  if (profileError) {
    console.error("❌ Profile load error:", profileError);
    return;
  }

  console.log("✅ Basic profile loaded:");
  console.log("   Email:", profileData.email);
  console.log("   Payment Status:", profileData.payment_status);

  // 2. Get company info (exactly like dashboard does)
  const { data: companyData, error: companyError } = await supabase
    .from("user_company_roles")
    .select(`
      company_id,
      is_primary,
      companies(
        id,
        name,
        brand_verification_status,
        tcr_brand_id
      )
    `)
    .eq("user_id", BRYAN_USER_ID)
    .order("is_primary", { ascending: false })
    .limit(1)
    .single();

  if (companyError) {
    console.error("❌ Company error:", companyError);
  } else {
    console.log("\n✅ Company data loaded:");
    console.log("   Raw companyData:", JSON.stringify(companyData, null, 2));
    console.log("   Company object:", companyData.companies);
  }

  // 3. Combine data (exactly like dashboard does)
  const company = companyData?.companies || null;
  const profileWithBrandStatus = {
    ...profileData,
    brand_verification_status: company?.brand_verification_status || null,
    tcr_brand_id: company?.tcr_brand_id || null,
  };

  console.log("\n✅ Combined profile data:");
  console.log("   Payment Status:", profileWithBrandStatus.payment_status);
  console.log("   Brand Status:", profileWithBrandStatus.brand_verification_status);
  console.log("   TCR Brand ID:", profileWithBrandStatus.tcr_brand_id);

  // 4. Check what onboarding steps would show
  const onboardingSteps = [
    {
      id: "payment",
      completed: profileWithBrandStatus.payment_status === "paid",
    },
    {
      id: "brand-verification", 
      completed: profileWithBrandStatus.brand_verification_status === "verified",
    },
  ];

  console.log("\n📋 Onboarding Steps:");
  onboardingSteps.forEach(step => {
    console.log(`   ${step.id}: ${step.completed ? '✅ Completed' : '❌ Not completed'}`);
  });
}

testDashboardQuery();
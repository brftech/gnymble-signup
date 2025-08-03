import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rndpcearcqnvrnjxabgq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboardQuery() {
  console.log('🔍 Testing Dashboard Query...\n');

  const userId = 'ef6bb11c-b321-4e39-9943-656f4159678a';

  try {
    // Test 1: Basic profile query (what dashboard does first)
    console.log('1. Testing basic profile query:');
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error('❌ Profile query error:', profileError);
    } else {
      console.log('✅ Profile query successful:', profileData);
    }

    // Test 2: Company data query (what dashboard does second)
    console.log('\n2. Testing company data query:');
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
      .eq("user_id", userId)
      .order("is_primary", { ascending: false })
      .limit(1)
      .single();

    if (companyError) {
      console.error('❌ Company query error:', companyError);
    } else {
      console.log('✅ Company query successful:', companyData);
      if (companyData?.companies?.[0]) {
        console.log('✅ Company data found:', companyData.companies[0]);
      } else {
        console.log('⚠️ No company data in result');
      }
    }

    // Test 3: Direct company query to verify data exists
    console.log('\n3. Testing direct company query:');
    const { data: directCompany, error: directCompanyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", "5c4ea716-1b77-4d87-8258-024068a3097b")
      .single();

    if (directCompanyError) {
      console.error('❌ Direct company query error:', directCompanyError);
    } else {
      console.log('✅ Direct company query successful:', directCompany);
    }

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

testDashboardQuery(); 
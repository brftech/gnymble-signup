import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rndpcearcqnvrnjxabgq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM';

const supabase = createClient(supabaseUrl, supabaseKey);

// You can change this to test a specific user
const TEST_USER_EMAIL = 'bryan@percytech.com'; // Change this to the email you're testing with

async function testUserData() {
  console.log(`🔍 Testing data for user: ${TEST_USER_EMAIL}\n`);

  // 1. Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', TEST_USER_EMAIL)
    .single();

  if (profileError || !profile) {
    console.error('❌ User not found:', profileError);
    
    // List all users to help find the right one
    console.log('\nAvailable users:');
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    allProfiles?.forEach(p => {
      console.log(`  - ${p.email} (${p.full_name}) - ID: ${p.id.substring(0, 8)}...`);
    });
    return;
  }

  console.log('✅ Found user:', profile.email);
  console.log('   User ID:', profile.id);
  console.log('   Payment Status:', profile.payment_status);

  // 2. Check user's company via user_company_roles
  const { data: companyData, error: companyError } = await supabase
    .from('user_company_roles')
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
    .eq('user_id', profile.id)
    .order('is_primary', { ascending: false })
    .limit(1)
    .single();

  if (companyError || !companyData) {
    console.error('\n❌ No company relationship found:', companyError);
    return;
  }

  console.log('\n✅ Company found:', companyData.companies?.name);
  console.log('   Company ID:', companyData.company_id);
  console.log('   TCR Brand ID:', companyData.companies?.tcr_brand_id || 'None');
  console.log('   Brand Status:', companyData.companies?.brand_verification_status || 'None');

  // 3. Check onboarding submissions
  const { data: submissions } = await supabase
    .from('onboarding_submissions')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  console.log(`\n📋 Onboarding Submissions (${submissions?.length || 0} found):`);
  submissions?.forEach(s => {
    console.log(`  - Submission ${s.id.substring(0, 8)}...`);
    console.log(`    Status: ${s.status}`);
    console.log(`    TCR Brand ID: ${s.tcr_brand_id || 'None'}`);
    console.log(`    Created: ${s.created_at}`);
  });

  // 4. Simulate what the dashboard would show
  const profileWithBrandStatus = {
    ...profile,
    brand_verification_status: companyData.companies?.brand_verification_status || null,
    tcr_brand_id: companyData.companies?.tcr_brand_id || null,
  };

  console.log('\n🖥️  Dashboard would show:');
  console.log('   Payment Status:', profileWithBrandStatus.payment_status);
  console.log('   Brand Verification Status:', profileWithBrandStatus.brand_verification_status || 'Not started');
  console.log('   TCR Brand ID:', profileWithBrandStatus.tcr_brand_id || 'None');
}

testUserData();
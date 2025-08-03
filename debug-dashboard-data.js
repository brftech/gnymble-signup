import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rndpcearcqnvrnjxabgq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDashboardData() {
  console.log('🔍 Debugging Dashboard Data...\n');

  try {
    // 1. Check all profiles
    console.log('1. Checking profiles table:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('❌ Profiles error:', profilesError);
    } else {
      console.log(`✅ Found ${profiles.length} profiles:`);
      profiles.forEach(profile => {
        console.log(`   - ID: ${profile.id}`);
        console.log(`   - Email: ${profile.email}`);
        console.log(`   - Name: ${profile.full_name}`);
        console.log(`   - Payment Status: ${profile.payment_status}`);
        console.log(`   - Created: ${profile.created_at}`);
        console.log('');
      });
    }

    // 2. Check all companies
    console.log('2. Checking companies table:');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');
    
    if (companiesError) {
      console.error('❌ Companies error:', companiesError);
    } else {
      console.log(`✅ Found ${companies.length} companies:`);
      companies.forEach(company => {
        console.log(`   - ID: ${company.id}`);
        console.log(`   - Name: ${company.name}`);
        console.log(`   - Brand Verification Status: ${company.brand_verification_status}`);
        console.log(`   - TCR Brand ID: ${company.tcr_brand_id}`);
        console.log(`   - Created: ${company.created_at}`);
        console.log('');
      });
    }

    // 3. Check user_company_roles
    console.log('3. Checking user_company_roles table:');
    const { data: userCompanyRoles, error: userCompanyRolesError } = await supabase
      .from('user_company_roles')
      .select('*');
    
    if (userCompanyRolesError) {
      console.error('❌ User company roles error:', userCompanyRolesError);
    } else {
      console.log(`✅ Found ${userCompanyRoles.length} user_company_roles:`);
      userCompanyRoles.forEach(role => {
        console.log(`   - User ID: ${role.user_id}`);
        console.log(`   - Company ID: ${role.company_id}`);
        console.log(`   - Role: ${role.role}`);
        console.log(`   - Is Primary: ${role.is_primary}`);
        console.log('');
      });
    }

    // 4. Check onboarding_submissions
    console.log('4. Checking onboarding_submissions table:');
    const { data: submissions, error: submissionsError } = await supabase
      .from('onboarding_submissions')
      .select('*');
    
    if (submissionsError) {
      console.error('❌ Submissions error:', submissionsError);
    } else {
      console.log(`✅ Found ${submissions.length} onboarding submissions:`);
      submissions.forEach(submission => {
        console.log(`   - User ID: ${submission.user_id}`);
        console.log(`   - Company ID: ${submission.company_id}`);
        console.log(`   - Status: ${submission.status}`);
        console.log(`   - TCR Brand ID: ${submission.tcr_brand_id}`);
        console.log(`   - Created: ${submission.created_at}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('💥 Debug error:', error);
  }
}

debugDashboardData(); 
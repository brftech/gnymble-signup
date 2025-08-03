import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rndpcearcqnvrnjxabgq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBrandData() {
  console.log('🔍 Checking brand-related data in database...\n');

  // 1. Check companies table for brand verification status
  console.log('1. Checking companies table:');
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('id, name, tcr_brand_id, brand_verification_status, updated_at')
    .order('updated_at', { ascending: false })
    .limit(5);

  if (companiesError) {
    console.error('❌ Error fetching companies:', companiesError);
  } else {
    console.log('Companies with brand info:');
    companies.forEach(c => {
      console.log(`  - ${c.name}:`);
      console.log(`    TCR Brand ID: ${c.tcr_brand_id || 'None'}`);
      console.log(`    Status: ${c.brand_verification_status || 'None'}`);
      console.log(`    Updated: ${c.updated_at}`);
    });
  }

  // 2. Check brands table
  console.log('\n2. Checking brands table:');
  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (brandsError) {
    console.error('❌ Error fetching brands:', brandsError);
  } else {
    console.log(`Found ${brands?.length || 0} brands`);
    brands?.forEach(b => {
      console.log(`  - ${b.brand_name} (${b.tcr_brand_id})`);
    });
  }

  // 3. Check onboarding_submissions
  console.log('\n3. Checking onboarding_submissions:');
  const { data: submissions, error: submissionsError } = await supabase
    .from('onboarding_submissions')
    .select('id, user_id, company_id, status, tcr_brand_id, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (submissionsError) {
    console.error('❌ Error fetching submissions:', submissionsError);
  } else {
    console.log(`Found ${submissions?.length || 0} submissions`);
    submissions?.forEach(s => {
      console.log(`  - Submission ${s.id.substring(0, 8)}...`);
      console.log(`    Status: ${s.status}`);
      console.log(`    TCR Brand ID: ${s.tcr_brand_id || 'None'}`);
      console.log(`    Created: ${s.created_at}`);
    });
  }

  // 4. Check user_company_roles to ensure relationships exist
  console.log('\n4. Checking user_company_roles:');
  const { data: roles, error: rolesError } = await supabase
    .from('user_company_roles')
    .select(`
      user_id,
      company_id,
      role,
      is_primary,
      companies(name, tcr_brand_id, brand_verification_status)
    `)
    .limit(5);

  if (rolesError) {
    console.error('❌ Error fetching roles:', rolesError);
  } else {
    console.log(`Found ${roles?.length || 0} user-company relationships`);
    roles?.forEach(r => {
      console.log(`  - User ${r.user_id.substring(0, 8)}... -> Company: ${r.companies?.name}`);
      console.log(`    Brand Status: ${r.companies?.brand_verification_status || 'None'}`);
    });
  }
}

checkBrandData();
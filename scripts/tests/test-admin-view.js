import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rndpcearcqnvrnjxabgq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminView() {
  console.log('🔍 Testing admin view query...\n');

  // Replicate the exact query from AdminTCRStatus
  const { data, error } = await supabase
    .from("onboarding_submissions")
    .select(`
      *,
      profiles!inner(email, full_name),
      companies!inner(name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`✅ Found ${data?.length || 0} submissions\n`);

  // Transform like the admin page does
  const transformedData = data?.map((submission) => ({
    ...submission,
    user_email: submission.profiles?.email,
    user_name: submission.profiles?.full_name,
    company_name: submission.companies?.name,
  })) || [];

  transformedData.forEach(s => {
    console.log(`📋 Submission for ${s.company_name}:`);
    console.log(`   User: ${s.user_name} (${s.user_email})`);
    console.log(`   Status: ${s.status}`);
    console.log(`   TCR Brand ID: ${s.tcr_brand_id || 'None'}`);
    console.log(`   Created: ${s.created_at}`);
    console.log('');
  });
}

testAdminView();
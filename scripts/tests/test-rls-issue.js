// Test script to diagnose RLS issues with onboarding_submissions
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rndpcearcqnvrnjxabgq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLSIssue() {
  try {
    console.log('🧪 Testing RLS issue with onboarding_submissions...');
    
    // Test 1: Check if we can read from onboarding_submissions
    console.log('\n1. Testing SELECT from onboarding_submissions...');
    const { data: selectData, error: selectError } = await supabase
      .from('onboarding_submissions')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('❌ SELECT failed:', selectError);
    } else {
      console.log('✅ SELECT successful:', selectData);
    }
    
    // Test 2: Check if we can read from companies
    console.log('\n2. Testing SELECT from companies...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .limit(1);
    
    if (companiesError) {
      console.error('❌ Companies SELECT failed:', companiesError);
    } else {
      console.log('✅ Companies SELECT successful:', companies);
    }
    
    // Test 3: Check if we can read from profiles
    console.log('\n3. Testing SELECT from profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, company_id')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles SELECT failed:', profilesError);
    } else {
      console.log('✅ Profiles SELECT successful:', profiles);
    }
    
    // Test 4: Try to insert into onboarding_submissions with minimal data
    console.log('\n4. Testing INSERT into onboarding_submissions...');
    const { data: insertData, error: insertError } = await supabase
      .from('onboarding_submissions')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        company_id: companies?.[0]?.id || '00000000-0000-0000-0000-000000000000',
        submission_data: { test: true },
        status: 'test',
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ INSERT failed:', insertError);
      
      // Check if it's a 403 Forbidden
      if (insertError.code === 'PGRST116') {
        console.log('🔍 This is a 403 Forbidden error - RLS policy is blocking the insert');
      }
    } else {
      console.log('✅ INSERT successful:', insertData);
    }
    
    // Test 5: Check RLS policies
    console.log('\n5. Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_rls_policies', { table_name: 'onboarding_submissions' })
      .catch(() => ({ data: null, error: 'RPC not available' }));
    
    if (policiesError) {
      console.log('⚠️ Could not check RLS policies via RPC, trying direct query...');
      
      // Try a direct query to check if RLS is enabled
      const { data: rlsStatus, error: rlsError } = await supabase
        .from('information_schema.tables')
        .select('table_name, row_security')
        .eq('table_name', 'onboarding_submissions')
        .eq('table_schema', 'public')
        .single();
      
      if (rlsError) {
        console.error('❌ Could not check RLS status:', rlsError);
      } else {
        console.log('📋 RLS Status:', rlsStatus);
      }
    } else {
      console.log('📋 RLS Policies:', policies);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

testRLSIssue(); 
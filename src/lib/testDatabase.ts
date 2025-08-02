// Simple database test to verify connection works without RLS issues
import { supabase } from './supabaseClient';

export async function testDatabaseConnection() {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test 1: Simple query to companies table
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .limit(1);
    
    if (companiesError) {
      console.error('❌ Companies query failed:', companiesError);
      return { success: false, error: companiesError };
    }
    
    console.log('✅ Companies query successful:', companies);
    
    // Test 2: Test insert to onboarding_submissions
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('⚠️ No user found, skipping insert test');
      return { success: true, message: 'Connection works, no user for insert test' };
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('onboarding_submissions')
      .insert({
        user_id: user.id,
        company_id: companies?.[0]?.id || '00000000-0000-0000-0000-000000000000',
        submission_data: { test: true },
        status: 'test',
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      return { success: false, error: insertError };
    }
    
    console.log('✅ Insert test successful:', insertData);
    
    // Test 3: Test update to companies table
    const { error: updateError } = await supabase
      .from('companies')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', companies?.[0]?.id || '00000000-0000-0000-0000-000000000000');
    
    if (updateError) {
      console.error('❌ Update test failed:', updateError);
      return { success: false, error: updateError };
    }
    
    console.log('✅ Update test successful');
    
    return { success: true, message: 'All database tests passed' };
  } catch (error) {
    console.error('💥 Database test error:', error);
    return { success: false, error };
  }
} 
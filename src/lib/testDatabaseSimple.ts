// Simple database test to verify RLS is disabled
import { supabase } from './supabaseClient';

export async function testDatabaseSimple() {
  try {
    console.log('🧪 Testing simple database operations...');
    
    // Test 1: Simple query to customers table
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, email, company_name')
      .limit(1);
    
    if (customersError) {
      console.error('❌ Customers query failed:', customersError);
      return { success: false, error: customersError };
    }
    
    console.log('✅ Customers query successful:', customers);
    
    // Test 2: Test insert to customers table
    const testCustomer = {
      email: 'test_' + Date.now() + '@example.com',
      company_name: 'Test Company ' + Date.now(),
      primary_platform: 'gnymble',
      customer_type: 'classic',
      status: 'active',
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('customers')
      .insert(testCustomer)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      return { success: false, error: insertError };
    }
    
    console.log('✅ Insert test successful:', insertData);
    
    // Test 3: Test update
    const { error: updateError } = await supabase
      .from('customers')
      .update({ status: 'inactive' })
      .eq('id', insertData.id);
    
    if (updateError) {
      console.error('❌ Update test failed:', updateError);
      return { success: false, error: updateError };
    }
    
    console.log('✅ Update test successful');
    
    // Test 4: Test delete
    const { error: deleteError } = await supabase
      .from('customers')
      .delete()
      .eq('id', insertData.id);
    
    if (deleteError) {
      console.error('❌ Delete test failed:', deleteError);
      return { success: false, error: deleteError };
    }
    
    console.log('✅ Delete test successful');
    
    return { success: true, message: 'All database operations work without RLS' };
  } catch (error) {
    console.error('💥 Database test error:', error);
    return { success: false, error };
  }
} 
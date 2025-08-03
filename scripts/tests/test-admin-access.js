import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rndpcearcqnvrnjxabgq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminAccess() {
  console.log('🔍 Testing admin access...\n');

  // 1. Check who is currently logged in
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.log('❌ No user logged in');
    return;
  }

  console.log('✅ Current user:', user.email);
  console.log('   User ID:', user.id);

  // 2. Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('❌ Could not fetch profile:', profileError);
    return;
  }

  console.log('\n📋 User profile:');
  console.log('   Email:', profile.email);
  console.log('   Role:', profile.role || 'user');
  console.log('   Is Admin:', profile.role === 'admin' ? '✅ Yes' : '❌ No');

  // 3. Test admin views access
  console.log('\n🔐 Testing admin views access:');
  
  const { data: metrics, error: metricsError } = await supabase
    .from('admin_system_metrics')
    .select('*')
    .single();

  if (metricsError) {
    console.error('❌ Cannot access admin_system_metrics:', metricsError.message);
  } else {
    console.log('✅ Can access admin_system_metrics');
    console.log('   Total users:', metrics.total_users);
    console.log('   Paid users:', metrics.paid_users);
  }

  // 4. Check all users with admin role
  console.log('\n👥 All admin users:');
  const { data: admins } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('role', 'admin');

  if (admins && admins.length > 0) {
    admins.forEach(admin => {
      console.log(`   - ${admin.full_name} (${admin.email})`);
    });
  } else {
    console.log('   No admin users found');
  }
}

// Note: This won't work because we need to be authenticated
// You would need to run this after logging in via the UI
console.log('⚠️  Note: This script requires authentication.');
console.log('Run it in the browser console after logging in as an admin user.');

// Export for browser console use
if (typeof window !== 'undefined') {
  window.testAdminAccess = testAdminAccess;
}

testAdminAccess();
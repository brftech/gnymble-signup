import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rndpcearcqnvrnjxabgq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminViews() {
  console.log('🔍 Checking admin views and tables...\n');

  // 1. Try admin_system_metrics
  console.log('1. Checking admin_system_metrics:');
  try {
    const { data, error } = await supabase
      .from('admin_system_metrics')
      .select('*')
      .single();
    
    if (error) {
      console.error('❌ Error:', error.message);
    } else {
      console.log('✅ Found:', data);
    }
  } catch (e) {
    console.error('❌ Exception:', e.message);
  }

  // 2. Try admin_user_overview
  console.log('\n2. Checking admin_user_overview:');
  try {
    const { data, error } = await supabase
      .from('admin_user_overview')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error.message);
    } else {
      console.log('✅ Found', data?.length || 0, 'records');
    }
  } catch (e) {
    console.error('❌ Exception:', e.message);
  }

  // 3. Check what we can use instead - profiles with companies
  console.log('\n3. Getting metrics from existing tables:');
  
  // Total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  console.log('Total users:', totalUsers);

  // Paid users
  const { count: paidUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('payment_status', 'paid');
  console.log('Paid users:', paidUsers);

  // Recent users
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      payment_status,
      created_at,
      company_id
    `)
    .order('created_at', { ascending: false })
    .limit(5);
  
  console.log('\nRecent users:');
  recentUsers?.forEach(u => {
    console.log(`- ${u.full_name} (${u.email}) - ${u.payment_status}`);
  });

  // Companies with brand status
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .not('tcr_brand_id', 'is', null)
    .limit(5);
  
  console.log('\nCompanies with TCR brands:', companies?.length || 0);
}

checkAdminViews();
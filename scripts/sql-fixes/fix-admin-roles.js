import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rndpcearcqnvrnjxabgq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminRoles() {
  console.log('🔍 Checking admin role configuration...\n');

  // 1. Check user_roles table
  console.log('1. Checking user_roles table:');
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*')
    .limit(5);

  if (rolesError) {
    console.error('❌ Error accessing user_roles:', rolesError.message);
  } else {
    console.log('✅ Found', userRoles?.length || 0, 'user roles');
    userRoles?.forEach(role => {
      console.log(`   - User ${role.user_id.substring(0, 8)}... has role: ${role.role}`);
    });
  }

  // 2. Check profiles table for role field
  console.log('\n2. Checking profiles table role field:');
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, role')
    .not('role', 'is', null)
    .limit(5);

  if (profiles && profiles.length > 0) {
    console.log('✅ Found', profiles.length, 'profiles with roles:');
    profiles.forEach(p => {
      console.log(`   - ${p.email}: ${p.role}`);
    });
  } else {
    console.log('❌ No profiles have roles set');
  }

  // 3. Find Bryan's user to make admin
  console.log('\n3. Looking for Bryan\'s account:');
  const { data: bryan } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('email', 'bryan@percytech.com')
    .single();

  if (bryan) {
    console.log('✅ Found Bryan:', bryan.email);
    console.log('   User ID:', bryan.id);
    
    // Check if Bryan has superadmin role
    const { data: bryanRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', bryan.id)
      .eq('role', 'superadmin')
      .single();

    if (bryanRole) {
      console.log('   ✅ Bryan already has superadmin role');
    } else {
      console.log('   ❌ Bryan does not have superadmin role');
      console.log('\nTo make Bryan a superadmin, run this SQL in Supabase:');
      console.log(`INSERT INTO user_roles (user_id, role) VALUES ('${bryan.id}', 'superadmin');`);
    }
  }
}

checkAdminRoles();
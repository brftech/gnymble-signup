// Script to grant superadmin role to a user
// Run with: node grant-superadmin.js your-email@example.com

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please ensure you have VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function grantSuperadmin(email) {
  try {
    console.log(`🔍 Looking up user with email: ${email}`);
    
    // Find user by email
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;
    
    const user = authData.users.find(u => u.email === email);
    if (!user) {
      console.error('❌ User not found with email:', email);
      return;
    }
    
    console.log('✅ Found user:', user.id);
    
    // Check if user already has superadmin role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'superadmin')
      .single();
    
    if (existingRole) {
      console.log('ℹ️  User already has superadmin role');
      return;
    }
    
    // Grant superadmin role
    console.log('🔐 Granting superadmin role...');
    const { error: insertError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: user.id,
        role: 'superadmin'
      });
    
    if (insertError) throw insertError;
    
    console.log('✅ Successfully granted superadmin role to:', email);
    console.log('🚀 You can now access the admin panel at: /admin');
    
    // Verify the role was added
    const { data: newRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'superadmin')
      .single();
    
    if (newRole) {
      console.log('✅ Verified: Role successfully added');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Get email from command line
const email = process.argv[2];
if (!email) {
  console.error('❌ Please provide an email address');
  console.error('Usage: node grant-superadmin.js your-email@example.com');
  process.exit(1);
}

grantSuperadmin(email);
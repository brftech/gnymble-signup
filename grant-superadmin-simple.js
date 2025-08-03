// Simple script to grant superadmin role to a user
// Run with: node grant-superadmin-simple.js your-email@example.com your-service-role-key

const email = process.argv[2];
const serviceRoleKey = process.argv[3];

if (!email || !serviceRoleKey) {
  console.error('❌ Please provide both email and service role key');
  console.error('Usage: node grant-superadmin-simple.js your-email@example.com your-service-role-key');
  console.error('\nYou can find your service role key in Supabase Dashboard > Settings > API > service_role');
  process.exit(1);
}

// Get the Supabase URL from the environment or use the one from your project
const supabaseUrl = 'https://rndpcearcqnvrnjxabgq.supabase.co';

async function grantSuperadmin() {
  try {
    console.log(`🔍 Looking up user with email: ${email}`);
    
    // First, get the user ID by email using the auth admin API
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!authResponse.ok) {
      throw new Error(`Auth API error: ${authResponse.status} ${authResponse.statusText}`);
    }
    
    const { users } = await authResponse.json();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.error('❌ User not found with email:', email);
      return;
    }
    
    console.log('✅ Found user:', user.id);
    
    // Check if user already has superadmin role
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_roles?user_id=eq.${user.id}&role=eq.superadmin`,
      {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const existingRoles = await checkResponse.json();
    
    if (existingRoles.length > 0) {
      console.log('ℹ️  User already has superadmin role');
      return;
    }
    
    // Grant superadmin role
    console.log('🔐 Granting superadmin role...');
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: user.id,
        role: 'superadmin'
      })
    });
    
    if (!insertResponse.ok) {
      const error = await insertResponse.text();
      throw new Error(`Failed to insert role: ${error}`);
    }
    
    console.log('✅ Successfully granted superadmin role to:', email);
    console.log('🚀 You can now access the admin panel at: http://localhost:5173/admin');
    console.log('\n📝 Next steps:');
    console.log('   1. Log in with your existing credentials');
    console.log('   2. Navigate to /admin');
    console.log('   3. You should see the admin dashboard!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

grantSuperadmin();
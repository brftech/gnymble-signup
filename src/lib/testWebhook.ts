// Test function to manually trigger webhook logic for debugging
import { supabase } from './supabaseClient';

export async function testWebhookLogic(userId: string) {
  try {
    console.log('🧪 Testing webhook logic for user:', userId);
    
    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return { success: false, error: profileError };
    }
    
    console.log('✅ User profile:', userProfile);
    
    // Get company name
    let companyName = '';
    if (userProfile.company_id) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('name')
        .eq('id', userProfile.company_id)
        .single();
      companyName = companyData?.name || '';
    }
    
    console.log('🏢 Company name:', companyName);
    
    // Check if customer already exists
    console.log('🔍 Checking if customer already exists...');
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', userProfile.email)
      .single();
    
    let customer;
    if (existingCustomer) {
      console.log('✅ Customer already exists:', existingCustomer);
      customer = existingCustomer;
    } else {
      // Create customer record
      const customerData = {
        email: userProfile.email,
        company_name: companyName,
        primary_platform: 'gnymble',
        customer_type: 'classic',
        status: 'active',
      };
      
      console.log('📋 Creating customer with data:', customerData);
      
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single();
      
      if (customerError) {
        console.error('❌ Customer creation error:', customerError);
        return { success: false, error: customerError };
      }
      
      console.log('✅ Customer created:', newCustomer);
      customer = newCustomer;
    }
    
    // Check if subscription already exists
    console.log('🔍 Checking if subscription already exists...');
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('customer_id', customer.id)
      .single();
    
    let subscription;
    if (existingSubscription) {
      console.log('✅ Subscription already exists:', existingSubscription);
      subscription = existingSubscription;
    } else {
      // Create subscription record
      const subscriptionData = {
        customer_id: customer.id,
        platform: 'gnymble',
        stripe_subscription_id: 'test_subscription_' + Date.now(),
        plan_name: 'Gnymble Onboarding Package',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      console.log('📋 Creating subscription with data:', subscriptionData);
      
      const { data: newSubscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single();
      
      if (subscriptionError) {
        console.error('❌ Subscription creation error:', subscriptionError);
        return { success: false, error: subscriptionError };
      }
      
      console.log('✅ Subscription created:', newSubscription);
      subscription = newSubscription;
    }
    
    // Check if customer access already exists
    console.log('🔍 Checking if customer access already exists...');
    const { data: existingAccess } = await supabase
      .from('customer_access')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('platform_user_id', userId)
      .single();
    
    if (existingAccess) {
      console.log('✅ Customer access already exists:', existingAccess);
    } else {
      // Create customer access record
      const accessData = {
        customer_id: customer.id,
        platform: 'gnymble',
        access_level: 'full',
        platform_user_id: userId,
        onboarding_completed: false,
      };
      
      console.log('📋 Creating access record with data:', accessData);
      
      const { error: accessError } = await supabase
        .from('customer_access')
        .insert(accessData);
      
      if (accessError) {
        console.error('❌ Access creation error:', accessError);
        return { success: false, error: accessError };
      }
      
      console.log('✅ Access record created');
    }
    
    // Check if user role already exists
    console.log('🔍 Checking if user role already exists...');
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'customer')
      .single();
    
    if (existingRole) {
      console.log('✅ User role already exists:', existingRole);
    } else {
      // Update user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'customer',
        });
      
      if (roleError) {
        console.error('❌ Role update error:', roleError);
        return { success: false, error: roleError };
      }
      
      console.log('✅ User role updated to customer');
    }
    
    return { 
      success: true, 
      customer, 
      subscription,
      message: 'All records created/verified successfully' 
    };
    
  } catch (error) {
    console.error('💥 Test webhook error:', error);
    return { success: false, error };
  }
} 
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.0.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
    );

    console.log("🎯 Received Stripe webhook:", event.type);
    console.log("📋 Event data:", JSON.stringify(event.data, null, 2));

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("💰 Processing completed checkout session:", session.id);
      console.log("📋 Session metadata:", session.metadata);
      console.log("👤 User ID from metadata:", session.metadata?.user_id);
      console.log("📧 Email from metadata:", session.metadata?.email);
      console.log("💳 Customer ID:", session.customer);
      console.log("📦 Subscription ID:", session.subscription);

      // Extract user_id from metadata (our reliable identifier)
      const userId = session.metadata?.user_id;
      if (!userId) {
        console.error("❌ No user_id found in session metadata");
        return new Response(
          JSON.stringify({ error: "No user_id in metadata" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      // Initialize Supabase client
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey =
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      console.log("🔗 Supabase client initialized");

      // Get user profile data first
      console.log("👤 Fetching user profile for ID:", userId);
      const { data: userProfile, error: profileFetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileFetchError) {
        console.error("❌ Error fetching user profile:", profileFetchError);
        return new Response(
          JSON.stringify({
            error: "Failed to fetch user profile",
            details: profileFetchError,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }

      console.log("✅ User profile fetched:", userProfile);
      console.log("🏢 Company ID from profile:", userProfile.company_id);

      // 1. Update profile with payment status
      console.log("📝 Updating profile payment status...");
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          payment_status: "paid",
          stripe_customer_id: session.customer as string,
          stripe_session_id: session.id,
          payment_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileError) {
        console.error("❌ Error updating profile:", profileError);
        return new Response(
          JSON.stringify({
            error: "Failed to update profile",
            details: profileError,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }

      console.log("✅ Profile updated successfully");

      // Get company name from companies table using company_id
      let companyName = session.metadata?.company || "";
      if (userProfile.company_id) {
        console.log("🏢 Fetching company name for ID:", userProfile.company_id);
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("name")
          .eq("id", userProfile.company_id)
          .single();

        if (companyError) {
          console.error("❌ Error fetching company:", companyError);
        } else {
          companyName = companyData?.name || companyName;
          console.log("✅ Company name fetched:", companyName);
        }
      }

      // 2. Check if customer already exists or create new one
      console.log("🔍 Checking if customer already exists...");
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("*")
        .eq("email", userProfile.email)
        .single();

      let customerData;
      if (existingCustomer) {
        console.log("✅ Customer already exists:", existingCustomer);
        customerData = existingCustomer;
      } else {
        console.log(
          "👥 Creating customer record with company name:",
          companyName
        );
        const customerInsertData = {
          email: userProfile.email,
          company_name: companyName,
          primary_platform: "gnymble",
          customer_type: "classic",
          status: "active",
        };

        console.log("📋 Customer insert data:", customerInsertData);

        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert(customerInsertData)
          .select()
          .single();

        if (customerError) {
          console.error("❌ Error creating customer:", customerError);
          console.error(
            "❌ Customer error details:",
            JSON.stringify(customerError, null, 2)
          );
          return new Response(
            JSON.stringify({
              error: "Failed to create customer",
              details: customerError,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            }
          );
        }

        console.log("✅ Created customer:", newCustomer);
        customerData = newCustomer;
      }

      // 3. Check if subscription already exists or create new one
      console.log("🔍 Checking if subscription already exists...");
      const { data: existingSubscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("customer_id", customerData.id)
        .single();

      if (existingSubscription) {
        console.log("✅ Subscription already exists:", existingSubscription);
      } else {
        console.log("📦 Creating subscription record...");
        const subscriptionInsertData = {
          customer_id: customerData.id,
          platform: "gnymble",
          stripe_subscription_id: session.subscription as string,
          plan_name: "Gnymble Onboarding Package",
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 days
        };

        console.log("📋 Subscription insert data:", subscriptionInsertData);

        const { data: newSubscription, error: subscriptionError } =
          await supabase
            .from("subscriptions")
            .insert(subscriptionInsertData)
            .select()
            .single();

        if (subscriptionError) {
          console.error("❌ Error creating subscription:", subscriptionError);
          console.error(
            "❌ Subscription error details:",
            JSON.stringify(subscriptionError, null, 2)
          );
        } else {
          console.log("✅ Created subscription:", newSubscription);
        }
      }

      // 4. Check if customer access already exists or create new one
      console.log("🔍 Checking if customer access already exists...");
      const { data: existingAccess } = await supabase
        .from("customer_access")
        .select("*")
        .eq("customer_id", customerData.id)
        .eq("platform_user_id", userId)
        .single();

      if (existingAccess) {
        console.log("✅ Customer access already exists:", existingAccess);
      } else {
        console.log("🔐 Creating customer access record...");
        const accessInsertData = {
          customer_id: customerData.id,
          platform: "gnymble",
          access_level: "full",
          platform_user_id: userId,
          onboarding_completed: false,
        };

        console.log("📋 Access insert data:", accessInsertData);

        const { error: accessError } = await supabase
          .from("customer_access")
          .insert(accessInsertData);

        if (accessError) {
          console.error("❌ Error creating customer access:", accessError);
          console.error(
            "❌ Access error details:",
            JSON.stringify(accessError, null, 2)
          );
        } else {
          console.log("✅ Created customer access record");
        }
      }

      // 5. Check if user role already exists or update it
      console.log("🔍 Checking if user role already exists...");
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .eq("role", "customer")
        .single();

      if (existingRole) {
        console.log("✅ User role already exists:", existingRole);
      } else {
        console.log("👤 Updating user role to customer...");
        const { error: roleError } = await supabase.from("user_roles").upsert({
          user_id: userId,
          role: "customer",
        });

        if (roleError) {
          console.error("❌ Error updating user role:", roleError);
          console.error(
            "❌ Role error details:",
            JSON.stringify(roleError, null, 2)
          );
        } else {
          console.log("✅ Updated user role to customer");
        }
      }

      // 6. Verify all records were created
      console.log("🔍 Verifying created records...");

      const { data: verifyCustomer } = await supabase
        .from("customers")
        .select("*")
        .eq("email", userProfile.email)
        .single();

      const { data: verifySubscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("customer_id", customerData.id)
        .single();

      const { data: verifyAccess } = await supabase
        .from("customer_access")
        .select("*")
        .eq("customer_id", customerData.id)
        .single();

      console.log("✅ Verification results:");
      console.log(
        "  - Customer record:",
        verifyCustomer ? "✅ Found" : "❌ Missing"
      );
      console.log(
        "  - Subscription record:",
        verifySubscription ? "✅ Found" : "❌ Missing"
      );
      console.log(
        "  - Access record:",
        verifyAccess ? "✅ Found" : "❌ Missing"
      );

      console.log("🎉 Successfully processed payment for user:", userId);
      console.log("📈 User progression: Profile → Customer → Subscriber");
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("💥 Webhook error:", error);
    console.error("💥 Error details:", JSON.stringify(error, null, 2));
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

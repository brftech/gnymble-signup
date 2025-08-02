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

      // Extract user_id from metadata (our reliable identifier)
      const userId = session.metadata?.user_id;
      if (!userId) {
        console.error("No user_id found in session metadata");
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

      // Get user profile data first
      const { data: userProfile, error: profileFetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileFetchError) {
        console.error("Error fetching user profile:", profileFetchError);
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

      console.log("Processing payment for user profile:", userProfile);
      console.log("Company name from profile:", userProfile.company_name);
      console.log("Company name from metadata:", session.metadata?.company);

      // 1. Update profile with payment status
      console.log("Updating profile payment status...");
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
        console.error("Error updating profile:", profileError);
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

      // Get company name from companies table using company_id
      let companyName = session.metadata?.company || "";
      if (userProfile.company_id) {
        const { data: companyData } = await supabase
          .from("companies")
          .select("name")
          .eq("id", userProfile.company_id)
          .single();
        companyName = companyData?.name || companyName;
      }

      // 2. Create customer record
      console.log("Creating customer record with company name:", companyName);
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .insert({
          email: userProfile.email,
          company_name: companyName,
          primary_platform: "gnymble",
          customer_type: "classic",
          status: "active",
        })
        .select()
        .single();

      if (customerError) {
        console.error("Error creating customer:", customerError);
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

      console.log("Created customer:", customerData);

      // 3. Create subscription record (since this is a subscription payment)
      console.log("Creating subscription record...");
      const { data: subscriptionData, error: subscriptionError } =
        await supabase
          .from("subscriptions")
          .insert({
            customer_id: customerData.id,
            platform: "gnymble",
            stripe_subscription_id: session.subscription as string,
            plan_name: "Gnymble Onboarding Package",
            status: "active",
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(), // 30 days
          })
          .select()
          .single();

      if (subscriptionError) {
        console.error("Error creating subscription:", subscriptionError);
      } else {
        console.log("Created subscription:", subscriptionData);
      }

      // 4. Create customer access record
      console.log("Creating customer access record...");
      const { error: accessError } = await supabase
        .from("customer_access")
        .insert({
          customer_id: customerData.id,
          platform: "gnymble",
          access_level: "full",
          platform_user_id: userId,
          onboarding_completed: false,
        });

      if (accessError) {
        console.error("Error creating customer access:", accessError);
      }

      // 5. Update user role to 'customer'
      console.log("Updating user role to customer...");
      const { error: roleError } = await supabase.from("user_roles").upsert({
        user_id: userId,
        role: "customer",
      });

      if (roleError) {
        console.error("Error updating user role:", roleError);
      }

      console.log("Successfully processed payment for user:", userId);
      console.log("User progression: Profile → Customer → Subscriber");
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

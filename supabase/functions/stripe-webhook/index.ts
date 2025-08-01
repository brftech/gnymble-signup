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

    console.log("Received Stripe webhook:", event.type);

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("Processing completed checkout session:", session.id);
      console.log("Session metadata:", session.metadata);

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

      // Update user profile with payment status
      console.log("Attempting to update profile for user:", userId);
      console.log("Update data:", {
        payment_status: "paid",
        stripe_customer_id: session.customer as string,
        stripe_session_id: session.id,
        payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

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
        console.error("Error details:", JSON.stringify(profileError));
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

      // Update user role to 'customer' (paid user)
      const { error: roleError } = await supabase.from("user_roles").upsert({
        user_id: userId,
        role: "customer",
      });

      if (roleError) {
        console.error("Error updating user role:", roleError);
      }

      console.log("Successfully processed payment for user:", userId);
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

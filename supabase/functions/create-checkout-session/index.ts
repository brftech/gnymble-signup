import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { user_id, email, name, phone, company } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get the origin from the request headers to support both localhost and production
    const origin =
      req.headers.get("origin") ||
      "https://gnymble-signup-btjiiiaajr-percy-tech.vercel.app";

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      metadata: {
        user_id: user_id, // ← Supabase UUID for reliable matching
        company: company || "",
        phone: phone || "",
        name: name || "",
      },
      client_reference_id: user_id, // Additional reference
      line_items: [
        {
          price: "price_1RocLPLT7TWxvnXo3On7rn3y", // Your Stripe price ID
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/onboarding?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?payment=cancelled`,
      allow_promotion_codes: true,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

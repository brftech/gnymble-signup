import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";

export default function Payment() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    checkUserAndRedirect();
  }, []);

  const checkUserAndRedirect = async () => {
    try {
      console.log("Checking user authentication...");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("User data:", user);
      console.log("User metadata:", user?.user_metadata);

      if (!user) {
        console.log("No user found, redirecting to login");
        toast.error("Please log in to access payment");
        window.location.href = "/login";
        return;
      }

      setUser(user);

      // Load user profile and company data
      console.log("Loading user profile and company...");
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
      }

      // Get user's company (direct relationship)
      let companyName = null;
      if (profileData?.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("name")
          .eq("id", profileData.company_id)
          .single();

        if (companyError) {
          console.error("Company error:", companyError);
        } else {
          companyName = companyData?.name;
        }
      }

      // Combine profile and company data
      const combinedProfile = {
        ...profileData,
        company_name: companyName || user?.user_metadata?.company_name
      };

      console.log("Profile data:", profileData);
      console.log("Company data:", companyData);
      console.log("Combined profile:", combinedProfile);
      console.log("Profile phone:", combinedProfile?.phone);
      console.log("First name:", combinedProfile?.first_name);
      console.log("Last name:", combinedProfile?.last_name);
      setProfile(combinedProfile);

      // Don't auto-redirect - let user choose when to proceed
      setLoading(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Error loading payment information");
    } finally {
      setLoading(false);
    }
  };

  const redirectToStripeCheckout = async (user: any, profile: any) => {
    setRedirecting(true);

    try {
      // Use direct Stripe URL with pre-filled parameters
      const stripeUrl = new URL(
        "https://buy.stripe.com/fZu28s1KD7xmcrfdKJefC04"
      );

      // Pre-fill email (always available)
      stripeUrl.searchParams.set("prefilled_email", user.email);

      // Pre-fill name (combine first and last name if available)
      let fullName = null;
      if (profile?.first_name && profile?.last_name) {
        fullName = `${profile.first_name} ${profile.last_name}`;
      } else if (profile?.full_name) {
        fullName = profile.full_name;
      } else if (user?.user_metadata?.full_name) {
        fullName = user.user_metadata.full_name;
      }
      
      if (fullName) {
        stripeUrl.searchParams.set("prefilled_name", fullName);
        console.log("Setting name for Stripe:", fullName);
      }

      // Pre-fill phone number
      let phoneNumber = null;
      if (profile?.phone) {
        phoneNumber = profile.phone;
      } else if (user?.user_metadata?.phone) {
        phoneNumber = user.user_metadata.phone;
      }

      if (phoneNumber) {
        // Ensure phone number is in E.164 format for Stripe
        let formattedPhone = phoneNumber;
        if (!phoneNumber.startsWith("+")) {
          formattedPhone = `+${phoneNumber}`;
        }
        // Try both possible Stripe phone parameters
        stripeUrl.searchParams.set("prefilled_phone", formattedPhone);
        stripeUrl.searchParams.set("prefilled_phone_number", formattedPhone);
        console.log("Setting phone number for Stripe:", formattedPhone);
        console.log("Full Stripe URL:", stripeUrl.toString());
      }

      // Pre-fill company name (using client_reference_id for company)
      if (profile?.company_name) {
        stripeUrl.searchParams.set("client_reference_id", profile.company_name);
      } else if (user?.user_metadata?.company_name) {
        stripeUrl.searchParams.set(
          "client_reference_id",
          user.user_metadata.company_name
        );
      }

      // Add success and cancel URLs pointing to gnymble.percytech.com
      stripeUrl.searchParams.set(
        "success_url",
        "https://gnymble.percytech.com/dashboard?payment=success"
      );
      stripeUrl.searchParams.set(
        "cancel_url",
        "https://gnymble.percytech.com/dashboard?payment=cancelled"
      );

      console.log("Redirecting to Stripe with pre-filled data:", {
        email: user.email,
        name: profile?.full_name || user?.user_metadata?.full_name,
        phone: profile?.phone || user?.user_metadata?.phone,
        company: profile?.company_name || user?.user_metadata?.company_name,
        profileData: profile,
        userMetadata: user?.user_metadata,
      });

      window.location.href = stripeUrl.toString();
    } catch (error) {
      console.error("Error redirecting to payment:", error);
      toast.error("Error processing payment");
      setRedirecting(false);
    }
  };

  const handleBackToDashboard = () => {
    window.location.href = "https://gnymble.percytech.com/dashboard";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d67635] mx-auto mb-4"></div>
          <p>Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d67635] mx-auto mb-4"></div>
          <p>Redirecting to secure payment...</p>
          <p className="text-sm text-gray-400 mt-2">
            Please wait while we set up your payment session
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold">
          Complete Your <span className="text-[#d67635]">G</span>nymble Setup
        </h1>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-left">
          <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-400">Name:</span>
              <span className="ml-2">{profile?.full_name || user?.email}</span>
            </div>
            <div>
              <span className="text-gray-400">Email:</span>
              <span className="ml-2">{user?.email}</span>
            </div>
            {profile?.phone && (
              <div>
                <span className="text-gray-400">Phone:</span>
                <span className="ml-2">{profile.phone}</span>
              </div>
            )}
            {profile?.company_name && (
              <div>
                <span className="text-gray-400">Company:</span>
                <span className="ml-2">{profile.company_name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-4">
            What's Included
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <p>✓ Personal consultation and platform setup</p>
            <p>✓ SMS automation strategy development</p>
            <p>✓ 30-day support and onboarding</p>
            <p>✓ Full access to Gnymble platform</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => redirectToStripeCheckout(user, profile)}
            disabled={redirecting}
            className="w-full py-3 bg-[#d67635] hover:bg-[#c96528] rounded-md font-semibold text-white disabled:opacity-50"
          >
            {redirecting ? "Processing..." : "Complete Payment - $179"}
          </button>

          <button
            onClick={handleBackToDashboard}
            className="w-full py-2 text-gray-400 hover:text-white border border-gray-700 rounded-md hover:border-gray-600"
          >
            Back to Dashboard
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Secure payment processed by Stripe. Your information is protected.
        </p>
      </div>
    </div>
  );
}

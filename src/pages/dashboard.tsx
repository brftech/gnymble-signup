import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  payment_status: string;
  stripe_customer_id?: string;
  payment_date?: string;
  brand_verification_status?: string;
  tcr_brand_id?: string;
  created_at: string;
  updated_at: string;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = useCallback(async (userId: string) => {
    console.log("👤 Loading profile for user:", userId);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("❌ Profile load error:", error);
        throw error;
      }

      console.log("✅ Profile loaded successfully:", data);
      setProfile(data);

      // If brand verification is pending, check status after a delay
      if (data.brand_verification_status === "pending" && data.tcr_brand_id) {
        setTimeout(() => {
          checkBrandVerificationStatus(data.tcr_brand_id);
        }, 2000); // Check after 2 seconds
      }
    } catch (error) {
      console.error("💥 Error loading profile:", error);
      // Set a default profile to prevent hanging
      setProfile({
        id: userId,
        email: "unknown@example.com",
        full_name: "Unknown User",
        phone: "",
        payment_status: "unknown",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }, []);

  const checkBrandVerificationStatus = useCallback(
    async (brandId: string) => {
      try {
        console.log("🔍 Checking brand verification status for:", brandId);

                 const response = await fetch(
           `https://rndpcearcqnvrnjxabgq.supabase.co/functions/v1/tcr-proxy`,
           {
             method: "POST",
             headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHBjZWFyY3FudnJuanhhYmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDQ2NDYsImV4cCI6MjA1OTAyMDY0Nn0.bYzWmLoviaS9ERAbDRh-ZH6B7dMtmUwWRwJpCNrdzFM`,
             },
             body: JSON.stringify({
               action: "checkBrandStatus",
               data: { brandId },
             }),
           }
         );

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Brand status check result:", result);

          if (result.success && result.status) {
            // Update profile with new status
            const { error: updateError } = await supabase
              .from("profiles")
              .update({
                brand_verification_status: result.status.toLowerCase(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", user?.id);

            if (!updateError) {
              // Reload profile to show updated status
              if (user) {
                loadUserProfile(user.id);
              }
            }
          }
        }
      } catch (error) {
        console.error("❌ Error checking brand status:", error);
      }
    },
    [user, loadUserProfile]
  );

  const checkPaymentStatus = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");

    if (paymentStatus === "success") {
      toast.success("Payment completed successfully! Welcome to Gnymble!");
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);

      // Refresh the profile immediately
      if (user) {
        loadUserProfile(user.id);
      }
    } else if (paymentStatus === "cancelled") {
      toast.error("Payment was cancelled. You can try again anytime.");
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]); // Remove loadUserProfile dependency to prevent circular dependency

  const onboardingSteps: OnboardingStep[] = [
    {
      id: "payment",
      title: "Complete Payment",
      description: "Purchase the onboarding package to get started",
      completed: profile?.payment_status === "paid",
      required: true,
    },
    {
      id: "brand-verification",
      title: "Brand Verification",
      description:
        profile?.brand_verification_status === "verified"
          ? "Brand verified and approved by TCR"
          : profile?.brand_verification_status === "pending"
          ? "Brand verification in progress with TCR"
          : profile?.brand_verification_status === "rejected"
          ? "Brand verification rejected - please review and resubmit"
          : "Submit company information for TCR compliance",
      completed: profile?.brand_verification_status === "verified",
      required: true,
    },
    {
      id: "campaign-approval",
      title: "Campaign Approval",
      description: "Get campaign approved for SMS messaging",
      completed: false, // Will be updated when campaign approval is implemented
      required: true,
    },
    {
      id: "platform-access",
      title: "Platform Access",
      description: "Access your Gnymble dashboard and start messaging",
      completed: false,
      required: true,
    },
  ];

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Get session first
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          console.log("❌ No session found, redirecting to login");
          window.location.href = "/login";
          return;
        }

        console.log("✅ User found:", session.user.email);
        setUser(session.user);

        // Load profile with shorter timeout
        await loadUserProfile(session.user.id);

        // Check payment status
        checkPaymentStatus();

        setLoading(false);
      } catch (error) {
        console.error("💥 Error initializing dashboard:", error);
        toast.error("Error loading dashboard");
        setLoading(false);
      }
    };

    initializeDashboard();

    // Listen for auth state changes (simplified)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        window.location.href = "/login";
      }
    });

    return () => subscription.unsubscribe();
  }, []); // Remove checkPaymentStatus dependency to prevent infinite loop

  const handlePayment = () => {
    window.location.href = "/payment";
  };

  const handleOnboarding = () => {
    window.location.href = "/onboarding";
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d67635] mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-[#d67635]">G</span>nymble Dashboard
            </h1>
            <p className="text-gray-400 text-sm">
              Welcome back, {profile?.full_name || user?.email}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-400 hover:text-white border border-gray-700 rounded-md hover:border-gray-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Payment Status Banner */}
        {profile?.payment_status === "pending" && (
          <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-800 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-red-400 mb-2">
                  Payment Required
                </h2>
                <p className="text-gray-300">
                  Complete your onboarding payment to unlock full platform
                  access and start using Gnymble.
                </p>
              </div>
              <button
                onClick={handlePayment}
                className="bg-[#d67635] hover:bg-[#c96528] px-6 py-3 rounded-md font-semibold text-white"
              >
                Complete Payment
              </button>
            </div>
          </div>
        )}

        {profile?.payment_status === "paid" && (
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-800 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-green-400 mb-2">
                  Payment Completed ✓
                </h2>
                <p className="text-gray-300 mb-4">
                  Welcome to Gnymble! Your payment is complete. Now let's get
                  you set up for SMS compliance.
                  {profile.payment_date && (
                    <span className="block mt-1 text-sm text-gray-400">
                      Payment completed on{" "}
                      {new Date(profile.payment_date).toLocaleDateString()}
                    </span>
                  )}
                </p>
                <button
                  onClick={handleOnboarding}
                  className="bg-[#d67635] hover:bg-[#c96528] px-6 py-3 rounded-md font-semibold text-white transition-colors"
                >
                  Start Onboarding →
                </button>
              </div>
              <div className="text-green-400 text-2xl ml-4">✓</div>
            </div>
          </div>
        )}

        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Name:</span>
                <span className="ml-2">{profile?.full_name || "Not set"}</span>
              </div>
              <div>
                <span className="text-gray-400">Email:</span>
                <span className="ml-2">{profile?.email}</span>
              </div>
              <div>
                <span className="text-gray-400">Phone:</span>
                <span className="ml-2">{profile?.phone || "Not set"}</span>
              </div>
              <div>
                <span className="text-gray-400">Member since:</span>
                <span className="ml-2">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Company Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Company:</span>
                <span className="ml-2">
                  {user?.user_metadata?.company_name || "Not set"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Role:</span>
                <span className="ml-2 capitalize">Owner</span>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>
                <span
                  className={`ml-2 ${
                    profile?.payment_status === "paid"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {profile?.payment_status === "paid"
                    ? "Active - Ready for Onboarding"
                    : "Pending Payment"}
                </span>
              </div>
              {profile?.payment_status === "paid" && (
                <div>
                  <span className="text-gray-400">Onboarding:</span>
                  <span className="ml-2 text-blue-400">Ready to Start</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Onboarding Progress */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-6">Onboarding Progress</h3>
          <div className="space-y-4">
            {onboardingSteps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  step.completed
                    ? "bg-green-900/20 border-green-800"
                    : "bg-gray-800/50 border-gray-700"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed
                        ? "bg-green-600 text-white"
                        : "bg-gray-600 text-gray-400"
                    }`}
                  >
                    {step.completed ? "✓" : step.required ? "!" : "○"}
                  </div>
                  <div>
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>
                </div>
                {step.id === "payment" && !step.completed && (
                  <button
                    onClick={handlePayment}
                    className="bg-[#d67635] hover:bg-[#c96528] px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Pay Now
                  </button>
                )}
                {step.id === "brand-verification" &&
                  profile?.payment_status === "paid" &&
                  !step.completed && (
                    <button
                      onClick={handleOnboarding}
                      className="bg-[#d67635] hover:bg-[#c96528] px-4 py-2 rounded-md text-sm font-medium"
                    >
                      {profile?.brand_verification_status === "pending"
                        ? "Check Status"
                        : "Start Brand Verification"}
                    </button>
                  )}
                {step.id === "campaign-approval" &&
                  profile?.payment_status === "paid" &&
                  profile?.brand_verification_status === "verified" &&
                  !step.completed && (
                    <button
                      onClick={handleOnboarding}
                      className="bg-[#d67635] hover:bg-[#c96528] px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Start Campaign Approval
                    </button>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-900/20 border border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-4">
            Next Steps
          </h3>
          <div className="space-y-3 text-gray-300">
            {profile?.payment_status !== "paid" ? (
              <>
                <p>1. Complete your payment to unlock platform access</p>
                <p>2. Complete brand verification for SMS compliance</p>
                <p>3. Get campaign approval for messaging</p>
                <p>4. Access your Gnymble dashboard and start messaging</p>
              </>
            ) : (
              <>
                <p>1. ✅ Payment completed - Ready for onboarding</p>
                {profile?.brand_verification_status === "verified" ? (
                  <p>2. ✅ Brand verification completed</p>
                ) : profile?.brand_verification_status === "pending" ? (
                  <p>2. 🔄 Brand verification in progress with TCR</p>
                ) : profile?.brand_verification_status === "rejected" ? (
                  <p>
                    2. ❌ Brand verification rejected - please review and
                    resubmit
                  </p>
                ) : (
                  <p>2. Complete brand verification (TCR compliance)</p>
                )}
                {profile?.brand_verification_status === "verified" ? (
                  <p>3. Get campaign approval for SMS messaging</p>
                ) : (
                  <p>3. ⏳ Campaign approval (requires brand verification)</p>
                )}
                <p>4. Access your Gnymble dashboard and start messaging</p>
                <div className="mt-4 space-y-3">
                  {profile?.brand_verification_status === "verified" ? (
                    <button
                      onClick={handleOnboarding}
                      className="bg-[#d67635] hover:bg-[#c96528] px-6 py-3 rounded-md font-semibold text-white transition-colors"
                    >
                      Start Campaign Approval →
                    </button>
                  ) : (
                    <button
                      onClick={handleOnboarding}
                      className="bg-[#d67635] hover:bg-[#c96528] px-6 py-3 rounded-md font-semibold text-white transition-colors"
                    >
                      {profile?.brand_verification_status === "pending"
                        ? "Check Brand Status"
                        : "Start Brand Verification"}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



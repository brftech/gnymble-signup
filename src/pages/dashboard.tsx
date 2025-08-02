import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";
import { testWebhookLogic } from "../lib/testWebhook";
import { testDatabaseSimple } from "../lib/testDatabaseSimple";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  payment_status: string;
  stripe_customer_id?: string;
  payment_date?: string;
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
      description: "Submit company information for TCR compliance",
      completed: false, // Will be updated based on onboarding status
      required: true,
    },
    {
      id: "campaign-approval",
      title: "Campaign Approval",
      description: "Get campaign approved for SMS messaging",
      completed: false, // Will be updated based on onboarding status
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
  }, [user]);

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
  }, [checkPaymentStatus]);

  const loadUserProfile = async (userId: string) => {
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
  };

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

  const handleTestWebhook = async () => {
    if (!user) {
      toast.error("No user found");
      return;
    }

    console.log("🧪 Testing webhook logic for user:", user.id);
    const result = await testWebhookLogic(user.id);

    if (result.success) {
      toast.success("Webhook test successful! Check console for details.");
      console.log("✅ Webhook test result:", result);
    } else {
      toast.error(
        `Webhook test failed: ${
          result.error ? String(result.error) : "Unknown error"
        }`
      );
      console.error("❌ Webhook test error:", result.error);
    }
  };

  const handleTestDatabaseSimple = async () => {
    console.log("🧪 Testing simple database operations...");
    const result = await testDatabaseSimple();

    if (result.success) {
      toast.success("Database test successful! RLS is disabled.");
      console.log("✅ Database test result:", result);
    } else {
      toast.error(
        `Database test failed: ${
          result.error ? String(result.error) : "Unknown error"
        }`
      );
      console.error("❌ Database test error:", result.error);
    }
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
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-400 hover:text-white border border-gray-700 rounded-md hover:border-gray-600"
          >
            Logout
          </button>
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
                      Start Onboarding
                    </button>
                  )}
                {step.id === "campaign-approval" &&
                  profile?.payment_status === "paid" &&
                  !step.completed && (
                    <button
                      onClick={handleOnboarding}
                      className="bg-[#d67635] hover:bg-[#c96528] px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Continue Onboarding
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
                <p>2. Complete brand verification (TCR compliance)</p>
                <p>3. Get campaign approval for SMS messaging</p>
                <p>4. Access your Gnymble dashboard and start messaging</p>
                <div className="mt-4 space-y-3">
                  <button
                    onClick={handleOnboarding}
                    className="bg-[#d67635] hover:bg-[#c96528] px-6 py-3 rounded-md font-semibold text-white transition-colors"
                  >
                    Start Onboarding Process →
                  </button>

                  <button
                    onClick={handleTestWebhook}
                    className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-md font-medium text-white transition-colors"
                  >
                    Test Webhook Logic (Debug)
                  </button>

                  <button
                    onClick={handleTestDatabaseSimple}
                    className="bg-blue-700 hover:bg-blue-600 px-6 py-3 rounded-md font-medium text-white transition-colors"
                  >
                    Test Database (No RLS)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

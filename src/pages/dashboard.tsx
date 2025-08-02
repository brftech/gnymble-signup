import { useEffect, useState } from "react";
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
  created_at: string;
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
      id: "company-setup",
      title: "Company Setup",
      description: "Configure your company information and preferences",
      completed: false,
      required: true,
    },
    {
      id: "sms-verification",
      title: "SMS Verification",
      description: "Verify your phone number for SMS capabilities",
      completed: false,
      required: true,
    },
    {
      id: "platform-access",
      title: "Platform Access",
      description: "Get access to the Gnymble platform dashboard",
      completed: false,
      required: true,
    },
  ];

  useEffect(() => {
    checkUser();
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");

    if (paymentStatus === "success") {
      toast.success("Payment completed successfully! Welcome to Gnymble!");
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === "cancelled") {
      toast.error("Payment was cancelled. You can try again anytime.");
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        await loadUserProfile(user.id);
      } else {
        // Redirect to login if no user
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error checking user:", error);
      toast.error("Error loading user data");
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handlePayment = () => {
    window.location.href = "/payment";
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
    <div className="min-h-screen bg-black text-white pt-16">
      {/* Header */}
      <header className="border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
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

      <div className="max-w-7xl mx-auto p-6">
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
              <div>
                <h2 className="text-xl font-semibold text-green-400 mb-2">
                  Payment Completed ✓
                </h2>
                <p className="text-gray-300">
                  Welcome to Gnymble! Your account is now active and ready to
                  use.
                  {profile.payment_date && (
                    <span className="block mt-1 text-sm text-gray-400">
                      Payment completed on{" "}
                      {new Date(profile.payment_date).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
              <div className="text-green-400 text-2xl">✓</div>
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
                    ? "Active"
                    : "Pending Payment"}
                </span>
              </div>
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
            <p>1. Complete your payment to unlock platform access</p>
            <p>2. Set up your company preferences and SMS settings</p>
            <p>3. Verify your phone number for SMS capabilities</p>
            <p>4. Access your Gnymble dashboard and start messaging</p>
          </div>
        </div>
      </div>
    </div>
  );
}

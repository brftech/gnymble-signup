import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";

export default function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          toast.error("Authentication failed. Please try again.");
          navigate("/login");
          return;
        }

        if (data.session) {
          console.log("Authentication successful:", data.session.user.email);
          toast.success("Successfully signed in!");

          // Check if profile is complete (has phone and company_id)
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("phone, company_id")
            .eq("id", data.session.user.id)
            .single();

          if (profileError) {
            console.error("Error checking profile:", profileError);
            navigate("/payment");
            return;
          }

          // If profile is incomplete, redirect to complete-profile
          if (!profile.phone || !profile.company_id) {
            console.log("Profile incomplete, redirecting to complete-profile");
            navigate("/complete-profile");
          } else {
            console.log("Profile complete, redirecting to payment");
            navigate("/payment");
          }
        } else {
          console.log("No session found, redirecting to login");
          navigate("/login");
        }
      } catch (error) {
        console.error("Unexpected error during auth callback:", error);
        toast.error("An unexpected error occurred. Please try again.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">
              Completing sign in...
            </h2>
            <p className="text-muted-foreground">
              Please wait while we complete your authentication.
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
            <p className="text-muted-foreground">
              Taking you to your dashboard.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

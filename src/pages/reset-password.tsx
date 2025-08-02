import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";
import LoginNavigation from "../components/LoginNavigation";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Password validation
  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid:
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChar,
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    };
  };

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword;

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth check error:", error);
          toast.error("Authentication error. Please try the reset link again.");
          navigate("/login");
          return;
        }

        if (session) {
          console.log(
            "User authenticated for password reset:",
            session.user.email
          );
          setIsAuthenticated(true);
        } else {
          console.log("No session found, checking URL parameters");
          // Check if we have access_token in URL hash (from email link)
          const hashParams = new URLSearchParams(location.hash.substring(1));
          const accessToken = hashParams.get("access_token");

          if (accessToken) {
            console.log("Access token found in URL, setting session");
            // Set the session with the access token
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get("refresh_token") || "",
            });

            if (setSessionError) {
              console.error("Error setting session:", setSessionError);
              toast.error("Invalid reset link. Please request a new one.");
              navigate("/login");
              return;
            }

            setIsAuthenticated(true);
          } else {
            console.log("No access token found, redirecting to login");
            toast.error("Invalid reset link. Please request a new one.");
            navigate("/login");
            return;
          }
        }
      } catch (error) {
        console.error("Unexpected error during auth check:", error);
        toast.error("An unexpected error occurred. Please try again.");
        navigate("/login");
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate, location.hash]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValidation.isValid) {
      toast.error("Please ensure your password meets all requirements");
      return;
    }

    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(error.message);
        setError(error.message);
      } else {
        toast.success(
          "Password updated successfully! Your account is now secure."
        );
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <LoginNavigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">
              Verifying your reset link...
            </h2>
            <p className="text-muted-foreground">
              Please wait while we authenticate your request.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <LoginNavigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Invalid Reset Link</h2>
            <p className="text-muted-foreground mb-4">
              This reset link is invalid or has expired.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-primary hover:bg-primary-glow text-primary-foreground px-6 py-2 rounded-md font-medium transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LoginNavigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Platform Capabilities Tag */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            SECURE PASSWORD RESET
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Create Your New
            <br />
            <span className="text-primary">Password</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Your identity has been verified. Choose a strong password to secure
            your account.
          </p>

          {/* Reset Password Form */}
          <div className="max-w-md mx-auto">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div className="text-center mb-6">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  Identity Verified
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your account has been authenticated. Set your new password
                  below.
                </p>
              </div>

              <form
                onSubmit={handleResetPassword}
                className="space-y-4 text-left"
              >
                {/* Password field */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-3 pr-12 rounded-md bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Password requirements */}
                {password && (
                  <div className="text-xs space-y-1">
                    <p className="text-muted-foreground font-medium">
                      Password requirements:
                    </p>
                    <div className="space-y-1">
                      <div
                        className={`flex items-center gap-2 ${
                          passwordValidation.minLength
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        <span>{passwordValidation.minLength ? "✓" : "✗"}</span>
                        <span>At least 8 characters</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${
                          passwordValidation.hasUpperCase
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        <span>
                          {passwordValidation.hasUpperCase ? "✓" : "✗"}
                        </span>
                        <span>One uppercase letter</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${
                          passwordValidation.hasLowerCase
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        <span>
                          {passwordValidation.hasLowerCase ? "✓" : "✗"}
                        </span>
                        <span>One lowercase letter</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${
                          passwordValidation.hasNumbers
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        <span>{passwordValidation.hasNumbers ? "✓" : "✗"}</span>
                        <span>One number</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${
                          passwordValidation.hasSpecialChar
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        <span>
                          {passwordValidation.hasSpecialChar ? "✓" : "✗"}
                        </span>
                        <span>One special character</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm Password field */}
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`w-full p-3 pr-12 rounded-md bg-input border focus:outline-none focus:ring-2 focus:ring-primary text-foreground ${
                      confirmPassword
                        ? passwordsMatch
                          ? "border-green-500"
                          : "border-red-500"
                        : "border-border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Password match indicator */}
                {confirmPassword && (
                  <div
                    className={`text-xs flex items-center gap-2 ${
                      passwordsMatch ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    <span>{passwordsMatch ? "✓" : "✗"}</span>
                    <span>
                      {passwordsMatch
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !passwordValidation.isValid ||
                    !passwordsMatch ||
                    !password ||
                    !confirmPassword
                  }
                  className="w-full py-3 bg-primary hover:bg-primary-glow rounded-md font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>

                {error && (
                  <p className="text-destructive text-sm mt-2">{error}</p>
                )}
              </form>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm">
                    <p className="font-medium text-blue-500 mb-1">
                      Security Note
                    </p>
                    <p className="text-muted-foreground">
                      This reset link is valid for a limited time. For your
                      security, please complete this process now.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Remember your password?{" "}
                <a
                  href="/login"
                  className="underline text-primary hover:text-primary-glow"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

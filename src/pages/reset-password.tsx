import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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
        toast.success("Password updated successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LoginNavigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Platform Capabilities Tag */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            PASSWORD RESET
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Reset Your
            <br />
            <span className="text-primary">Password</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Enter your new password below to complete the reset process.
          </p>

          {/* Reset Password Form */}
          <div className="max-w-md mx-auto">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  Create New Password
                </h2>
                <p className="text-sm text-muted-foreground">
                  Choose a strong password for your account
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4 text-left">
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
                        <span>{passwordValidation.hasUpperCase ? "✓" : "✗"}</span>
                        <span>One uppercase letter</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${
                          passwordValidation.hasLowerCase
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        <span>{passwordValidation.hasLowerCase ? "✓" : "✗"}</span>
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
                        <span>{passwordValidation.hasSpecialChar ? "✓" : "✗"}</span>
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
                      {passwordsMatch ? "Passwords match" : "Passwords do not match"}
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

                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
              </form>

              <p className="text-sm text-muted-foreground text-center mt-6">
                Remember your password?{" "}
                <a href="/login" className="underline text-primary hover:text-primary-glow">
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
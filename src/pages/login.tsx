// src/pages/login.tsx
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";
import { getResetPasswordUrl } from "../config/auth";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        toast.error(error.message);
        setError(error.message);
        return;
      }

      if (data.user) {
        toast.success("Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = "https://gnymble.percytech.com/dashboard";
        }, 1500);
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      toast.error(error.message);
      setError(error.message);
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const redirectUrl = getResetPasswordUrl();
      console.log('Reset password redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(
        forgotPasswordEmail,
        {
          redirectTo: redirectUrl,
        }
      );

      if (error) {
        toast.error(error.message);
      } else {
        setForgotPasswordSent(true);
        toast.success("Password reset email sent! Check your inbox.");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setForgotPasswordSent(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Platform Capabilities Tag */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            ACCOUNT ACCESS
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Welcome back to
            <br />
            <span className="text-primary">Gnymble</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Sign in to your account to continue building authentic relationships
            while navigating industry regulations.
          </p>

          {/* Login Form */}
          <div className="max-w-md mx-auto">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  Sign In to Your Account
                </h2>
                <p className="text-sm text-muted-foreground">
                  Access your Gnymble dashboard
                </p>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary-glow rounded-md font-semibold text-primary-foreground disabled:opacity-50 transition-colors"
              >
                {loading ? "Signing in..." : "Sign in with Google"}
              </button>

              <div className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                <span className="h-px w-20 bg-border"></span>
                or
                <span className="h-px w-20 bg-border"></span>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  onChange={handleChange}
                  value={form.email}
                  required
                  className="w-full p-3 rounded-md bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />

                <div className="relative">
                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    onChange={handleChange}
                    value={form.password}
                    required
                    className="w-full p-3 rounded-md bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-primary hover:text-primary-glow"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary hover:bg-primary-glow rounded-md font-semibold text-primary-foreground disabled:opacity-50 transition-colors"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                {error && (
                  <p className="text-destructive text-sm mt-2">{error}</p>
                )}
              </form>

              {/* Forgot Password Modal */}
              {showForgotPassword && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold mb-2">
                        {forgotPasswordSent
                          ? "Check Your Email"
                          : "Reset Your Password"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {forgotPasswordSent
                          ? "We've sent a password reset link to your email address."
                          : "Enter your email address and we'll send you a link to reset your password."}
                      </p>
                    </div>

                    {!forgotPasswordSent ? (
                      <form
                        onSubmit={handleForgotPassword}
                        className="space-y-4"
                      >
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={forgotPasswordEmail}
                          onChange={(e) =>
                            setForgotPasswordEmail(e.target.value)
                          }
                          required
                          className="w-full p-3 rounded-md bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        />
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={resetForgotPassword}
                            className="flex-1 py-3 border border-border text-foreground hover:bg-secondary rounded-md font-medium transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={forgotPasswordLoading}
                            className="flex-1 py-3 bg-primary hover:bg-primary-glow rounded-md font-semibold text-primary-foreground disabled:opacity-50 transition-colors"
                          >
                            {forgotPasswordLoading
                              ? "Sending..."
                              : "Send Reset Link"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center">
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
                          <p className="text-sm text-muted-foreground mb-4">
                            Didn't receive the email? Check your spam folder or
                            try again.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={resetForgotPassword}
                            className="flex-1 py-3 bg-primary hover:bg-primary-glow rounded-md font-semibold text-primary-foreground transition-colors"
                          >
                            Back to Login
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground text-center mt-6">
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="underline text-primary hover:text-primary-glow"
                >
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

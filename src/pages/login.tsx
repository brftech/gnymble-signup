// src/pages/login.tsx
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
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
            Sign in to your account to continue building authentic relationships while navigating industry regulations.
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
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary hover:bg-primary-glow rounded-md font-semibold text-primary-foreground disabled:opacity-50 transition-colors"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
              </form>

              <p className="text-sm text-muted-foreground text-center mt-6">
                Don't have an account?{" "}
                <a href="/signup" className="underline text-primary hover:text-primary-glow">
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

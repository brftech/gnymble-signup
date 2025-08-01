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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold">
          Welcome back to <span className="text-[#d67635]">G</span>nymble
        </h1>
        <p className="text-sm text-gray-400">
          Sign in to your account to continue
        </p>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 bg-[#d67635] hover:bg-[#c96528] rounded-md font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        <div className="text-gray-600 text-sm flex items-center justify-center gap-2">
          <span className="h-px w-20 bg-gray-700"></span>
          or
          <span className="h-px w-20 bg-gray-700"></span>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            onChange={handleChange}
            value={form.email}
            required
            className="w-full p-3 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d67635]"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            value={form.password}
            required
            className="w-full p-3 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d67635]"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#d67635] hover:bg-[#c96528] rounded-md font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>

        <p className="text-sm text-gray-500">
          Don't have an account?{" "}
          <a href="/signup" className="underline text-gray-300 hover:text-white">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";

export default function SignupPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fullName = `${form.firstName} ${form.lastName}`.trim();

    try {
      // Check if user already exists by looking up the email
      const { data: existingUsers } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", form.email)
        .single();

      if (existingUsers) {
        toast.error(
          "An account with this email already exists. Please log in instead."
        );
        setError("Account already exists");
        return;
      }

      // Create new user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: fullName,
            company_name: form.company,
          },
        },
      });

      if (signUpError) {
        // Check if it's a duplicate email error
        if (signUpError.message.includes("already registered")) {
          toast.error(
            "An account with this email already exists. Please log in instead."
          );
          setError("Account already exists");
        } else {
          toast.error(signUpError.message);
          setError(signUpError.message);
        }
        return;
      }

      if (data.user) {
        toast.success(
          "Account created successfully! Redirecting to checkout..."
        );

        // Add a delay to show the toast before redirecting
        setTimeout(() => {
          // Redirect to Stripe checkout after successful signup
          window.location.href =
            "https://buy.stripe.com/6oU5kE2OHaJy76V4a9efC03";
        }, 2000); // 2 second delay
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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold">
          Get Started with <span className="text-[#d67635]">G</span>nymble
        </h1>
        <p className="text-sm text-gray-400">
          A premium SMS platform for bold businesses. Built for compliance. Made
          for character.
        </p>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 bg-[#d67635] hover:bg-[#c96528] rounded-md font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Signing up..." : "Sign Up with Google"}
        </button>

        <div className="text-gray-600 text-sm flex items-center justify-center gap-2">
          <span className="h-px w-20 bg-gray-700"></span>
          or
          <span className="h-px w-20 bg-gray-700"></span>
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-4 text-left">
          <div className="flex gap-4">
            <input
              name="firstName"
              placeholder="First Name"
              onChange={handleChange}
              value={form.firstName}
              required
              className="w-1/2 p-3 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d67635]"
            />
            <input
              name="lastName"
              placeholder="Last Name"
              onChange={handleChange}
              value={form.lastName}
              required
              className="w-1/2 p-3 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d67635]"
            />
          </div>

          <input
            name="email"
            type="email"
            placeholder="Work Email"
            onChange={handleChange}
            value={form.email}
            required
            className="w-full p-3 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d67635]"
          />

          <input
            name="company"
            placeholder="Company Name"
            onChange={handleChange}
            value={form.company}
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
            {loading ? "Signing up..." : "Sign Up with Email"}
          </button>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>

        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="underline text-gray-300 hover:text-white">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

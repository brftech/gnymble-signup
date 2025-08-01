import { useState } from "react";
import { supabase } from "../lib/supabaseclient";

export default function SignupPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
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
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fullName = `${form.firstName} ${form.lastName}`.trim();

    const { error: signUpError } = await supabase.auth.signUp({
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
      setError(signUpError.message);
    }

    setLoading(false);
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
          className="w-full py-3 bg-[#d67635] hover:bg-[#c96528] rounded-md font-semibold text-white"
        >
          Continue with Google
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
            name="company"
            placeholder="Company Name"
            onChange={handleChange}
            value={form.company}
            required
            className="w-full p-3 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d67635]"
          />

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

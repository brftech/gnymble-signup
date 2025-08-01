import { useState, useRef } from "react";
import { toast } from "sonner";
import ReCAPTCHA from "react-google-recaptcha";
import { supabase } from "../lib/supabaseClient";

export default function SignupPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+1", // Default to US
    company: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // Check email existence in real-time
    if (e.target.name === "email" && e.target.value) {
      checkEmailExists(e.target.value);
    }
  };

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

  const passwordValidation = validatePassword(form.password);
  const passwordsMatch = form.password === form.confirmPassword;

  // Phone number validation
  const validatePhone = (phone: string) => {
    if (!phone) return false;
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, "");
    const isValid = digitsOnly.length >= 10 && digitsOnly.length <= 15;

    // Debug logging (remove in production)
    console.log(
      `Phone validation: "${phone}" -> "${digitsOnly}" (${digitsOnly.length} digits) -> ${isValid}`
    );

    return isValid;
  };

  const phoneValidation = validatePhone(form.phone);

  // Country codes for phone numbers
  const countryCodes = [
    { code: "+1", country: "US", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+61", country: "AU", flag: "🇦🇺" },
    { code: "+86", country: "CN", flag: "🇨🇳" },
    { code: "+91", country: "IN", flag: "🇮🇳" },
    { code: "+81", country: "JP", flag: "🇯🇵" },
    { code: "+49", country: "DE", flag: "🇩🇪" },
    { code: "+33", country: "FR", flag: "🇫🇷" },
    { code: "+39", country: "IT", flag: "🇮🇹" },
    { code: "+34", country: "ES", flag: "🇪🇸" },
    { code: "+31", country: "NL", flag: "🇳🇱" },
    { code: "+46", country: "SE", flag: "🇸🇪" },
    { code: "+47", country: "NO", flag: "🇳🇴" },
    { code: "+45", country: "DK", flag: "🇩🇰" },
    { code: "+358", country: "FI", flag: "🇫🇮" },
    { code: "+41", country: "CH", flag: "🇨🇭" },
    { code: "+43", country: "AT", flag: "🇦🇹" },
    { code: "+32", country: "BE", flag: "🇧🇪" },
    { code: "+351", country: "PT", flag: "🇵🇹" },
    { code: "+353", country: "IE", flag: "🇮🇪" },
  ];

  const checkEmailExists = async (email: string) => {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailExists(false);
      setCheckingEmail(false);
      return;
    }

    setCheckingEmail(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.log("Email check error:", error);
      }

      setEmailExists(!!data);
    } catch (error) {
      console.log("Email check error:", error);
      setEmailExists(false);
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleCaptchaExpired = () => {
    setCaptchaToken(null);
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

    // Validate password requirements
    if (!passwordValidation.isValid) {
      toast.error("Please ensure your password meets all requirements.");
      setError("Password requirements not met");
      setLoading(false);
      return;
    }

    // Validate password confirmation
    if (!passwordsMatch) {
      toast.error("Passwords do not match.");
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate phone number
    if (!phoneValidation) {
      toast.error("Please enter a valid phone number.");
      setError("Invalid phone number");
      setLoading(false);
      return;
    }

    // Validate reCAPTCHA
    if (!captchaToken) {
      toast.error("Please complete the reCAPTCHA verification.");
      setError("reCAPTCHA verification required");
      setLoading(false);
      return;
    }

    // Check if email already exists
    if (emailExists) {
      toast.error(
        "An account with this email already exists. Please use a different email or sign in."
      );
      setError("Email already exists");
      setLoading(false);
      return;
    }

    const fullName = `${form.firstName} ${form.lastName}`.trim();

    try {
      // Email existence is already checked in real-time, so we can proceed directly

      // Create new user without email confirmation
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
          data: {
            full_name: fullName,
            company_name: form.company,
            phone: `${form.countryCode}${form.phone}`,
          },
        },
      });

      console.log("Signup response:", { data, error: signUpError });

      // If signup successful, immediately sign in the user
      if (data.user && !signUpError) {
        console.log("User created, attempting immediate sign in...");

        // Small delay to ensure user is created in database
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
          });

        console.log("Sign in response:", {
          data: signInData,
          error: signInError,
        });

        if (signInError) {
          console.log("Sign in error:", signInError);
          // Try alternative approach - create user directly in profiles table
          console.log("Attempting to create user profile directly...");

          const { error: profileError } = await supabase
            .from("profiles")
            .insert([
              {
                id: data.user.id,
                email: form.email,
                full_name: fullName,
                phone: `${form.countryCode}${form.phone}`,
                company_name: form.company,
              },
            ]);

          if (profileError) {
            console.log("Profile creation error:", profileError);
          } else {
            console.log("Profile created successfully");
          }
        } else {
          console.log("User signed in successfully after signup");
        }
      }

      if (signUpError) {
        // Check if it's a duplicate email error
        if (signUpError.message.includes("already registered")) {
          toast.error(
            "An account with this email already exists. Redirecting to your dashboard..."
          );
          setError("Account already exists");
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            window.location.href = "https://gnymble.percytech.com/dashboard";
          }, 2000);
        } else {
          toast.error(signUpError.message);
          setError(signUpError.message);
        }
        return;
      }

      if (data.user) {
        console.log("User created successfully:", data.user);

        // Check if we have a session
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("Session data:", sessionData);

        toast.success(
          "Account created successfully! Redirecting to checkout..."
        );

        // Add a delay to show the toast before redirecting
        setTimeout(() => {
          console.log("Redirecting to payment page...");
          // Redirect to custom payment page
          window.location.href = "/payment";
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

          <div className="relative">
            <input
              name="email"
              type="email"
              placeholder="Work Email"
              onChange={handleChange}
              value={form.email}
              required
              className={`w-full p-3 rounded-md bg-gray-900 border focus:outline-none focus:ring-2 focus:ring-[#d67635] ${
                emailExists
                  ? "border-red-500 bg-red-900/20"
                  : checkingEmail
                  ? "border-yellow-500 bg-yellow-900/20"
                  : "border-gray-700"
              }`}
            />
            {checkingEmail && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#d67635]"></div>
              </div>
            )}
            {emailExists && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
          {emailExists && (
            <p className="text-red-400 text-sm">
              An account with this email already exists. Please use a different
              email or sign in.
            </p>
          )}

          {/* Phone field with country code */}
          <div className="flex gap-2">
            <select
              name="countryCode"
              value={form.countryCode}
              onChange={handleChange}
              className="w-24 p-3 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d67635] text-sm"
            >
              {countryCodes.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.code}
                </option>
              ))}
            </select>
            <input
              name="phone"
              type="tel"
              placeholder="Cell Phone Number"
              onChange={handleChange}
              value={form.phone}
              required
              className={`flex-1 p-3 rounded-md bg-gray-900 border focus:outline-none focus:ring-2 focus:ring-[#d67635] ${
                form.phone
                  ? phoneValidation
                    ? "border-green-500"
                    : "border-red-500"
                  : "border-gray-700"
              }`}
            />
          </div>

          {/* Phone validation indicator */}
          {form.phone && (
            <div
              className={`text-xs flex items-center gap-2 ${
                phoneValidation ? "text-green-400" : "text-red-400"
              }`}
            >
              <span>{phoneValidation ? "✓" : "✗"}</span>
              <span>
                {phoneValidation
                  ? "Valid phone number format"
                  : "Please enter a valid phone number format (10-15 digits)"}
              </span>
            </div>
          )}

          <input
            name="company"
            placeholder="Company Name"
            onChange={handleChange}
            value={form.company}
            required
            className="w-full p-3 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d67635]"
          />

          {/* Password field with show/hide toggle */}
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={handleChange}
              value={form.password}
              required
              className="w-full p-3 pr-12 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d67635]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Password requirements */}
          {form.password && (
            <div className="text-xs space-y-1">
              <p className="text-gray-400 font-medium">
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
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              onChange={handleChange}
              value={form.confirmPassword}
              required
              className={`w-full p-3 pr-12 rounded-md bg-gray-900 border focus:outline-none focus:ring-2 focus:ring-[#d67635] ${
                form.confirmPassword
                  ? passwordsMatch
                    ? "border-green-500"
                    : "border-red-500"
                  : "border-gray-700"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Password match indicator */}
          {form.confirmPassword && (
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

          {/* reCAPTCHA */}
          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test key - replace with your actual key
              onChange={handleCaptchaChange}
              onExpired={handleCaptchaExpired}
            />
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              !passwordValidation.isValid ||
              !passwordsMatch ||
              !phoneValidation ||
              !captchaToken ||
              emailExists ||
              checkingEmail
            }
            className="w-full py-3 bg-[#d67635] hover:bg-[#c96528] rounded-md font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
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

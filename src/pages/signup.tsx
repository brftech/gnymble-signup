import { useState } from "react";
import { toast } from "sonner";
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



  const handleGoogleSignIn = async () => {
    setLoading(true);

    // Determine the correct redirect URL based on current environment
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const redirectUrl = `${window.location.origin}/auth/callback`;

    console.log("Google OAuth redirect URL:", redirectUrl);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
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
      console.log(
        "Phone number being stored:",
        `${form.countryCode}${form.phone}`
      );

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
            window.location.href = "/dashboard";
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Platform Capabilities Tag */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            PLATFORM CAPABILITIES
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Join the Premium
            <br />
            <span className="text-primary">SMS Revolution</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Get started with Gnymble's intelligent SMS platform designed for
            premium hospitality venues. Build authentic relationships while
            navigating industry regulations with confidence.
          </p>

          {/* Sign Up Form */}
          <div className="max-w-md mx-auto">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  Create Your Account
                </h2>
                <p className="text-sm text-muted-foreground">
                  Start your journey with Gnymble today
                </p>
              </div>

              <form
                onSubmit={handleEmailSignup}
                className="space-y-4 text-left"
              >
                <div className="flex gap-4">
                  <input
                    name="firstName"
                    placeholder="First Name"
                    onChange={handleChange}
                    value={form.firstName}
                    required
                    className="w-1/2 p-3 rounded-md bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                  <input
                    name="lastName"
                    placeholder="Last Name"
                    onChange={handleChange}
                    value={form.lastName}
                    required
                    className="w-1/2 p-3 rounded-md bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
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
                    className={`w-full p-3 rounded-md bg-input border focus:outline-none focus:ring-2 focus:ring-primary text-foreground ${
                      emailExists
                        ? "border-destructive bg-destructive/10"
                        : checkingEmail
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  />
                  {checkingEmail && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    </div>
                  )}
                  {emailExists && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-destructive">
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
                  <p className="text-destructive text-sm">
                    An account with this email already exists. Please use a
                    different email or sign in.
                  </p>
                )}

                {/* Phone field with country code */}
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={form.countryCode}
                    onChange={handleChange}
                    className="w-24 p-3 rounded-md bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
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
                    className={`flex-1 p-3 rounded-md bg-input border focus:outline-none focus:ring-2 focus:ring-primary text-foreground ${
                      form.phone
                        ? phoneValidation
                          ? "border-green-500"
                          : "border-red-500"
                        : "border-border"
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
                  className="w-full p-3 rounded-md bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
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
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    onChange={handleChange}
                    value={form.confirmPassword}
                    required
                    className={`w-full p-3 pr-12 rounded-md bg-input border focus:outline-none focus:ring-2 focus:ring-primary text-foreground ${
                      form.confirmPassword
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
                {form.confirmPassword && (
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
                    !phoneValidation ||
                    emailExists ||
                    checkingEmail
                  }
                  className="w-full py-3 bg-primary hover:bg-primary-glow rounded-md font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Signing up..." : "Sign Up with Email"}
                </button>

                {error && (
                  <p className="text-destructive text-sm mt-2">{error}</p>
                )}
              </form>

              <div className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                <span className="h-px w-20 bg-border"></span>
                or
                <span className="h-px w-20 bg-border"></span>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-md font-semibold text-gray-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? "Signing up..." : "Continue with Google"}
              </button>

              <p className="text-sm text-muted-foreground text-center mt-6">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="underline text-primary hover:text-primary-glow"
                >
                  Log in
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

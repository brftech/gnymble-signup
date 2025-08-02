// Example configuration for PercyMD project
// Copy this file to auth.ts and update the values for PercyMD

export const authConfig = {
  // Project-specific branding
  projectName: "PercyMD",
  projectDisplayName: "PercyMD",

  // URLs for different environments
  urls: {
    development: {
      signup: "http://localhost:5173/signup",
      login: "http://localhost:5173/login",
      resetPassword: "http://localhost:5173/reset-password",
      dashboard: "http://localhost:5173/dashboard",
    },
    production: {
      signup: "https://percymd-signup.vercel.app/signup",
      login: "https://percymd-signup.vercel.app/login",
      resetPassword: "https://percymd-signup.vercel.app/reset-password",
      dashboard: "https://percymd-signup.vercel.app/dashboard",
    },
  },

  // Email templates and branding
  email: {
    fromName: "PercyMD Auth",
    fromEmail: "auth@percymd.com",
    subjectPrefix: "[PercyMD]",
  },

  // Supabase configuration
  supabase: {
    // These will be overridden by environment variables
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
};

// Helper function to get current environment URLs
export const getCurrentUrls = () => {
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment
    ? authConfig.urls.development
    : authConfig.urls.production;
};

// Helper function to get reset password URL
export const getResetPasswordUrl = () => {
  const urls = getCurrentUrls();
  return urls.resetPassword;
};

// Auth configuration for different projects
export const authConfig = {
  // Project-specific branding
  projectName: "Gnymble",
  projectDisplayName: "Gnymble",

  // URLs for different environments
  urls: {
    development: {
      signup: "http://localhost:5173/signup",
      login: "http://localhost:5173/login",
      resetPassword: "http://localhost:5173/reset-password",
      dashboard: "http://localhost:5173/dashboard",
    },
    production: {
      signup: "https://gnymble-signup-7z2ajarou-percy-tech.vercel.app/signup",
      login: "https://gnymble-signup-7z2ajarou-percy-tech.vercel.app/login",
      resetPassword:
        "https://gnymble-signup-7z2ajarou-percy-tech.vercel.app/reset-password",
      dashboard:
        "https://gnymble-signup-7z2ajarou-percy-tech.vercel.app/dashboard",
    },
  },

  // Email templates and branding
  email: {
    fromName: "Gnymble Auth",
    fromEmail: "auth@gnymble.com",
    subjectPrefix: "[Gnymble]",
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

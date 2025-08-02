// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
import { authConfig } from "../config/auth";

const supabaseUrl = authConfig.supabase.url!;
const supabaseAnonKey = authConfig.supabase.anonKey!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Customize email templates and branding
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

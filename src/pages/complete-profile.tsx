import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { Button } from "../components/ui/button";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export default function CompleteProfile() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [formData, setFormData] = useState({
    phone: "",
    company_name: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        phone: data.phone || "",
        company_name: "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Error loading profile");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🚀 Starting profile completion...");
      console.log("📋 Form data:", formData);

      // Validate form data
      if (!formData.phone.trim()) {
        throw new Error("Phone number is required");
      }

      if (!formData.company_name.trim()) {
        throw new Error("Company name is required");
      }



      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      console.log("👤 User found:", user.id);

      console.log("📝 Updating profile...");

      // Create company first
      console.log("🏢 Creating company:", formData.company_name);
      const { data: newCompany, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: formData.company_name.trim(),
        })
        .select()
        .single();

      if (companyError) {
        console.error("❌ Company creation error:", companyError);
        throw companyError;
      }

      console.log("✅ Company created:", newCompany);

      // Update profile with company_id
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          phone: formData.phone.trim(),
          company_id: newCompany.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("❌ Profile update error:", profileError);
        throw profileError;
      }

      console.log("✅ Profile updated successfully!");
      toast.success("Profile completed successfully!");
      navigate("/payment");
    } catch (error) {
      console.error("💥 Error completing profile:", error);
      toast.error(
        `Error completing profile: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-[#d67635]">G</span>nymble
            </h1>
            <p className="text-gray-400 text-sm">Complete Your Profile</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
            <p className="text-gray-400">
              Please provide the required information to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>

            {/* Company Name */}
            <div>
              <label
                htmlFor="company_name"
                className="block text-sm font-medium mb-2"
              >
                Company Name *
              </label>
              <input
                type="text"
                id="company_name"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your company name"
                required
              />
            </div>



            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-glow text-primary-foreground font-semibold disabled:opacity-50 transition-colors"
            >
              {loading
                ? "Completing Profile..."
                : "Complete Profile & Continue"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

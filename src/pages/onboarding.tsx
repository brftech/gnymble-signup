import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import type { OnboardingData, UserProfile } from "../types/database";

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState<
    "brand" | "campaign" | "complete"
  >("brand");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<OnboardingData>({
    legal_company_name: "",
    dba_brand_name: "",
    country_of_registration: "",
    tax_number_ein: "",
    tax_issuing_country: "",
    address_street: "",
    city: "",
    state_region: "",
    postal_code: "",
    country: "",
    website: "",
    vertical_type: "CIGAR_RETAIL", // Pre-filled
    legal_form: "PRIVATE_PROFIT", // Pre-filled
    business_phone: "",
    point_of_contact_email: "",
    stock_symbol: "",
    stock_exchange: "",
    reference_id: "",
    duns_giin_lei: "",
    first_name: "",
    last_name: "",
    mobile_phone: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
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

      // Pre-fill form with existing data
      if (data) {
        setFormData((prev) => ({
          ...prev,
          legal_company_name: data.company_name || "",
          first_name: data.full_name?.split(" ")[0] || "",
          last_name: data.full_name?.split(" ").slice(1).join(" ") || "",
          mobile_phone: data.phone || "",
          business_phone: data.phone || "", // Pre-fill with user's phone
          point_of_contact_email: data.email || "", // Pre-fill with user's email
        }));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Error loading profile");
    }
  };

  const handleBrandVerification = async () => {
    setLoading(true);
    try {
      // Validate required brand fields
      const requiredFields = [
        "legal_company_name",
        "country_of_registration",
        "tax_number_ein",
        "address_street",
        "city",
        "state_region",
        "postal_code",
        "country",
        "website",
        "legal_form",
        "vertical_type",
        "business_phone",
        "point_of_contact_email",
      ];

      for (const field of requiredFields) {
        if (!formData[field as keyof OnboardingData]?.trim()) {
          throw new Error(`${field.replace(/_/g, " ")} is required`);
        }
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Get user's company
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (!profile?.company_id) {
        throw new Error("No company found for user");
      }

      // Update company with onboarding data
      const { error: companyError } = await supabase
        .from("companies")
        .update({
          legal_company_name: formData.legal_company_name,
          dba_brand_name: formData.dba_brand_name,
          country_of_registration: formData.country_of_registration,
          tax_number_ein: formData.tax_number_ein,
          tax_issuing_country: formData.tax_issuing_country,
          address_street: formData.address_street,
          city: formData.city,
          state_region: formData.state_region,
          postal_code: formData.postal_code,
          country: formData.country,
          website: formData.website,
          vertical_type: formData.vertical_type,
          legal_form: formData.legal_form,
          business_phone: formData.business_phone,
          point_of_contact_email: formData.point_of_contact_email,
          brand_verification_status: "submitted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.company_id);

      if (companyError) {
        console.error("Company update error:", companyError);
        throw companyError;
      }

      // Create onboarding submission record
      const { error: submissionError } = await supabase
        .from("onboarding_submissions")
        .insert({
          user_id: user.id,
          company_id: profile.company_id,
          submission_data: formData,
          status: "submitted",
        });

      if (submissionError) {
        console.error("Submission error:", submissionError);
        throw submissionError;
      }

      console.log("Brand verification submitted successfully:", formData);
      toast.success("Brand verification submitted successfully!");
      setCurrentStep("campaign");
    } catch (error) {
      console.error("Brand verification error:", error);
      toast.error(
        error instanceof Error ? error.message : "Brand verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignApproval = async () => {
    setLoading(true);
    try {
      // Get current user and company
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (!profile?.company_id) {
        throw new Error("No company found for user");
      }

      // Create a brand record for the company
      const { data: brand, error: brandError } = await supabase
        .from("brands")
        .insert({
          company_id: profile.company_id,
          brand_name: formData.legal_company_name,
          dba_name: formData.dba_brand_name,
          vertical_type: formData.vertical_type,
          brand_verification_status: "approved",
          brand_verification_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (brandError) {
        console.error("Brand creation error:", brandError);
        throw brandError;
      }

      // Create a default campaign for the brand
      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          brand_id: brand.id,
          campaign_name: `${formData.legal_company_name} - Default Campaign`,
          description: "Default campaign created during onboarding",
          use_case: "General business communications",
          campaign_approval_status: "approved",
          campaign_approval_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (campaignError) {
        console.error("Campaign creation error:", campaignError);
        throw campaignError;
      }

      // Update company verification status
      const { error: companyUpdateError } = await supabase
        .from("companies")
        .update({
          brand_verification_status: "approved",
          brand_verification_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.company_id);

      if (companyUpdateError) {
        console.error("Company update error:", companyUpdateError);
        throw companyUpdateError;
      }

      // Update onboarding submission status
      const { error: submissionUpdateError } = await supabase
        .from("onboarding_submissions")
        .update({
          status: "approved",
          processed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (submissionUpdateError) {
        console.error("Submission update error:", submissionUpdateError);
        throw submissionUpdateError;
      }

      console.log("Onboarding completed successfully:", { brand, campaign });
      toast.success("Onboarding completed successfully!");
      setCurrentStep("complete");
    } catch (error) {
      console.error("Onboarding completion error:", error);
      toast.error("Onboarding completion failed");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    toast.success("Onboarding completed! Welcome to Gnymble!");
    navigate("/dashboard");
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
              <span className="text-[#d67635]">G</span>nymble Onboarding
            </h1>
            <p className="text-gray-400 text-sm">
              {currentStep === "brand" && "Step 1: Brand Verification"}
              {currentStep === "campaign" && "Step 2: Campaign Approval"}
              {currentStep === "complete" && "Step 3: Complete"}
            </p>
          </div>
          <div className="flex space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                currentStep === "brand" ? "bg-primary" : "bg-gray-600"
              }`}
            ></div>
            <div
              className={`w-3 h-3 rounded-full ${
                currentStep === "campaign" ? "bg-primary" : "bg-gray-600"
              }`}
            ></div>
            <div
              className={`w-3 h-3 rounded-full ${
                currentStep === "complete" ? "bg-primary" : "bg-gray-600"
              }`}
            ></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentStep === "brand" && (
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            <h2 className="text-2xl font-bold mb-6">Brand Verification</h2>
            <p className="text-gray-400 mb-8">
              Please provide your company information for brand verification.
              This is required for SMS compliance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Legal Company Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Legal Company Name *
                </label>
                <input
                  type="text"
                  value={formData.legal_company_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      legal_company_name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter legal company name"
                />
              </div>

              {/* DBA/Brand Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  DBA or Brand Name
                </label>
                <input
                  type="text"
                  value={formData.dba_brand_name}
                  onChange={(e) =>
                    setFormData({ ...formData, dba_brand_name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="If different from legal name"
                />
              </div>

              {/* Country of Registration */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Country of Registration *
                </label>
                <select
                  value={formData.country_of_registration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      country_of_registration: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="MX">Mexico</option>
                </select>
              </div>

              {/* Tax Number/EIN */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tax Number/ID/EIN *
                </label>
                <input
                  type="text"
                  value={formData.tax_number_ein}
                  onChange={(e) =>
                    setFormData({ ...formData, tax_number_ein: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter tax ID or EIN"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Address/Street *
                </label>
                <input
                  type="text"
                  value={formData.address_street}
                  onChange={(e) =>
                    setFormData({ ...formData, address_street: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter street address"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter city"
                />
              </div>

              {/* State/Region */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  State/Region *
                </label>
                <input
                  type="text"
                  value={formData.state_region}
                  onChange={(e) =>
                    setFormData({ ...formData, state_region: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter state or region"
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Postal Code/ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) =>
                    setFormData({ ...formData, postal_code: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter postal code"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Country *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="MX">Mexico</option>
                </select>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Website *
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              {/* Business Phone */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Business Phone *
                </label>
                <input
                  type="tel"
                  value={formData.business_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, business_phone: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Point of Contact Email */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Point of Contact Email *
                </label>
                <input
                  type="email"
                  value={formData.point_of_contact_email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      point_of_contact_email: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="contact@company.com"
                />
              </div>

              {/* Legal Form of Organization */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Legal Form of Organization *
                </label>
                <select
                  value={formData.legal_form}
                  onChange={(e) =>
                    setFormData({ ...formData, legal_form: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="PRIVATE_PROFIT">Private Profit</option>
                  <option value="PUBLIC_PROFIT">Public Profit</option>
                  <option value="NON_PROFIT">Non-Profit</option>
                  <option value="GOVERNMENT">Government</option>
                </select>
              </div>

              {/* Vertical Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Vertical Type *
                </label>
                <select
                  value={formData.vertical_type}
                  onChange={(e) =>
                    setFormData({ ...formData, vertical_type: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="CIGAR_RETAIL">Cigar Retail</option>
                  <option value="SPEAKEASY">Speakeasy</option>
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="BAR">Bar</option>
                  <option value="LOUNGE">Lounge</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-8">
              <Button
                onClick={handleBrandVerification}
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary-glow text-primary-foreground font-semibold disabled:opacity-50 transition-colors"
              >
                {loading ? "Verifying Brand..." : "Submit Brand Verification"}
              </Button>
            </div>
          </div>
        )}

        {currentStep === "campaign" && (
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold mb-4">Campaign Approval</h2>
            <p className="text-gray-400 mb-8">
              Your brand verification is complete! Campaign approval will be
              processed automatically based on your company information.
            </p>

            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-400 mb-4">
                Brand Information Submitted
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <span className="text-gray-400">Company:</span>
                  <span className="ml-2">{formData.legal_company_name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Legal Form:</span>
                  <span className="ml-2">
                    {formData.legal_form.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Vertical:</span>
                  <span className="ml-2">
                    {formData.vertical_type.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Country:</span>
                  <span className="ml-2">{formData.country}</span>
                </div>
                <div>
                  <span className="text-gray-400">Website:</span>
                  <span className="ml-2">{formData.website}</span>
                </div>
                <div>
                  <span className="text-gray-400">Business Phone:</span>
                  <span className="ml-2">{formData.business_phone}</span>
                </div>
                <div>
                  <span className="text-gray-400">Contact Email:</span>
                  <span className="ml-2">
                    {formData.point_of_contact_email}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={() => setCurrentStep("brand")}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors"
              >
                Back
              </Button>
              <Button
                onClick={handleCampaignApproval}
                disabled={loading}
                className="flex-1 py-3 bg-primary hover:bg-primary-glow text-primary-foreground font-semibold disabled:opacity-50 transition-colors"
              >
                {loading ? "Processing..." : "Complete Onboarding"}
              </Button>
            </div>
          </div>
        )}

        {currentStep === "complete" && (
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold mb-4">Onboarding Complete!</h2>
            <p className="text-gray-400 mb-8">
              Your brand has been verified and campaign approved. You're now
              ready to use Gnymble's SMS platform!
            </p>

            <Button
              onClick={handleComplete}
              className="px-8 py-3 bg-primary hover:bg-primary-glow text-primary-foreground font-semibold transition-colors"
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

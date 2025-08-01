import { supabase } from "./supabaseClient";

export interface Company {
  id: string;
  name: string;
  industry?: string;
  size?: string;
  website?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCompanyRole {
  id: string;
  user_id: string;
  company_id: string;
  role: "owner" | "admin" | "member" | "viewer";
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCompany {
  company_id: string;
  company_name: string;
  role: "owner" | "admin" | "member" | "viewer";
  is_primary: boolean;
}

/**
 * Get all companies for the current user
 */
export async function getUserCompanies(): Promise<UserCompany[]> {
  const { data, error } = await supabase.rpc("get_user_companies", {
    _user_id: (await supabase.auth.getUser()).data.user?.id,
  });

  if (error) {
    console.error("Error fetching user companies:", error);
    return [];
  }

  return data || [];
}

/**
 * Get the user's primary company
 */
export async function getPrimaryCompany(): Promise<UserCompany | null> {
  const companies = await getUserCompanies();
  return companies.find((company) => company.is_primary) || null;
}

/**
 * Add a user to a company
 */
export async function addUserToCompany(
  userId: string,
  companyId: string,
  role: "owner" | "admin" | "member" | "viewer" = "member",
  isPrimary: boolean = false
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("user_company_roles").insert({
    user_id: userId,
    company_id: companyId,
    role,
    is_primary: isPrimary,
  });

  if (error) {
    console.error("Error adding user to company:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Create a new company and add the current user as owner
 */
export async function createCompany(
  name: string,
  industry?: string,
  size?: string,
  website?: string,
  phone?: string,
  address?: string
): Promise<{ success: boolean; companyId?: string; error?: string }> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  // Create the company
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      name,
      industry,
      size,
      website,
      phone,
      address,
    })
    .select()
    .single();

  if (companyError) {
    console.error("Error creating company:", companyError);
    return { success: false, error: companyError.message };
  }

  // Add user as owner
  const { error: roleError } = await supabase
    .from("user_company_roles")
    .insert({
      user_id: user.id,
      company_id: company.id,
      role: "owner",
      is_primary: true,
    });

  if (roleError) {
    console.error("Error adding user as company owner:", roleError);
    return { success: false, error: roleError.message };
  }

  return { success: true, companyId: company.id };
}

/**
 * Set a company as the user's primary company
 */
export async function setPrimaryCompany(
  companyId: string
): Promise<{ success: boolean; error?: string }> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  // First, unset all primary companies for this user
  const { error: unsetError } = await supabase
    .from("user_company_roles")
    .update({ is_primary: false })
    .eq("user_id", user.id);

  if (unsetError) {
    console.error("Error unsetting primary companies:", unsetError);
    return { success: false, error: unsetError.message };
  }

  // Then set the specified company as primary
  const { error: setError } = await supabase
    .from("user_company_roles")
    .update({ is_primary: true })
    .eq("user_id", user.id)
    .eq("company_id", companyId);

  if (setError) {
    console.error("Error setting primary company:", setError);
    return { success: false, error: setError.message };
  }

  return { success: true };
}

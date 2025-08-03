-- Fix RLS policies to allow proper access to user data
-- This migration addresses the infinite recursion and access issues

-- 1. Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their companies" ON public.companies;
DROP POLICY IF EXISTS "Company owners can update their companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view their company roles" ON public.user_company_roles;
DROP POLICY IF EXISTS "Company owners can manage company members" ON public.user_company_roles;

-- 2. Create simpler, more permissive policies for profiles
CREATE POLICY "Enable read access for authenticated users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on id" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Create simpler policies for user_roles
CREATE POLICY "Enable read access for authenticated users" ON public.user_roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.user_roles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON public.user_roles
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Create simpler policies for companies
CREATE POLICY "Enable read access for authenticated users" ON public.companies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.companies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.companies
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. Create simpler policies for user_company_roles (avoiding recursion)
CREATE POLICY "Enable read access for authenticated users" ON public.user_company_roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.user_company_roles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON public.user_company_roles
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Add policies for other tables that might be needed
-- Customers table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.customers;
CREATE POLICY "Enable read access for authenticated users" ON public.customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.customers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.customers
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Subscriptions table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.subscriptions;
CREATE POLICY "Enable read access for authenticated users" ON public.subscriptions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.subscriptions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Customer access table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.customer_access;
CREATE POLICY "Enable read access for authenticated users" ON public.customer_access
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.customer_access
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.customer_access
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 7. Ensure RLS is enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_company_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_access ENABLE ROW LEVEL SECURITY; 
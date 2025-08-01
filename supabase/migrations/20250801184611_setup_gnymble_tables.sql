-- Setup Gnymble Signup Database Tables
-- This migration creates the necessary tables for user management and company data

-- 1. Create profiles table for authenticated users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create user roles system
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'customer', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create companies table (separate from customers for now, can be merged later)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  website TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 4. Create user_company_roles junction table for many-to-many relationship
DO $$ BEGIN
    CREATE TYPE public.company_role AS ENUM ('owner', 'admin', 'member', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.user_company_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  role company_role NOT NULL DEFAULT 'member',
  is_primary boolean DEFAULT false, -- Indicates if this is the user's primary company
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, company_id)
);

-- Enable RLS on user_company_roles
ALTER TABLE public.user_company_roles ENABLE ROW LEVEL SECURITY;

-- 5. Create security definer functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1
$$;

-- Function to get user's companies
CREATE OR REPLACE FUNCTION public.get_user_companies(_user_id UUID)
RETURNS TABLE (
  company_id UUID,
  company_name TEXT,
  role company_role,
  is_primary boolean
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    c.id as company_id,
    c.name as company_name,
    ucr.role,
    ucr.is_primary
  FROM public.user_company_roles ucr
  JOIN public.companies c ON c.id = ucr.company_id
  WHERE ucr.user_id = _user_id
  ORDER BY ucr.is_primary DESC, c.name ASC
$$;

-- 6. Create trigger function for auto-creating profiles and initial company
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_company_id UUID;
  company_name TEXT;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'phone'
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create company if company_name is provided
  company_name := NEW.raw_user_meta_data ->> 'company_name';
  IF company_name IS NOT NULL THEN
    -- Check if company already exists
    SELECT id INTO new_company_id
    FROM public.companies
    WHERE name = company_name
    LIMIT 1;
    
    -- Create company if it doesn't exist
    IF new_company_id IS NULL THEN
      INSERT INTO public.companies (name)
      VALUES (company_name)
      RETURNING id INTO new_company_id;
    END IF;
    
    -- Link user to company as owner
    INSERT INTO public.user_company_roles (user_id, company_id, role, is_primary)
    VALUES (NEW.id, new_company_id, 'owner', true);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Set up Row Level Security policies

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their companies" ON public.companies;
DROP POLICY IF EXISTS "Company owners can update their companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view their company roles" ON public.user_company_roles;
DROP POLICY IF EXISTS "Company owners can manage company members" ON public.user_company_roles;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Companies policies - users can view companies they're members of
CREATE POLICY "Users can view their companies" ON public.companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_company_roles 
      WHERE user_id = auth.uid() AND company_id = companies.id
    )
  );

CREATE POLICY "Company owners can update their companies" ON public.companies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_company_roles 
      WHERE user_id = auth.uid() AND company_id = companies.id AND role = 'owner'
    )
  );

-- User company roles policies
CREATE POLICY "Users can view their company roles" ON public.user_company_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Company owners can manage company members" ON public.user_company_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_company_roles ucr2
      WHERE ucr2.user_id = auth.uid() 
        AND ucr2.company_id = user_company_roles.company_id 
        AND ucr2.role IN ('owner', 'admin')
    )
  );

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(name);
CREATE INDEX IF NOT EXISTS idx_user_company_roles_user_id ON public.user_company_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_company_roles_company_id ON public.user_company_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_company_roles_primary ON public.user_company_roles(user_id, is_primary) WHERE is_primary = true;
`
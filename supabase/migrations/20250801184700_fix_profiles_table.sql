-- Fix profiles table to have correct structure and relationships
-- This migration updates the profiles table to match our requirements

-- First, drop the wrong foreign key relationship
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_customer_id_fkey;

-- Remove the wrong customer_id column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS customer_id;

-- Add the correct fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- Update the trigger function to handle the correct structure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_company_id UUID;
  company_name TEXT;
  full_name TEXT;
  first_name TEXT;
  last_name TEXT;
BEGIN
  -- Extract first and last name from full_name
  full_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name');
  
  -- Simple name splitting (assumes "FirstName LastName" format)
  IF full_name IS NOT NULL THEN
    first_name := SPLIT_PART(full_name, ' ', 1);
    last_name := CASE 
      WHEN POSITION(' ' IN full_name) > 0 
      THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
      ELSE NULL
    END;
  END IF;
  
  -- Create company first if company_name is provided
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
  END IF;
  
  -- Create profile with correct structure
  INSERT INTO public.profiles (id, email, first_name, last_name, full_name, phone, company_id)
  VALUES (
    NEW.id, 
    NEW.email,
    first_name,
    last_name,
    full_name,
    NEW.raw_user_meta_data ->> 'phone',
    new_company_id
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Link user to company if company was created
  IF new_company_id IS NOT NULL THEN
    INSERT INTO public.user_company_roles (user_id, company_id, role, is_primary)
    VALUES (NEW.id, new_company_id, 'owner', true);
  END IF;
  
  RETURN NEW;
END;
$$; 
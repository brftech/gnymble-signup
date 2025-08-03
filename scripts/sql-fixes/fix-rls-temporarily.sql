-- Temporary fix for RLS issues
-- Run this in the Supabase SQL Editor to fix the dashboard issue

-- 1. Temporarily disable RLS on key tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_company_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_access DISABLE ROW LEVEL SECURITY;

-- 2. Check what data exists
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM public.profiles
UNION ALL
SELECT 'user_roles' as table_name, COUNT(*) as record_count FROM public.user_roles
UNION ALL
SELECT 'companies' as table_name, COUNT(*) as record_count FROM public.companies
UNION ALL
SELECT 'user_company_roles' as table_name, COUNT(*) as record_count FROM public.user_company_roles
UNION ALL
SELECT 'customers' as table_name, COUNT(*) as record_count FROM public.customers
UNION ALL
SELECT 'subscriptions' as table_name, COUNT(*) as record_count FROM public.subscriptions
UNION ALL
SELECT 'customer_access' as table_name, COUNT(*) as record_count FROM public.customer_access;

-- 3. Show the actual profile data
SELECT * FROM public.profiles;

-- 4. Show user roles
SELECT * FROM public.user_roles;

-- 5. Show companies
SELECT * FROM public.companies;

-- 6. Show user company roles
SELECT * FROM public.user_company_roles; 
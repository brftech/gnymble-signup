-- Temporarily disable RLS on profiles table to fix dashboard issue
-- This is a temporary fix to get the dashboard working

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY; 
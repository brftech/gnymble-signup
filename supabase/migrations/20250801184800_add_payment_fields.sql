-- Add payment-related fields to profiles table
-- This migration adds fields needed for payment tracking and Stripe integration

-- Add payment status and Stripe fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;

-- Add indexes for payment-related queries
CREATE INDEX IF NOT EXISTS idx_profiles_payment_status ON public.profiles(payment_status);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_session_id ON public.profiles(stripe_session_id);

-- Add constraint to ensure valid payment status values
ALTER TABLE public.profiles 
ADD CONSTRAINT check_payment_status 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled'));

-- Update existing profiles to have 'pending' status
UPDATE public.profiles 
SET payment_status = 'pending' 
WHERE payment_status IS NULL; 
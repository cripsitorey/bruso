-- Fix for Infinite Recursion in RLS Policies

-- 1. Create a helper function to get the current user's role safely
-- SECURITY DEFINER ensures this function runs with the privileges of the creator (postgres), bypassing RLS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS app_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Create a helper to get the user's urbanization_id safely
CREATE OR REPLACE FUNCTION public.get_my_urbanizacion_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT urbanizacion_id FROM public.profiles WHERE id = auth.uid();
$$;

-- 3. Drop the problematic recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;

-- 4. Re-create policies using the safe functions

-- Profiles: Admins can view all profiles in their urbanization
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR ALL USING (
        get_my_role() = 'admin' AND urbanizacion_id = get_my_urbanizacion_id()
    );

-- Payments: Admins can view and update all payments
CREATE POLICY "Admins can manage payments" ON public.payments
    FOR ALL USING (
        get_my_role() = 'admin'
    );

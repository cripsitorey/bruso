-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ROLES are handled by Supabase Auth (authenticated, anon, etc.)
-- We will use a profile table to link users to specific roles within our app

-- Create ENUM for roles
CREATE TYPE app_role AS ENUM ('admin', 'resident', 'guard');

-- Create Tables
CREATE TABLE public.urbanizaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    urbanizacion_id UUID REFERENCES public.urbanizaciones(id),
    role app_role DEFAULT 'resident',
    full_name TEXT,
    house_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.access_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) NOT NULL,
    token_code UUID DEFAULT uuid_generate_v4(),
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, paid, rejected
    evidence_url TEXT,
    description TEXT,
    month_year TEXT, -- e.g., '2023-10'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) NOT NULL,
    urbanizacion_id UUID REFERENCES public.urbanizaciones(id) NOT NULL,
    area_name TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.urbanizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Admins can view all profiles in their urbanizacion
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin' AND urbanizacion_id = public.profiles.urbanizacion_id
        )
    );

-- Policies for Access Tokens
-- Residents can create tokens
CREATE POLICY "Residents can create tokens" ON public.access_tokens
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'resident'
        ) AND profile_id = auth.uid()
    );

-- Residents can view their own tokens
CREATE POLICY "Residents can view own tokens" ON public.access_tokens
    FOR SELECT USING (profile_id = auth.uid());

-- Guards can view (scan) all tokens to verify
CREATE POLICY "Guards can view all tokens" ON public.access_tokens
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'guard'
        )
    );
    
-- Guards can update tokens (mark as used)
CREATE POLICY "Guards can update tokens" ON public.access_tokens
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'guard'
        )
    );

-- Policies for Payments
-- Residents can view and create their own payments
CREATE POLICY "Residents can view own payments" ON public.payments
    FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Residents can create payments" ON public.payments
    FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Admins can view and update all payments
CREATE POLICY "Admins can manage payments" ON public.payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policies for Bookings
-- Everyone can view bookings (to see availability)
CREATE POLICY "Everyone can view bookings" ON public.bookings
    FOR SELECT USING (true);

-- Residents can create bookings
CREATE POLICY "Residents can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (profile_id = auth.uid());

-- ==============================================================================
-- KOSTRACK: SISTEM MONITORING PEMBAYARAN UANG KOS BERBASIS WEB
-- Supabase PostgreSQL Initial Migration & Security Schema
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLES DEFINITION

-- A. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- B. BOARDING SETTINGS TABLE (Pengaturan Kos)
CREATE TABLE IF NOT EXISTS public.boarding_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boarding_name TEXT NOT NULL DEFAULT 'KosTrack Residence',
    boarding_address TEXT DEFAULT 'Jl. Pemuda No. 123, Kota',
    due_day INTEGER NOT NULL DEFAULT 10 CHECK (due_day >= 1 AND due_day <= 31),
    public_name_masking BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- C. ROOMS TABLE (Manajemen Kamar)
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number TEXT UNIQUE NOT NULL,
    monthly_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (monthly_price >= 0),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- D. TENANTS TABLE (Manajemen Penghuni)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    public_name TEXT NOT NULL,
    phone TEXT,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    move_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
    move_out_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- E. PAYMENTS TABLE (Manajemen Pembayaran)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    period_month INTEGER NOT NULL CHECK (period_month >= 1 AND period_month <= 12),
    period_year INTEGER NOT NULL CHECK (period_year >= 2000 AND period_year <= 2100),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    payment_date DATE,
    payment_method TEXT CHECK (payment_method IN ('Cash', 'Transfer', 'E-Wallet') OR payment_method IS NULL),
    status TEXT NOT NULL DEFAULT 'BELUM BAYAR' CHECK (status IN ('LUNAS', 'BELUM BAYAR', 'TERLAMBAT')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_tenant_period UNIQUE (tenant_id, period_month, period_year)
);

-- 3. INDEXES FOR HIGH PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_rooms_room_number ON public.rooms(room_number);
CREATE INDEX IF NOT EXISTS idx_tenants_room_id ON public.tenants(room_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON public.payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_period ON public.payments(period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- 4. AUTO-UPDATED_AT TRIGGERS
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_updated_at_settings ON public.boarding_settings;
CREATE TRIGGER trigger_set_updated_at_settings
    BEFORE UPDATE ON public.boarding_settings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_updated_at_rooms ON public.rooms;
CREATE TRIGGER trigger_set_updated_at_rooms
    BEFORE UPDATE ON public.rooms
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_updated_at_tenants ON public.tenants;
CREATE TRIGGER trigger_set_updated_at_tenants
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_updated_at_payments ON public.payments;
CREATE TRIGGER trigger_set_updated_at_payments
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. AUTOMATIC PROFILE CREATION ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin Kos'),
        'admin'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. SEED DEFAULT BOARDING SETTINGS
INSERT INTO public.boarding_settings (id, boarding_name, boarding_address, due_day, public_name_masking)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'KosTrack Residence',
    'Jl. Cempaka Putih No. 45, Jakarta Pusat',
    10,
    true
)
ON CONFLICT (id) DO NOTHING;

-- 7. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boarding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Helper function to verify admin access
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Admins can view profiles" ON public.profiles;
CREATE POLICY "Admins can view profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update their own profile" ON public.profiles;
CREATE POLICY "Admins can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- BOARDING SETTINGS POLICIES
DROP POLICY IF EXISTS "Public can view boarding settings" ON public.boarding_settings;
CREATE POLICY "Public can view boarding settings"
    ON public.boarding_settings FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can update boarding settings" ON public.boarding_settings;
CREATE POLICY "Admins can update boarding settings"
    ON public.boarding_settings FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ROOMS POLICIES
DROP POLICY IF EXISTS "Admins have full access to rooms" ON public.rooms;
CREATE POLICY "Admins have full access to rooms"
    ON public.rooms FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- TENANTS POLICIES
DROP POLICY IF EXISTS "Admins have full access to tenants" ON public.tenants;
CREATE POLICY "Admins have full access to tenants"
    ON public.tenants FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- PAYMENTS POLICIES
DROP POLICY IF EXISTS "Admins have full access to payments" ON public.payments;
CREATE POLICY "Admins have full access to payments"
    ON public.payments FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 8. SECURE PUBLIC VIEW (No private data leakage)
-- Exposes ONLY public sanitized fields for the public tenant monitoring page
CREATE OR REPLACE VIEW public.public_payments_overview AS
SELECT
    p.id AS payment_id,
    CASE 
        WHEN s.public_name_masking = true THEN t.public_name
        ELSE t.full_name
    END AS tenant_name,
    COALESCE(r.room_number, 'Kamar -') AS room_number,
    p.period_month,
    p.period_year,
    p.amount,
    p.payment_date,
    p.status,
    s.due_day
FROM public.payments p
JOIN public.tenants t ON p.tenant_id = t.id
LEFT JOIN public.rooms r ON t.room_id = r.id
CROSS JOIN (
    SELECT public_name_masking, due_day FROM public.boarding_settings LIMIT 1
) s;

-- 8. PERMISSIONS AND GRANTS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

GRANT SELECT ON public.boarding_settings TO anon, authenticated;
GRANT SELECT ON public.public_payments_overview TO anon, authenticated;

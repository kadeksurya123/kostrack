-- ==============================================================================
-- KOSTRACK: FIX PUBLIC ACCESS (RLS POLICY FOR ANON ROLE)
-- Jalankan file ini di Supabase SQL Editor
-- ==============================================================================

-- Tambahkan RLS Policy agar anon (pengunjung publik) bisa SELECT
-- data rooms, tenants, dan payments melalui Next.js API route
-- (Bukan akses langsung ke DB — API route yang melakukan filtering privasi)

-- Allow anon to read rooms (hanya room_number dan monthly_price yang akan ditampilkan)
DROP POLICY IF EXISTS "Public can view rooms" ON public.rooms;
CREATE POLICY "Public can view rooms"
    ON public.rooms FOR SELECT
    TO anon
    USING (true);

-- Allow anon to read tenants (full_name dan public_name digunakan untuk masking di API)
DROP POLICY IF EXISTS "Public can view tenants" ON public.tenants;
CREATE POLICY "Public can view tenants"
    ON public.tenants FOR SELECT
    TO anon
    USING (true);

-- Allow anon to read payments (hanya kolom publik yang dikembalikan dari API)
DROP POLICY IF EXISTS "Public can view payments" ON public.payments;
CREATE POLICY "Public can view payments"
    ON public.payments FOR SELECT
    TO anon
    USING (true);

-- Pastikan grant SELECT sudah ada
GRANT SELECT ON public.rooms TO anon;
GRANT SELECT ON public.tenants TO anon;
GRANT SELECT ON public.payments TO anon;
GRANT SELECT ON public.boarding_settings TO anon;
GRANT SELECT ON public.public_payments_overview TO anon;

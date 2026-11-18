-- ==============================================================================
-- KOSTRACK: OPTIONAL SAMPLE SEED DATA
-- Jalankan file ini di Supabase SQL Editor jika ingin mengisi data demo awal
-- ==============================================================================

DO $$
DECLARE
    r101_id UUID;
    r102_id UUID;
    r103_id UUID;
    r201_id UUID;
    r202_id UUID;
    t1_id UUID;
    t2_id UUID;
    t3_id UUID;
    t4_id UUID;
    cur_month INT := EXTRACT(MONTH FROM CURRENT_DATE);
    cur_year INT := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
    -- 1. Insert Sample Rooms
    INSERT INTO public.rooms (room_number, monthly_price, description, status)
    VALUES ('101', 1500000, 'Lantai 1 - AC, Kamar Mandi Dalam, Kasur Queen', 'occupied')
    ON CONFLICT (room_number) DO UPDATE SET monthly_price = EXCLUDED.monthly_price
    RETURNING id INTO r101_id;

    INSERT INTO public.rooms (room_number, monthly_price, description, status)
    VALUES ('102', 1500000, 'Lantai 1 - AC, Kamar Mandi Dalam, Meja Kerja', 'occupied')
    ON CONFLICT (room_number) DO UPDATE SET monthly_price = EXCLUDED.monthly_price
    RETURNING id INTO r102_id;

    INSERT INTO public.rooms (room_number, monthly_price, description, status)
    VALUES ('103', 1200000, 'Lantai 1 - Kipas Angin, Kamar Mandi Luar', 'available')
    ON CONFLICT (room_number) DO UPDATE SET monthly_price = EXCLUDED.monthly_price
    RETURNING id INTO r103_id;

    INSERT INTO public.rooms (room_number, monthly_price, description, status)
    VALUES ('201', 1700000, 'Lantai 2 - AC, Kamar Mandi Dalam, Balkon Pribadi', 'occupied')
    ON CONFLICT (room_number) DO UPDATE SET monthly_price = EXCLUDED.monthly_price
    RETURNING id INTO r201_id;

    INSERT INTO public.rooms (room_number, monthly_price, description, status)
    VALUES ('202', 1700000, 'Lantai 2 - AC, Kamar Mandi Dalam, Smart TV', 'occupied')
    ON CONFLICT (room_number) DO UPDATE SET monthly_price = EXCLUDED.monthly_price
    RETURNING id INTO r202_id;

    -- 2. Insert Sample Tenants
    INSERT INTO public.tenants (full_name, public_name, phone, room_id, move_in_date, status)
    VALUES ('Andi Saputra', 'Andi S.', '081234567890', r101_id, '2026-01-01', 'active')
    RETURNING id INTO t1_id;

    INSERT INTO public.tenants (full_name, public_name, phone, room_id, move_in_date, status)
    VALUES ('Budi Prasetyo', 'Budi P.', '081298765432', r102_id, '2026-01-15', 'active')
    RETURNING id INTO t2_id;

    INSERT INTO public.tenants (full_name, public_name, phone, room_id, move_in_date, status)
    VALUES ('Citra Lestari', 'Citra L.', '085712345678', r201_id, '2026-02-01', 'active')
    RETURNING id INTO t3_id;

    INSERT INTO public.tenants (full_name, public_name, phone, room_id, move_in_date, status)
    VALUES ('Dimas Anggara', 'Dimas A.', '087811223344', r202_id, '2026-02-10', 'active')
    RETURNING id INTO t4_id;

    -- 3. Insert Payments for current month
    -- t1: LUNAS via Transfer
    INSERT INTO public.payments (tenant_id, period_month, period_year, amount, payment_date, payment_method, status, notes)
    VALUES (t1_id, cur_month, cur_year, 1500000, CURRENT_DATE - INTERVAL '3 days', 'Transfer', 'LUNAS', 'Transfer BCA an Andi')
    ON CONFLICT (tenant_id, period_month, period_year) DO NOTHING;

    -- t2: LUNAS via Cash
    INSERT INTO public.payments (tenant_id, period_month, period_year, amount, payment_date, payment_method, status, notes)
    VALUES (t2_id, cur_month, cur_year, 1500000, CURRENT_DATE - INTERVAL '1 day', 'Cash', 'LUNAS', 'Bayar tunai di pos')
    ON CONFLICT (tenant_id, period_month, period_year) DO NOTHING;

    -- t3: BELUM BAYAR (belum bayar)
    INSERT INTO public.payments (tenant_id, period_month, period_year, amount, payment_date, payment_method, status, notes)
    VALUES (t3_id, cur_month, cur_year, 1700000, NULL, NULL, 'BELUM BAYAR', 'Menunggu konfirmasi gaji tgl 10')
    ON CONFLICT (tenant_id, period_month, period_year) DO NOTHING;

    -- t4: TERLAMBAT (lewat tempo)
    INSERT INTO public.payments (tenant_id, period_month, period_year, amount, payment_date, payment_method, status, notes)
    VALUES (t4_id, cur_month, cur_year, 1700000, NULL, NULL, 'TERLAMBAT', 'Sudah diingatkan via WA')
    ON CONFLICT (tenant_id, period_month, period_year) DO NOTHING;

END $$;

-- ==============================================================================
-- KOSTRACK: DATA KAMAR, PENGHUNI, DAN PEMBAYARAN NOVEMBER 2026
-- Jalankan di Supabase SQL Editor
-- ==============================================================================

DO $$
DECLARE
    r01_id UUID;
    r02_id UUID;
    r02b_id UUID;
    r03_id UUID;
    r04_id UUID;
    r05_id UUID;
    t_arul_id UUID;
    t_desi_id UUID;
    t_andika_id UUID;
    t_mas_id UUID;
    t_dita_id UUID;
    t_mail_id UUID;
BEGIN

    -- ========================================================
    -- 1. INSERT KAMAR
    -- ========================================================

    -- Kamar 01
    INSERT INTO public.rooms (room_number, monthly_price, description, status)
    VALUES ('01', 500000, 'Kamar 01', 'occupied')
    ON CONFLICT (room_number) DO UPDATE SET monthly_price = EXCLUDED.monthly_price, status = EXCLUDED.status
    RETURNING id INTO r01_id;

    -- Kamar 02 (ada 2 penghuni: Desi & Andika)
    INSERT INTO public.rooms (room_number, monthly_price, description, status)
    VALUES ('02', 700000, 'Kamar 02', 'occupied')
    ON CONFLICT (room_number) DO UPDATE SET monthly_price = EXCLUDED.monthly_price, status = EXCLUDED.status
    RETURNING id INTO r02_id;
    r02b_id := r02_id;

    -- Kamar 03
    INSERT INTO public.rooms (room_number, monthly_price, description, status)
    VALUES ('03', 700000, 'Kamar 03', 'occupied')
    ON CONFLICT (room_number) DO UPDATE SET monthly_price = EXCLUDED.monthly_price, status = EXCLUDED.status
    RETURNING id INTO r03_id;

    -- Kamar 04
    INSERT INTO public.rooms (room_number, monthly_price, description, status)
    VALUES ('04', 700000, 'Kamar 04', 'occupied')
    ON CONFLICT (room_number) DO UPDATE SET monthly_price = EXCLUDED.monthly_price, status = EXCLUDED.status
    RETURNING id INTO r04_id;

    -- Kamar 05
    INSERT INTO public.rooms (room_number, monthly_price, description, status)
    VALUES ('05', 750000, 'Kamar 05', 'occupied')
    ON CONFLICT (room_number) DO UPDATE SET monthly_price = EXCLUDED.monthly_price, status = EXCLUDED.status
    RETURNING id INTO r05_id;

    -- ========================================================
    -- 2. INSERT PENGHUNI
    -- ========================================================

    INSERT INTO public.tenants (full_name, public_name, room_id, move_in_date, status)
    VALUES ('Arul', 'Arul', r01_id, '2026-01-01', 'active')
    RETURNING id INTO t_arul_id;

    INSERT INTO public.tenants (full_name, public_name, room_id, move_in_date, status)
    VALUES ('Desi', 'Desi', r02_id, '2026-01-01', 'active')
    RETURNING id INTO t_desi_id;

    INSERT INTO public.tenants (full_name, public_name, room_id, move_in_date, status)
    VALUES ('Andika', 'Andika', r02b_id, '2026-01-01', 'active')
    RETURNING id INTO t_andika_id;

    INSERT INTO public.tenants (full_name, public_name, room_id, move_in_date, status)
    VALUES ('Mas', 'Mas', r03_id, '2026-01-01', 'active')
    RETURNING id INTO t_mas_id;

    INSERT INTO public.tenants (full_name, public_name, room_id, move_in_date, status)
    VALUES ('Dita', 'Dita', r04_id, '2026-01-01', 'active')
    RETURNING id INTO t_dita_id;

    INSERT INTO public.tenants (full_name, public_name, room_id, move_in_date, status)
    VALUES ('Mail', 'Mail', r05_id, '2026-01-01', 'active')
    RETURNING id INTO t_mail_id;

    -- ========================================================
    -- 3. INSERT PEMBAYARAN NOVEMBER 2026
    -- ========================================================

    -- Arul - Kamar 01 - Rp 500.000 - BELUM BAYAR
    INSERT INTO public.payments (tenant_id, period_month, period_year, amount, payment_date, payment_method, status, notes)
    VALUES (t_arul_id, 11, 2026, 500000, NULL, NULL, 'BELUM BAYAR', NULL)
    ON CONFLICT (tenant_id, period_month, period_year) DO NOTHING;

    -- Desi - Kamar 02 - Rp 700.000 - BELUM BAYAR
    INSERT INTO public.payments (tenant_id, period_month, period_year, amount, payment_date, payment_method, status, notes)
    VALUES (t_desi_id, 11, 2026, 700000, NULL, NULL, 'BELUM BAYAR', NULL)
    ON CONFLICT (tenant_id, period_month, period_year) DO NOTHING;

    -- Andika - Kamar 02 - Rp 600.000 - LUNAS Cash
    INSERT INTO public.payments (tenant_id, period_month, period_year, amount, payment_date, payment_method, status, notes)
    VALUES (t_andika_id, 11, 2026, 600000, '2026-11-18', 'Cash', 'LUNAS', 'Bayar cash')
    ON CONFLICT (tenant_id, period_month, period_year) DO NOTHING;

    -- Mas - Kamar 03 - Rp 700.000 - BELUM BAYAR
    INSERT INTO public.payments (tenant_id, period_month, period_year, amount, payment_date, payment_method, status, notes)
    VALUES (t_mas_id, 11, 2026, 700000, NULL, NULL, 'BELUM BAYAR', NULL)
    ON CONFLICT (tenant_id, period_month, period_year) DO NOTHING;

    -- Dita - Kamar 04 - Rp 700.000 - LUNAS Transfer
    INSERT INTO public.payments (tenant_id, period_month, period_year, amount, payment_date, payment_method, status, notes)
    VALUES (t_dita_id, 11, 2026, 700000, '2026-11-18', 'Transfer', 'LUNAS', 'Transfer bank')
    ON CONFLICT (tenant_id, period_month, period_year) DO NOTHING;

    -- Mail - Kamar 05 - Rp 750.000 - LUNAS Transfer
    INSERT INTO public.payments (tenant_id, period_month, period_year, amount, payment_date, payment_method, status, notes)
    VALUES (t_mail_id, 11, 2026, 750000, '2026-11-18', 'Transfer', 'LUNAS', 'Transfer bank')
    ON CONFLICT (tenant_id, period_month, period_year) DO NOTHING;

    RAISE NOTICE 'Data kamar, penghuni, dan pembayaran November 2026 berhasil dimasukkan!';
END $$;

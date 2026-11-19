-- ==============================================================================
-- KOSTRACK: FIX TANGGAL BAYAR PADA RECORD YANG BELUM LUNAS / TERLAMBAT
-- Jalankan di Supabase SQL Editor jika ada data yang statusnya belum lunas tapi tersimpan tanggal bayar
-- ==============================================================================

UPDATE public.payments
SET 
    payment_date = NULL,
    payment_method = NULL
WHERE status IN ('BELUM BAYAR', 'TERLAMBAT');

import { z } from 'zod';

export const paymentSchema = z.object({
  tenant_id: z.string().min(1, 'Pilih penghuni'),
  period_month: z.number().min(1, 'Pilih bulan').max(12),
  period_year: z.number().min(2000, 'Tahun minimal 2000').max(2100),
  amount: z.number().min(0, 'Nominal pembayaran minimal 0'),
  payment_date: z.string().optional().nullable(),
  payment_method: z.enum(['Cash', 'Transfer', 'E-Wallet']).optional().nullable(),
  status: z.enum(['LUNAS', 'BELUM BAYAR', 'TERLAMBAT']),
  notes: z.string().optional().nullable(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

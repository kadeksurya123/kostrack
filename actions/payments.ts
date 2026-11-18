'use server';

import { createClient, isSupabaseServerConfigured } from '@/lib/supabase/server';
import { calculatePaymentStatus } from '@/lib/utils/payment';
import { PaymentFormValues, paymentSchema } from '@/lib/validations/payment';
import { Payment } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function getPayments({
  month,
  year,
  status,
  search,
}: {
  month?: number;
  year?: number;
  status?: string;
  search?: string;
} = {}): Promise<{ data: Payment[]; error?: string }> {
  if (!isSupabaseServerConfigured()) {
    return {
      data: [
        {
          id: 'pay-1',
          tenant_id: 'tenant-1',
          period_month: 2,
          period_year: 2026,
          amount: 1500000,
          payment_date: '2026-02-05',
          payment_method: 'Transfer',
          status: 'LUNAS',
          notes: 'Transfer via BCA',
          created_at: '2026-02-05T00:00:00.000Z',
          updated_at: '2026-02-05T00:00:00.000Z',
          tenants: {
            id: 'tenant-1',
            full_name: 'Andi Saputra',
            public_name: 'Andi S.',
            phone: '081234567890',
            room_id: 'room-1',
            move_in_date: '2026-01-01',
            move_out_date: null,
            status: 'active',
            created_at: '2026-01-01T00:00:00.000Z',
            updated_at: '2026-01-01T00:00:00.000Z',
            rooms: {
              id: 'room-1',
              room_number: '101',
              monthly_price: 1500000,
              description: null,
              status: 'occupied',
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-01T00:00:00.000Z',
            },
          },
        },
      ],
    };
  }

  const supabase = await createClient();

  let query = supabase
    .from('payments')
    .select(`
      *,
      tenants (
        *,
        rooms (*)
      )
    `)
    .order('period_year', { ascending: false })
    .order('period_month', { ascending: false })
    .order('created_at', { ascending: false });

  if (month) {
    query = query.eq('period_month', month);
  }
  if (year) {
    query = query.eq('period_year', year);
  }
  if (status && status !== 'ALL') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: error.message };
  }

  let list = (data as Payment[]) || [];

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (item) =>
        item.tenants?.full_name?.toLowerCase().includes(q) ||
        item.tenants?.rooms?.room_number?.toLowerCase().includes(q) ||
        item.notes?.toLowerCase().includes(q)
    );
  }

  return { data: list };
}

export async function createPayment(values: PaymentFormValues) {
  const validated = paymentSchema.safeParse(values);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message };
  }

  if (!isSupabaseServerConfigured()) {
    return { success: false, error: 'Koneksi Supabase belum aktif.' };
  }

  const supabase = await createClient();

  // 1. Cek apakah pembayaran untuk tenant & periode ini sudah ada
  const { data: existing } = await supabase
    .from('payments')
    .select('id')
    .eq('tenant_id', validated.data.tenant_id)
    .eq('period_month', validated.data.period_month)
    .eq('period_year', validated.data.period_year)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: 'Pembayaran untuk penghuni pada periode bulan & tahun ini sudah pernah dicatat.',
    };
  }

  // 2. Ambil due_day dari settings
  const { data: settings } = await supabase
    .from('boarding_settings')
    .select('due_day')
    .limit(1)
    .maybeSingle();
  const dueDay = settings?.due_day || 10;

  let computedStatus = validated.data.status;
  let paymentDate = validated.data.payment_date || null;

  if (computedStatus === 'LUNAS' && !paymentDate) {
    paymentDate = new Date().toISOString().split('T')[0];
  } else if (computedStatus !== 'LUNAS') {
    computedStatus = calculatePaymentStatus({
      periodMonth: validated.data.period_month,
      periodYear: validated.data.period_year,
      dueDay,
      manualStatus: computedStatus,
    });
  }

  const { data, error } = await supabase
    .from('payments')
    .insert([
      {
        tenant_id: validated.data.tenant_id,
        period_month: validated.data.period_month,
        period_year: validated.data.period_year,
        amount: validated.data.amount,
        payment_date: paymentDate,
        payment_method: validated.data.payment_method || null,
        status: computedStatus,
        notes: validated.data.notes?.trim() || null,
      },
    ])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/pembayaran');
  revalidatePath('/admin/riwayat');
  revalidatePath('/admin/dashboard');
  revalidatePath('/status-pembayaran');
  return { success: true, data };
}

export async function updatePayment(id: string, values: PaymentFormValues) {
  const validated = paymentSchema.safeParse(values);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message };
  }

  if (!isSupabaseServerConfigured()) {
    return { success: false, error: 'Koneksi Supabase belum aktif.' };
  }

  const supabase = await createClient();

  // Cek duplikasi jika tenant atau period diubah
  const { data: existing } = await supabase
    .from('payments')
    .select('id')
    .eq('tenant_id', validated.data.tenant_id)
    .eq('period_month', validated.data.period_month)
    .eq('period_year', validated.data.period_year)
    .neq('id', id)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: 'Pembayaran untuk penghuni pada periode bulan & tahun ini sudah tercatat.',
    };
  }

  const { data: settings } = await supabase
    .from('boarding_settings')
    .select('due_day')
    .limit(1)
    .maybeSingle();
  const dueDay = settings?.due_day || 10;

  let computedStatus = validated.data.status;
  let paymentDate = validated.data.payment_date || null;

  if (computedStatus === 'LUNAS' && !paymentDate) {
    paymentDate = new Date().toISOString().split('T')[0];
  } else if (computedStatus !== 'LUNAS') {
    computedStatus = calculatePaymentStatus({
      periodMonth: validated.data.period_month,
      periodYear: validated.data.period_year,
      dueDay,
      manualStatus: computedStatus,
    });
  }

  const { data, error } = await supabase
    .from('payments')
    .update({
      tenant_id: validated.data.tenant_id,
      period_month: validated.data.period_month,
      period_year: validated.data.period_year,
      amount: validated.data.amount,
      payment_date: paymentDate,
      payment_method: validated.data.payment_method || null,
      status: computedStatus,
      notes: validated.data.notes?.trim() || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/pembayaran');
  revalidatePath('/admin/riwayat');
  revalidatePath('/admin/dashboard');
  revalidatePath('/status-pembayaran');
  return { success: true, data };
}

export async function markPaymentAsPaid(
  id: string,
  paymentMethod: 'Cash' | 'Transfer' | 'E-Wallet' = 'Transfer',
  paymentDate?: string
) {
  if (!isSupabaseServerConfigured()) {
    return { success: false, error: 'Koneksi Supabase belum aktif.' };
  }

  const supabase = await createClient();
  const dateToSet = paymentDate || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('payments')
    .update({
      status: 'LUNAS',
      payment_date: dateToSet,
      payment_method: paymentMethod,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/pembayaran');
  revalidatePath('/admin/riwayat');
  revalidatePath('/admin/dashboard');
  revalidatePath('/status-pembayaran');
  return { success: true, data };
}

/**
 * Auto-generate tagihan untuk semua penghuni aktif pada bulan & tahun tertentu.
 * Penghuni yang sudah ada record-nya di-skip (ON CONFLICT DO NOTHING).
 */
export async function generateMonthlyPayments(month: number, year: number) {
  if (!isSupabaseServerConfigured()) {
    return { success: false, error: 'Koneksi Supabase belum aktif.' };
  }

  const supabase = await createClient();

  // Ambil semua penghuni aktif beserta harga kamar
  const { data: tenants, error: tenantsError } = await supabase
    .from('tenants')
    .select('id, move_in_date, move_out_date, rooms(monthly_price)')
    .eq('status', 'active');

  if (tenantsError || !tenants) {
    return { success: false, error: tenantsError?.message || 'Gagal ambil data penghuni' };
  }

  // Ambil due_day
  const { data: settings } = await supabase
    .from('boarding_settings')
    .select('due_day')
    .limit(1)
    .maybeSingle();
  const dueDay = settings?.due_day || 10;

  const dueDate = new Date(year, month - 1, dueDay, 23, 59, 59);
  const now = new Date();
  const autoStatus = now > dueDate ? 'TERLAMBAT' : 'BELUM BAYAR';

  // Filter penghuni yang aktif di periode ini
  const { isTenantActiveInPeriod } = await import('@/lib/utils/payment');

  const eligible = tenants.filter((t) =>
    isTenantActiveInPeriod(t.move_in_date, t.move_out_date, month, year)
  );

  if (eligible.length === 0) {
    return { success: true, generated: 0 };
  }

  // Bulk insert, skip yang sudah ada
  const rows = eligible.map((t) => ({
    tenant_id: t.id,
    period_month: month,
    period_year: year,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    amount: Number((t.rooms as any)?.monthly_price || 0),
    payment_date: null,
    payment_method: null,
    status: autoStatus as 'BELUM BAYAR' | 'TERLAMBAT',
  }));

  const { error: insertError } = await supabase
    .from('payments')
    .upsert(rows, { onConflict: 'tenant_id,period_month,period_year', ignoreDuplicates: true });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  revalidatePath('/admin/pembayaran');
  revalidatePath('/admin/riwayat');
  revalidatePath('/admin/dashboard');
  revalidatePath('/status-pembayaran');
  return { success: true, generated: eligible.length };
}

export async function deletePayment(id: string) {
  if (!isSupabaseServerConfigured()) {
    return { success: false, error: 'Koneksi Supabase belum aktif.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('payments').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/pembayaran');
  revalidatePath('/admin/riwayat');
  revalidatePath('/admin/dashboard');
  revalidatePath('/status-pembayaran');
  return { success: true };
}

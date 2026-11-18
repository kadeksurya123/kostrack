'use server';

import { createClient, isSupabaseServerConfigured } from '@/lib/supabase/server';
import { getMonthName } from '@/lib/utils/format';
import { calculatePaymentStatus } from '@/lib/utils/payment';
import { DashboardStats, Payment } from '@/types';

export interface MonthlyIncomeBar {
  month: number;
  year: number;
  name: string;
  total: number;
}

export async function getDashboardData(): Promise<{
  stats: DashboardStats;
  recentPayments: Payment[];
  monthlyIncomes: MonthlyIncomeBar[];
  boardingName: string;
}> {
  const now = new Date();
  const curMonth = now.getMonth() + 1;
  const curYear = now.getFullYear();

  if (!isSupabaseServerConfigured()) {
    return {
      stats: {
        totalActiveTenants: 4,
        totalRooms: 5,
        occupiedRooms: 4,
        vacantRooms: 1,
        totalIncomeThisMonth: 3000000,
        paidCountThisMonth: 2,
        unpaidCountThisMonth: 1,
        lateCountThisMonth: 1,
      },
      recentPayments: [
        {
          id: 'pay-demo-1',
          tenant_id: 't-1',
          period_month: curMonth,
          period_year: curYear,
          amount: 1500000,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: 'Transfer',
          status: 'LUNAS',
          notes: 'Transfer BCA an Andi',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tenants: {
            id: 't-1',
            full_name: 'Andi Saputra',
            public_name: 'Andi S.',
            phone: '081234567890',
            room_id: 'r-1',
            move_in_date: '2026-01-01',
            move_out_date: null,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rooms: {
              id: 'r-1',
              room_number: '101',
              monthly_price: 1500000,
              description: null,
              status: 'occupied',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
        },
      ],
      monthlyIncomes: [
        { month: curMonth - 2 || 10, year: curYear, name: getMonthName(curMonth - 2 || 10), total: 4700000 },
        { month: curMonth - 1 || 11, year: curYear, name: getMonthName(curMonth - 1 || 11), total: 6400000 },
        { month: curMonth, year: curYear, name: getMonthName(curMonth), total: 3000000 },
      ],
      boardingName: 'KosTrack Residence (Demo)',
    };
  }

  const supabase = await createClient();

  // 1. Ambil pengaturan
  const { data: settings } = await supabase
    .from('boarding_settings')
    .select('boarding_name, due_day')
    .limit(1)
    .maybeSingle();

  const dueDay = settings?.due_day || 10;
  const boardingName = settings?.boarding_name || 'KosTrack Residence';

  // 2. Ambil total kamar
  const { data: rooms } = await supabase.from('rooms').select('id, status');
  const totalRooms = rooms?.length || 0;
  const occupiedRooms = rooms?.filter((r) => r.status === 'occupied').length || 0;
  const vacantRooms = totalRooms - occupiedRooms;

  // 3. Ambil penghuni aktif
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, full_name, status, room_id, move_in_date, move_out_date');
  const activeTenants = tenants?.filter((t) => t.status === 'active') || [];
  const totalActiveTenants = activeTenants.length;

  // 4. Ambil pembayaran bulan ini
  const { data: thisMonthPayments } = await supabase
    .from('payments')
    .select(`
      id,
      amount,
      status,
      payment_date,
      payment_method,
      tenant_id
    `)
    .eq('period_month', curMonth)
    .eq('period_year', curYear);

  let totalIncomeThisMonth = 0;
  let paidCountThisMonth = 0;
  let unpaidCountThisMonth = 0;
  let lateCountThisMonth = 0;

  // Map tenant id to payment
  type PaymentRow = {
    id: string;
    amount: number;
    status: string;
    payment_date: string | null;
    payment_method: string | null;
    tenant_id: string;
  };
  const paymentByTenant = new Map<string, PaymentRow>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (thisMonthPayments || []).forEach((p: any) => {
    paymentByTenant.set(p.tenant_id, p as PaymentRow);
    if (p.status === 'LUNAS') {
      totalIncomeThisMonth += Number(p.amount);
      paidCountThisMonth++;
    }
  });

  // Hitung status untuk setiap penghuni aktif
  activeTenants.forEach((t) => {
    const existing = paymentByTenant.get(t.id);
    if (existing) {
      if (existing.status !== 'LUNAS') {
        const dynamicStatus = calculatePaymentStatus({
          periodMonth: curMonth,
          periodYear: curYear,
          dueDay,
          manualStatus: existing.status as any,
        });
        if (dynamicStatus === 'TERLAMBAT') {
          lateCountThisMonth++;
        } else {
          unpaidCountThisMonth++;
        }
      }
    } else {
      // Belum dibuat record pembayarannya
      const dynamicStatus = calculatePaymentStatus({
        periodMonth: curMonth,
        periodYear: curYear,
        dueDay,
      });
      if (dynamicStatus === 'TERLAMBAT') {
        lateCountThisMonth++;
      } else {
        unpaidCountThisMonth++;
      }
    }
  });

  // 5. Pembayaran terbaru (limit 6)
  const { data: recent } = await supabase
    .from('payments')
    .select(`
      *,
      tenants (
        *,
        rooms (*)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(6);

  // 6. Grafik pemasukan 6 bulan terakhir
  const monthlyIncomes: MonthlyIncomeBar[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(curYear, curMonth - 1 - i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();

    const { data: mPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('period_month', m)
      .eq('period_year', y)
      .eq('status', 'LUNAS');

    const total = (mPayments || []).reduce((acc, curr) => acc + Number(curr.amount), 0);
    monthlyIncomes.push({
      month: m,
      year: y,
      name: `${getMonthName(m).substring(0, 3)} ${y}`,
      total,
    });
  }

  return {
    stats: {
      totalActiveTenants,
      totalRooms,
      occupiedRooms,
      vacantRooms,
      totalIncomeThisMonth,
      paidCountThisMonth,
      unpaidCountThisMonth,
      lateCountThisMonth,
    },
    recentPayments: (recent as Payment[]) || [],
    monthlyIncomes,
    boardingName,
  };
}

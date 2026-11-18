import { NextResponse, type NextRequest } from 'next/server';
import { createClient, isSupabaseServerConfigured } from '@/lib/supabase/server';
import { calculatePaymentStatus, isTenantActiveInPeriod } from '@/lib/utils/payment';
import { maskName } from '@/lib/utils/format';
import { PublicApiResponse, PublicPaymentItem } from '@/types';

export const dynamic = 'force-dynamic';

// Mock data fallback saat Supabase belum dikonfigurasi oleh user
const MOCK_BOARDING_SETTINGS = {
  boarding_name: 'Kos Sukses Mandiri (Demo)',
  due_day: 10,
  public_name_masking: true,
};

const MOCK_PUBLIC_DATA: PublicPaymentItem[] = [
  {
    payment_id: 'mock-1',
    tenant_name: 'Andi S.',
    room_number: '101',
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear(),
    amount: 1500000,
    payment_date: new Date().toISOString().split('T')[0],
    status: 'LUNAS',
    due_day: 10,
  },
  {
    payment_id: 'mock-2',
    tenant_name: 'Budi P.',
    room_number: '102',
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear(),
    amount: 1500000,
    payment_date: null,
    status: 'BELUM BAYAR',
    due_day: 10,
  },
  {
    payment_id: 'mock-3',
    tenant_name: 'Citra L.',
    room_number: '201',
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear(),
    amount: 1750000,
    payment_date: null,
    status: 'TERLAMBAT',
    due_day: 10,
  },
  {
    payment_id: 'mock-4',
    tenant_name: 'Dimas A.',
    room_number: '202',
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear(),
    amount: 1750000,
    payment_date: new Date().toISOString().split('T')[0],
    status: 'LUNAS',
    due_day: 10,
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const now = new Date();
    const targetMonth = parseInt(searchParams.get('month') || String(now.getMonth() + 1), 10);
    const targetYear = parseInt(searchParams.get('year') || String(now.getFullYear()), 10);
    const search = (searchParams.get('search') || '').trim().toLowerCase();

    // Validasi range parameter
    if (isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) {
      return NextResponse.json(
        { success: false, error: 'Bulan tidak valid (1-12)' },
        { status: 400 }
      );
    }
    if (isNaN(targetYear) || targetYear < 2000 || targetYear > 2100) {
      return NextResponse.json(
        { success: false, error: 'Tahun tidak valid' },
        { status: 400 }
      );
    }

    if (!isSupabaseServerConfigured()) {
      // Fallback demo data jika env belum diisi
      const filtered = MOCK_PUBLIC_DATA.filter((item) => {
        if (!search) return true;
        return (
          item.tenant_name.toLowerCase().includes(search) ||
          item.room_number.toLowerCase().includes(search)
        );
      });

      const totalPaid = filtered.filter((i) => i.status === 'LUNAS').length;
      const totalUnpaid = filtered.filter((i) => i.status === 'BELUM BAYAR').length;
      const totalLate = filtered.filter((i) => i.status === 'TERLAMBAT').length;

      return NextResponse.json<PublicApiResponse<PublicPaymentItem[]>>({
        success: true,
        data: filtered,
        meta: {
          totalPaid,
          totalUnpaid,
          totalLate,
          totalTenants: filtered.length,
          boardingName: MOCK_BOARDING_SETTINGS.boarding_name,
          dueDay: MOCK_BOARDING_SETTINGS.due_day,
          month: targetMonth,
          year: targetYear,
        },
      });
    }

    const supabase = await createClient();

    // 1. Ambil pengaturan kos
    const { data: settingsData } = await supabase
      .from('boarding_settings')
      .select('boarding_name, due_day, public_name_masking')
      .limit(1)
      .maybeSingle();

    const boardingName = settingsData?.boarding_name || 'KosTrack Residence';
    const dueDay = settingsData?.due_day || 10;
    const isMaskingEnabled = settingsData?.public_name_masking ?? true;

    // 2. Ambil seluruh data pembayaran pada periode tersebut
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        id,
        tenant_id,
        period_month,
        period_year,
        amount,
        payment_date,
        status,
        tenants (
          id,
          full_name,
          public_name,
          status,
          move_in_date,
          move_out_date,
          rooms (
            room_number
          )
        )
      `)
      .eq('period_month', targetMonth)
      .eq('period_year', targetYear);

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return NextResponse.json(
        { success: false, error: 'Gagal memuat data pembayaran' },
        { status: 500 }
      );
    }

    // 3. Ambil juga penghuni yang aktif di periode ini (untuk mendeteksi yang belum dibuat record pembayarannya)
    const { data: tenantsData, error: tenantsError } = await supabase
      .from('tenants')
      .select(`
        id,
        full_name,
        public_name,
        status,
        move_in_date,
        move_out_date,
        rooms (
          room_number,
          monthly_price
        )
      `);

    if (tenantsError) {
      console.error('Error fetching tenants:', tenantsError);
      return NextResponse.json(
        { success: false, error: 'Gagal memuat data penghuni' },
        { status: 500 }
      );
    }

    // Map pembayaran yang sudah ada by tenant_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentMap = new Map<string, any>();
    (paymentsData || []).forEach((p) => {
      paymentMap.set(p.tenant_id, p);
    });

    const results: PublicPaymentItem[] = [];

    // Proses penghuni yang memenuhi syarat periode ini
    for (const tenant of tenantsData || []) {
      const isEligible = isTenantActiveInPeriod(
        tenant.move_in_date,
        tenant.move_out_date,
        targetMonth,
        targetYear
      );

      // Hanya tampilkan penghuni yang berhak di periode ini
      if (!isEligible && !paymentMap.has(tenant.id)) {
        continue;
      }

      const existingPayment = paymentMap.get(tenant.id);
      // Format nama publik sesuai opsi masking
      let displayName = isMaskingEnabled
        ? tenant.public_name || maskName(tenant.full_name)
        : tenant.full_name;

      if (!displayName) {
        displayName = maskName(tenant.full_name);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const room = (tenant.rooms as any) || (existingPayment?.tenants?.rooms as any);
      const roomNumber = room?.room_number || '-';

      if (existingPayment) {
        // Status dihitung dinamis jika belum lunas
        const dynamicStatus = calculatePaymentStatus({
          paymentDate: existingPayment.payment_date,
          periodMonth: targetMonth,
          periodYear: targetYear,
          dueDay,
          manualStatus: existingPayment.status,
        });

        results.push({
          payment_id: existingPayment.id,
          tenant_name: displayName,
          room_number: roomNumber,
          period_month: targetMonth,
          period_year: targetYear,
          amount: 0,
          payment_date: null,
          status: dynamicStatus,
          due_day: dueDay,
        });
      } else if (tenant.status === 'active') {
        // Belum dibuat record pembayaran oleh admin
        const dynamicStatus = calculatePaymentStatus({
          periodMonth: targetMonth,
          periodYear: targetYear,
          dueDay,
        });

        results.push({
          payment_id: `pending-${tenant.id}`,
          tenant_name: displayName,
          room_number: roomNumber,
          period_month: targetMonth,
          period_year: targetYear,
          amount: 0,
          payment_date: null,
          status: dynamicStatus,
          due_day: dueDay,
        });
      }
    }

    // Filter berdasarkan search query jika ada
    const filteredResults = results.filter((item) => {
      if (!search) return true;
      return (
        item.tenant_name.toLowerCase().includes(search) ||
        item.room_number.toLowerCase().includes(search)
      );
    });

    // Urutkan berdasarkan nomor kamar
    filteredResults.sort((a, b) => a.room_number.localeCompare(b.room_number, undefined, { numeric: true }));

    const totalPaid = filteredResults.filter((item) => item.status === 'LUNAS').length;
    const totalUnpaid = filteredResults.filter((item) => item.status === 'BELUM BAYAR').length;
    const totalLate = filteredResults.filter((item) => item.status === 'TERLAMBAT').length;

    return NextResponse.json<PublicApiResponse<PublicPaymentItem[]>>({
      success: true,
      data: filteredResults,
      meta: {
        totalPaid,
        totalUnpaid,
        totalLate,
        totalTenants: filteredResults.length,
        boardingName,
        dueDay,
        month: targetMonth,
        year: targetYear,
      },
    });
  } catch (error) {
    console.error('Unhandled error in public payments API:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}

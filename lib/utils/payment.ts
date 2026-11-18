import { PaymentStatus } from '@/types/database';

/**
 * Menghitung status pembayaran secara dinamis berdasarkan jatuh tempo
 */
export function calculatePaymentStatus({
  isPaid,
  paymentDate,
  periodMonth,
  periodYear,
  dueDay = 10,
  manualStatus,
}: {
  isPaid?: boolean;
  paymentDate?: string | null;
  periodMonth: number;
  periodYear: number;
  dueDay?: number;
  manualStatus?: PaymentStatus;
}): PaymentStatus {
  if (isPaid || manualStatus === 'LUNAS' || (paymentDate && paymentDate.trim() !== '')) {
    return 'LUNAS';
  }

  // Buat batas tanggal jatuh tempo
  const now = new Date();
  // Bulan di JS Date adalah 0-indexed (0 = Januari, 11 = Desember)
  const dueDate = new Date(periodYear, periodMonth - 1, dueDay, 23, 59, 59);

  if (now > dueDate) {
    return 'TERLAMBAT';
  }

  return 'BELUM BAYAR';
}

/**
 * Mengecek apakah penghuni sudah menempati kos pada periode bulan/tahun tertentu
 */
export function isTenantActiveInPeriod(
  moveInDateStr: string,
  moveOutDateStr: string | null | undefined,
  periodMonth: number,
  periodYear: number
): boolean {
  if (!moveInDateStr) return true;

  const moveInDate = new Date(moveInDateStr);
  const moveInYear = moveInDate.getFullYear();
  const moveInMonth = moveInDate.getMonth() + 1;

  // Jika periode sebelum tanggal masuk (berdasarkan bulan dan tahun)
  if (periodYear < moveInYear || (periodYear === moveInYear && periodMonth < moveInMonth)) {
    return false;
  }

  // Jika sudah keluar
  if (moveOutDateStr) {
    const moveOutDate = new Date(moveOutDateStr);
    const moveOutYear = moveOutDate.getFullYear();
    const moveOutMonth = moveOutDate.getMonth() + 1;

    // Jika periode setelah bulan keluar
    if (periodYear > moveOutYear || (periodYear === moveOutYear && periodMonth > moveOutMonth)) {
      return false;
    }
  }

  return true;
}

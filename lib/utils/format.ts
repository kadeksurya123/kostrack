import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function getMonthName(monthNumber: number): string {
  if (monthNumber >= 1 && monthNumber <= 12) {
    return MONTH_NAMES[monthNumber - 1];
  }
  return '';
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return 'Rp 0';
  }
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function formatDate(
  dateInput: string | Date | null | undefined,
  pattern = 'dd MMM yyyy'
): string {
  if (!dateInput) return '-';
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '-';
    return format(date, pattern, { locale: id });
  } catch {
    return '-';
  }
}

/**
 * Mask full name to public format: "Andi Saputra" -> "Andi S."
 */
export function maskName(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0];

  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

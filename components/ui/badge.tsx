import React from 'react';
import { cn } from '@/lib/utils/cn';
import { PaymentStatus, RoomStatus, TenantStatus } from '@/types/database';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'secondary' | 'dark-danger';
  status?: PaymentStatus | RoomStatus | TenantStatus | string;
}

export function Badge({ className, variant, status, children, ...props }: BadgeProps) {
  let computedVariant = variant || 'default';

  if (status) {
    switch (status) {
      case 'LUNAS':
      case 'available':
      case 'active':
        computedVariant = 'success';
        break;
      case 'BELUM BAYAR':
        computedVariant = 'danger';
        break;
      case 'TERLAMBAT':
        computedVariant = 'dark-danger';
        break;
      case 'occupied':
        computedVariant = 'info';
        break;
      case 'maintenance':
        computedVariant = 'warning';
        break;
      case 'inactive':
        computedVariant = 'secondary';
        break;
    }
  }

  const styles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    secondary: 'bg-slate-100 text-slate-600 border-slate-200',
    // LUNAS: Hijau (#10B981)
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
    // BELUM BAYAR: Merah
    danger: 'bg-rose-50 text-rose-700 border-rose-200 font-medium',
    // TERLAMBAT: Merah Tua
    'dark-danger': 'bg-red-950 text-red-100 border-red-900 font-semibold',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border tracking-wide font-medium transition-colors',
        styles[computedVariant],
        className
      )}
      {...props}
    >
      {children || status}
    </span>
  );
}

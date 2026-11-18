import React from 'react';
import { getPayments } from '@/actions/payments';
import { getTenants } from '@/actions/tenants';
import { PaymentsManager } from '@/components/payments/payments-manager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Manajemen Pembayaran - KosTrack',
};

export default async function PembayaranPage() {
  const [{ data: payments }, { data: tenants }] = await Promise.all([
    getPayments(),
    getTenants(),
  ]);

  return <PaymentsManager initialPayments={payments} tenants={tenants} />;
}

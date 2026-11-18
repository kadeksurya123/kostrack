import React from 'react';
import { getPayments } from '@/actions/payments';
import { PaymentHistoryManager } from '@/components/payments/payment-history-manager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Riwayat Pembayaran - KosTrack',
};

export default async function RiwayatPage() {
  const { data: payments } = await getPayments();

  return <PaymentHistoryManager initialPayments={payments} />;
}

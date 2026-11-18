import React from 'react';
import { PublicPaymentView } from '@/components/public/public-payment-view';

export const metadata = {
  title: 'Status Pembayaran - KosTrack',
  description: 'Pantau status pembayaran uang kos bulanan secara transparan dan aman.',
};

export default function StatusPembayaranPage() {
  return <PublicPaymentView />;
}

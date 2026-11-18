import React from 'react';
import { AdminLayoutClient } from '@/components/dashboard/admin-layout-client';
import { getSettings } from '@/actions/settings';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard - KosTrack',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: settings } = await getSettings();
  const boardingName = settings?.boarding_name || 'KosTrack Residence';

  return <AdminLayoutClient boardingName={boardingName}>{children}</AdminLayoutClient>;
}

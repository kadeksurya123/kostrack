import React from 'react';
import { getTenants } from '@/actions/tenants';
import { getRooms } from '@/actions/rooms';
import { TenantsManager } from '@/components/tenants/tenants-manager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Manajemen Penghuni - KosTrack',
};

export default async function PenghuniPage() {
  const [{ data: tenants }, { data: rooms }] = await Promise.all([
    getTenants(),
    getRooms(),
  ]);

  return <TenantsManager initialTenants={tenants} rooms={rooms} />;
}

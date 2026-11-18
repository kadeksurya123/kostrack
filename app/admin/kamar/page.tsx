import React from 'react';
import { getRooms } from '@/actions/rooms';
import { RoomsManager } from '@/components/rooms/rooms-manager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Manajemen Kamar - KosTrack',
};

export default async function KamarPage() {
  const { data: rooms } = await getRooms();

  return <RoomsManager initialRooms={rooms} />;
}

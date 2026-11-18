import React from 'react';
import { getSettings } from '@/actions/settings';
import { SettingsForm } from '@/components/settings/settings-form';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pengaturan Kos - KosTrack',
};

export default async function PengaturanPage() {
  const { data: settings } = await getSettings();

  return <SettingsForm initialSettings={settings} />;
}

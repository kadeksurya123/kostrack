'use server';

import { createClient, isSupabaseServerConfigured } from '@/lib/supabase/server';
import { SettingsFormValues, settingsSchema } from '@/lib/validations/settings';
import { BoardingSettings } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function getSettings(): Promise<{ data: BoardingSettings | null; error?: string }> {
  if (!isSupabaseServerConfigured()) {
    return {
      data: {
        id: '00000000-0000-0000-0000-000000000001',
        boarding_name: 'Kos Sukses Mandiri (Demo)',
        boarding_address: 'Jl. Pemuda No. 123, Jakarta',
        due_day: 10,
        public_name_masking: true,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('boarding_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data as BoardingSettings) || null };
}

export async function updateSettings(values: SettingsFormValues) {
  const validated = settingsSchema.safeParse(values);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message };
  }

  if (!isSupabaseServerConfigured()) {
    return { success: false, error: 'Koneksi Supabase belum aktif.' };
  }

  const supabase = await createClient();

  // Ambil id yang sudah ada
  const { data: existing } = await supabase
    .from('boarding_settings')
    .select('id')
    .limit(1)
    .maybeSingle();

  let query;
  if (existing) {
    query = supabase
      .from('boarding_settings')
      .update({
        boarding_name: validated.data.boarding_name.trim(),
        boarding_address: validated.data.boarding_address?.trim() || null,
        due_day: validated.data.due_day,
        public_name_masking: validated.data.public_name_masking,
      })
      .eq('id', existing.id);
  } else {
    query = supabase.from('boarding_settings').insert([
      {
        boarding_name: validated.data.boarding_name.trim(),
        boarding_address: validated.data.boarding_address?.trim() || null,
        due_day: validated.data.due_day,
        public_name_masking: validated.data.public_name_masking,
      },
    ]);
  }

  const { data, error } = await query.select().single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/pengaturan');
  revalidatePath('/admin/dashboard');
  revalidatePath('/status-pembayaran');
  return { success: true, data };
}

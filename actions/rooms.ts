'use server';

import { createClient, isSupabaseServerConfigured } from '@/lib/supabase/server';
import { RoomFormValues, roomSchema } from '@/lib/validations/room';
import { Room } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function getRooms(): Promise<{ data: Room[]; error?: string }> {
  if (!isSupabaseServerConfigured()) {
    // Return sample mock data if Supabase isn't configured yet
    return {
      data: [
        {
          id: 'room-1',
          room_number: '101',
          monthly_price: 1500000,
          description: 'Lantai 1 - AC, Kamar Mandi Dalam',
          status: 'occupied',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'room-2',
          room_number: '102',
          monthly_price: 1500000,
          description: 'Lantai 1 - AC, Kamar Mandi Dalam',
          status: 'occupied',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'room-3',
          room_number: '103',
          monthly_price: 1200000,
          description: 'Lantai 1 - Kipas Angin, Kamar Mandi Luar',
          status: 'available',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'room-4',
          room_number: '201',
          monthly_price: 1750000,
          description: 'Lantai 2 - AC, Balkon, Smart TV',
          status: 'occupied',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
      ],
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('room_number', { ascending: true });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data as Room[]) || [] };
}

export async function createRoom(values: RoomFormValues) {
  const validated = roomSchema.safeParse(values);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message };
  }

  if (!isSupabaseServerConfigured()) {
    return { success: false, error: 'Koneksi Supabase belum aktif.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rooms')
    .insert([
      {
        room_number: validated.data.room_number.trim(),
        monthly_price: validated.data.monthly_price,
        description: validated.data.description || null,
        status: validated.data.status,
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Nomor kamar sudah terdaftar.' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/kamar');
  revalidatePath('/admin/dashboard');
  revalidatePath('/status-pembayaran');
  return { success: true, data };
}

export async function updateRoom(id: string, values: RoomFormValues) {
  const validated = roomSchema.safeParse(values);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message };
  }

  if (!isSupabaseServerConfigured()) {
    return { success: false, error: 'Koneksi Supabase belum aktif.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rooms')
    .update({
      room_number: validated.data.room_number.trim(),
      monthly_price: validated.data.monthly_price,
      description: validated.data.description || null,
      status: validated.data.status,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Nomor kamar sudah terdaftar.' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/kamar');
  revalidatePath('/admin/dashboard');
  revalidatePath('/status-pembayaran');
  return { success: true, data };
}

export async function deleteRoom(id: string) {
  if (!isSupabaseServerConfigured()) {
    return { success: false, error: 'Koneksi Supabase belum aktif.' };
  }

  const supabase = await createClient();

  // Cek apakah ada penghuni aktif yang menempati kamar ini
  const { data: activeTenants } = await supabase
    .from('tenants')
    .select('id, full_name')
    .eq('room_id', id)
    .eq('status', 'active');

  if (activeTenants && activeTenants.length > 0) {
    return {
      success: false,
      error: `Kamar tidak dapat dihapus karena masih dihuni oleh ${activeTenants[0].full_name}. Pindahkan atau nonaktifkan penghuni terlebih dahulu.`,
    };
  }

  const { error } = await supabase.from('rooms').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/kamar');
  revalidatePath('/admin/dashboard');
  revalidatePath('/status-pembayaran');
  return { success: true };
}

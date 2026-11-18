'use server';

import { createClient, isSupabaseServerConfigured } from '@/lib/supabase/server';
import { maskName } from '@/lib/utils/format';
import { TenantFormValues, tenantSchema } from '@/lib/validations/tenant';
import { Tenant } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function getTenants(): Promise<{ data: Tenant[]; error?: string }> {
  if (!isSupabaseServerConfigured()) {
    return {
      data: [
        {
          id: 'tenant-1',
          full_name: 'Andi Saputra',
          public_name: 'Andi S.',
          phone: '081234567890',
          room_id: 'room-1',
          move_in_date: '2026-01-01',
          move_out_date: null,
          status: 'active',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
          rooms: {
            id: 'room-1',
            room_number: '101',
            monthly_price: 1500000,
            description: null,
            status: 'occupied',
            created_at: '2026-01-01T00:00:00.000Z',
            updated_at: '2026-01-01T00:00:00.000Z',
          },
        },
        {
          id: 'tenant-2',
          full_name: 'Budi Prasetyo',
          public_name: 'Budi P.',
          phone: '081298765432',
          room_id: 'room-2',
          move_in_date: '2026-01-15',
          move_out_date: null,
          status: 'active',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
          rooms: {
            id: 'room-2',
            room_number: '102',
            monthly_price: 1500000,
            description: null,
            status: 'occupied',
            created_at: '2026-01-01T00:00:00.000Z',
            updated_at: '2026-01-01T00:00:00.000Z',
          },
        },
      ],
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tenants')
    .select(`
      *,
      rooms (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data as Tenant[]) || [] };
}

export async function createTenant(values: TenantFormValues) {
  const validated = tenantSchema.safeParse(values);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message };
  }

  if (!isSupabaseServerConfigured()) {
    return { success: false, error: 'Koneksi Supabase belum aktif.' };
  }

  const supabase = await createClient();

  // Pastikan public_name terisi
  const publicName = validated.data.public_name.trim() || maskName(validated.data.full_name);

  const { data, error } = await supabase
    .from('tenants')
    .insert([
      {
        full_name: validated.data.full_name.trim(),
        public_name: publicName,
        phone: validated.data.phone?.trim() || null,
        room_id: validated.data.room_id,
        move_in_date: validated.data.move_in_date,
        move_out_date: validated.data.move_out_date || null,
        status: validated.data.status,
      },
    ])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Update status kamar menjadi 'occupied' jika penghuni aktif
  if (validated.data.status === 'active' && validated.data.room_id) {
    await supabase
      .from('rooms')
      .update({ status: 'occupied' })
      .eq('id', validated.data.room_id);
  }

  revalidatePath('/admin/penghuni');
  revalidatePath('/admin/kamar');
  revalidatePath('/admin/dashboard');
  revalidatePath('/status-pembayaran');
  return { success: true, data };
}

export async function updateTenant(id: string, values: TenantFormValues) {
  const validated = tenantSchema.safeParse(values);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message };
  }

  if (!isSupabaseServerConfigured()) {
    return { success: false, error: 'Koneksi Supabase belum aktif.' };
  }

  const supabase = await createClient();
  const publicName = validated.data.public_name.trim() || maskName(validated.data.full_name);

  // Ambil data lama untuk update room status bila pindah kamar
  const { data: oldTenant } = await supabase
    .from('tenants')
    .select('room_id, status')
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('tenants')
    .update({
      full_name: validated.data.full_name.trim(),
      public_name: publicName,
      phone: validated.data.phone?.trim() || null,
      room_id: validated.data.room_id,
      move_in_date: validated.data.move_in_date,
      move_out_date: validated.data.move_out_date || null,
      status: validated.data.status,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Handle pergantian kamar jika perlu
  if (oldTenant?.room_id && oldTenant.room_id !== validated.data.room_id) {
    // Check if old room has other active tenants
    const { data: otherTenants } = await supabase
      .from('tenants')
      .select('id')
      .eq('room_id', oldTenant.room_id)
      .eq('status', 'active');

    if (!otherTenants || otherTenants.length === 0) {
      await supabase
        .from('rooms')
        .update({ status: 'available' })
        .eq('id', oldTenant.room_id);
    }
  }

  if (validated.data.status === 'active' && validated.data.room_id) {
    await supabase
      .from('rooms')
      .update({ status: 'occupied' })
      .eq('id', validated.data.room_id);
  } else if (validated.data.status === 'inactive' && validated.data.room_id) {
    // Jika nonaktif, cek apakah masih ada penghuni aktif lain di kamar itu
    const { data: otherTenants } = await supabase
      .from('tenants')
      .select('id')
      .eq('room_id', validated.data.room_id)
      .eq('status', 'active');

    if (!otherTenants || otherTenants.length === 0) {
      await supabase
        .from('rooms')
        .update({ status: 'available' })
        .eq('id', validated.data.room_id);
    }
  }

  revalidatePath('/admin/penghuni');
  revalidatePath('/admin/kamar');
  revalidatePath('/admin/dashboard');
  revalidatePath('/status-pembayaran');
  return { success: true, data };
}

export async function deleteTenant(id: string) {
  if (!isSupabaseServerConfigured()) {
    return { success: false, error: 'Koneksi Supabase belum aktif.' };
  }

  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('tenants')
    .select('room_id')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('tenants').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  // Jika kamar menjadi kosong, update status kamar
  if (tenant?.room_id) {
    const { data: remaining } = await supabase
      .from('tenants')
      .select('id')
      .eq('room_id', tenant.room_id)
      .eq('status', 'active');

    if (!remaining || remaining.length === 0) {
      await supabase
        .from('rooms')
        .update({ status: 'available' })
        .eq('id', tenant.room_id);
    }
  }

  revalidatePath('/admin/penghuni');
  revalidatePath('/admin/kamar');
  revalidatePath('/admin/dashboard');
  revalidatePath('/status-pembayaran');
  return { success: true };
}

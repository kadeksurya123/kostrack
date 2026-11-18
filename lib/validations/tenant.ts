import { z } from 'zod';

export const tenantSchema = z.object({
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100, 'Nama terlalu panjang'),
  public_name: z.string().min(1, 'Nama publik wajib diisi (contoh: Andi S.)').max(50),
  phone: z.string().optional().nullable(),
  room_id: z.string().min(1, 'Pilih kamar yang dihuni'),
  move_in_date: z.string().min(1, 'Tanggal mulai menempati wajib diisi'),
  move_out_date: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']),
});

export type TenantFormValues = z.infer<typeof tenantSchema>;

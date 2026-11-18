import { z } from 'zod';

export const roomSchema = z.object({
  room_number: z.string().min(1, 'Nomor kamar wajib diisi').max(20, 'Nomor kamar maksimal 20 karakter'),
  monthly_price: z.number().min(0, 'Harga per bulan minimal 0'),
  description: z.string().optional().nullable(),
  status: z.enum(['available', 'occupied', 'maintenance']),
});

export type RoomFormValues = z.infer<typeof roomSchema>;

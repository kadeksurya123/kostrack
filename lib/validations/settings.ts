import { z } from 'zod';

export const settingsSchema = z.object({
  boarding_name: z.string().min(1, 'Nama kos wajib diisi').max(100),
  boarding_address: z.string().optional().nullable(),
  due_day: z.number().min(1, 'Hari jatuh tempo antara 1 - 31').max(31, 'Hari jatuh tempo antara 1 - 31'),
  public_name_masking: z.boolean(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

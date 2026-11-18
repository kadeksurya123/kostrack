'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TenantFormValues, tenantSchema } from '@/lib/validations/tenant';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { maskName } from '@/lib/utils/format';
import { createTenant, updateTenant } from '@/actions/tenants';
import { Room, Tenant } from '@/types/database';

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantToEdit?: Tenant | null;
  rooms: Room[];
  onSuccess: () => void;
}

export function TenantModal({
  isOpen,
  onClose,
  tenantToEdit,
  rooms,
  onSuccess,
}: TenantModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      full_name: '',
      public_name: '',
      phone: '',
      room_id: '',
      move_in_date: new Date().toISOString().split('T')[0],
      move_out_date: '',
      status: 'active',
    },
  });

  const fullNameValue = watch('full_name');

  // Auto-suggest public name when full name is entered
  const handleFullNameBlur = () => {
    if (fullNameValue && !tenantToEdit) {
      const suggested = maskName(fullNameValue);
      setValue('public_name', suggested, { shouldValidate: true });
    }
  };

  useEffect(() => {
    if (tenantToEdit) {
      reset({
        full_name: tenantToEdit.full_name,
        public_name: tenantToEdit.public_name,
        phone: tenantToEdit.phone || '',
        room_id: tenantToEdit.room_id || '',
        move_in_date: tenantToEdit.move_in_date,
        move_out_date: tenantToEdit.move_out_date || '',
        status: tenantToEdit.status,
      });
    } else {
      reset({
        full_name: '',
        public_name: '',
        phone: '',
        room_id: rooms.find((r) => r.status === 'available')?.id || (rooms[0]?.id || ''),
        move_in_date: new Date().toISOString().split('T')[0],
        move_out_date: '',
        status: 'active',
      });
    }
    setServerError(null);
  }, [tenantToEdit, isOpen, reset, rooms]);

  const onSubmit = async (values: TenantFormValues) => {
    setServerError(null);
    let res;
    if (tenantToEdit) {
      res = await updateTenant(tenantToEdit.id, values);
    } else {
      res = await createTenant(values);
    }

    if (!res.success) {
      setServerError(res.error || 'Terjadi kesalahan');
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tenantToEdit ? 'Edit Data Penghuni' : 'Tambah Penghuni Baru'}
      description="Kelola profil penyewa kos dan alokasi kamar"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nama Lengkap (Khusus Admin)"
            placeholder="Contoh: Andi Saputra"
            error={errors.full_name?.message}
            {...register('full_name')}
            onBlur={handleFullNameBlur}
          />

          <div>
            <Input
              label="Nama Publik (Tampil di Halaman Publik)"
              placeholder="Contoh: Andi S."
              error={errors.public_name?.message}
              {...register('public_name')}
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Disamarkan untuk melindungi privasi penghuni.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Nomor WhatsApp / HP (Rahasia Admin)"
              placeholder="Contoh: 08123456789"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Hanya dapat dilihat oleh admin, tidak akan dipublikasikan.
            </p>
          </div>

          <Select
            label="Kamar yang Ditempati"
            error={errors.room_id?.message}
            {...register('room_id')}
          >
            <option value="">-- Pilih Kamar --</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                Kamar {r.room_number} ({r.status === 'available' ? 'Kosong' : r.status === 'occupied' ? 'Terisi' : 'Perawatan'})
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Tanggal Mulai Masuk"
            error={errors.move_in_date?.message}
            {...register('move_in_date')}
          />

          <Input
            type="date"
            label="Tanggal Keluar (Opsional)"
            error={errors.move_out_date?.message}
            {...register('move_out_date')}
          />
        </div>

        <Select
          label="Status Penghuni"
          error={errors.status?.message}
          {...register('status')}
        >
          <option value="active">Aktif (Sedang Menempati)</option>
          <option value="inactive">Nonaktif / Keluar</option>
        </Select>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {tenantToEdit ? 'Simpan Perubahan' : 'Tambah Penghuni'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

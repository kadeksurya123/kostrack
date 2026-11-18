'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RoomFormValues, roomSchema } from '@/lib/validations/room';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select, Textarea } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { createRoom, updateRoom } from '@/actions/rooms';
import { Room } from '@/types/database';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomToEdit?: Room | null;
  onSuccess: () => void;
}

export function RoomModal({ isOpen, onClose, roomToEdit, onSuccess }: RoomModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      room_number: '',
      monthly_price: 1500000,
      description: '',
      status: 'available',
    },
  });

  useEffect(() => {
    if (roomToEdit) {
      reset({
        room_number: roomToEdit.room_number,
        monthly_price: Number(roomToEdit.monthly_price),
        description: roomToEdit.description || '',
        status: roomToEdit.status,
      });
    } else {
      reset({
        room_number: '',
        monthly_price: 1500000,
        description: '',
        status: 'available',
      });
    }
    setServerError(null);
  }, [roomToEdit, isOpen, reset]);

  const onSubmit = async (values: RoomFormValues) => {
    setServerError(null);
    let res;
    if (roomToEdit) {
      res = await updateRoom(roomToEdit.id, values);
    } else {
      res = await createRoom(values);
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
      title={roomToEdit ? 'Edit Data Kamar' : 'Tambah Kamar Baru'}
      description="Kelola spesifikasi kamar dan tarif sewa bulanan"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
            {serverError}
          </div>
        )}

        <Input
          label="Nomor / Nama Kamar"
          placeholder="Contoh: 101 atau A-01"
          error={errors.room_number?.message}
          {...register('room_number')}
        />

        <Input
          type="number"
          label="Harga Sewa Bulanan (Rp)"
          placeholder="1500000"
          error={errors.monthly_price?.message}
          {...register('monthly_price', { valueAsNumber: true })}
        />

        <Select
          label="Status Kamar"
          error={errors.status?.message}
          {...register('status')}
        >
          <option value="available">Kosong / Tersedia (available)</option>
          <option value="occupied">Terisi (occupied)</option>
          <option value="maintenance">Perbaikan / Perawatan (maintenance)</option>
        </Select>

        <Textarea
          label="Deskripsi / Fasilitas Kamar"
          placeholder="Contoh: Lantai 1, AC, Kamar Mandi Dalam, Kasur Queen, Meja Kerja"
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {roomToEdit ? 'Simpan Perubahan' : 'Tambah Kamar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

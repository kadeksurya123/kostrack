'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SettingsFormValues, settingsSchema } from '@/lib/validations/settings';
import { BoardingSettings } from '@/types/database';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { updateSettings } from '@/actions/settings';
import {
  Building,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Info,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SettingsFormProps {
  initialSettings: BoardingSettings | null;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      boarding_name: initialSettings?.boarding_name || 'KosTrack Residence',
      boarding_address: initialSettings?.boarding_address || '',
      due_day: initialSettings?.due_day || 10,
      public_name_masking: initialSettings?.public_name_masking ?? true,
    },
  });

  const isMasking = watch('public_name_masking');

  const onSubmit = async (values: SettingsFormValues) => {
    setServerError(null);
    setSuccessMsg(null);
    const res = await updateSettings(values);
    if (!res.success) {
      setServerError(res.error || 'Gagal menyimpan pengaturan');
    } else {
      setSuccessMsg('Pengaturan kos berhasil diperbarui!');
      router.refresh();
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Pengaturan Kos & Sistem</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Konfigurasi identitas kos, parameter penentuan jatuh tempo, dan privasi penghuni
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {serverError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Identitas Kos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <CardTitle>Identitas Rumah Kos</CardTitle>
            </div>
            <p className="text-xs text-slate-500">
              Informasi ini akan ditampilkan pada header dashboard admin dan halaman publik penghuni.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nama Kos"
              placeholder="Contoh: Kos Sukses Mandiri"
              error={errors.boarding_name?.message}
              {...register('boarding_name')}
            />

            <Textarea
              label="Alamat Kos"
              placeholder="Contoh: Jl. Diponegoro No. 88, Menteng, Jakarta Pusat"
              rows={3}
              error={errors.boarding_address?.message}
              {...register('boarding_address')}
            />
          </CardContent>
        </Card>

        {/* Kebijakan Jatuh Tempo */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <CardTitle>Kebijakan Pembayaran & Jatuh Tempo</CardTitle>
            </div>
            <p className="text-xs text-slate-500">
              Sistem menggunakan tanggal ini untuk menentukan status otomatis (BELUM BAYAR vs TERLAMBAT).
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-xs">
              <Input
                type="number"
                min={1}
                max={31}
                label="Tanggal Jatuh Tempo Setiap Bulan (1 - 31)"
                placeholder="10"
                error={errors.due_day?.message}
                {...register('due_day', { valueAsNumber: true })}
              />
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-700">Logika Status Otomatis:</p>
                <p className="mt-0.5 text-slate-500">
                  Sebelum tanggal jatuh tempo lewat: status terhitung <strong>BELUM BAYAR</strong>.
                  Setelah lewat tanggal tersebut dan belum ada konfirmasi pembayaran: status otomatis berubah menjadi <strong>TERLAMBAT</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pengaturan Privasi Penghuni */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <CardTitle>Keamanan & Privasi Halaman Publik</CardTitle>
            </div>
            <p className="text-xs text-slate-500">
              Atur bagaimana data penghuni ditampilkan kepada publik agar informasi pribadi tetap aman.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <input
                id="public_name_masking"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                {...register('public_name_masking')}
              />
              <div className="space-y-1">
                <label
                  htmlFor="public_name_masking"
                  className="text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  Samarkan Nama Penghuni di Halaman Publik (Direkomendasikan)
                </label>
                <p className="text-xs text-slate-500">
                  {isMasking
                    ? 'Saat ini aktif: Penghuni ditampilkan dengan nama samaran (contoh: Andi S.). Nomor telepon dan catatan internal tidak pernah dipublikasikan.'
                    : 'Nonaktif: Nama lengkap penghuni akan tampil apa adanya di halaman publik.'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
              <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Halaman publik dapat diakses langsung oleh penghuni di:{' '}
                <a
                  href="/status-pembayaran"
                  target="_blank"
                  className="font-semibold underline hover:text-emerald-950"
                >
                  /status-pembayaran
                </a>
              </span>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
              Simpan Pengaturan
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

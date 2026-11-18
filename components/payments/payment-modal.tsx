'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaymentFormValues, paymentSchema } from '@/lib/validations/payment';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select, Textarea } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MONTH_NAMES } from '@/lib/utils/format';
import { createPayment, updatePayment } from '@/actions/payments';
import { Payment, Tenant } from '@/types/database';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentToEdit?: Payment | null;
  tenants: Tenant[];
  onSuccess: () => void;
  prefillTenantId?: string;
  prefillMonth?: number;
  prefillYear?: number;
}

export function PaymentModal({
  isOpen,
  onClose,
  paymentToEdit,
  tenants,
  onSuccess,
  prefillTenantId,
  prefillMonth,
  prefillYear,
}: PaymentModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const now = new Date();
  const currentMonth = prefillMonth || now.getMonth() + 1;
  const currentYear = prefillYear || now.getFullYear();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      tenant_id: '',
      period_month: currentMonth,
      period_year: currentYear,
      amount: 0,
      payment_date: '',
      payment_method: 'Transfer',
      status: 'LUNAS',
      notes: '',
    },
  });

  const selectedTenantId = watch('tenant_id');
  const selectedStatus = watch('status');

  // Auto-fill amount from tenant's room price when tenant changes
  useEffect(() => {
    if (!paymentToEdit && selectedTenantId) {
      const tenant = tenants.find((t) => t.id === selectedTenantId);
      if (tenant?.rooms?.monthly_price) {
        setValue('amount', Number(tenant.rooms.monthly_price));
      }
    }
  }, [selectedTenantId, paymentToEdit, tenants, setValue]);

  // If status is changed to LUNAS and payment_date is empty, auto-set today
  useEffect(() => {
    if (selectedStatus === 'LUNAS') {
      const todayStr = new Date().toISOString().split('T')[0];
      const curDate = watch('payment_date');
      if (!curDate) {
        setValue('payment_date', todayStr);
      }
    }
  }, [selectedStatus, setValue, watch]);

  useEffect(() => {
    if (paymentToEdit) {
      reset({
        tenant_id: paymentToEdit.tenant_id,
        period_month: paymentToEdit.period_month,
        period_year: paymentToEdit.period_year,
        amount: Number(paymentToEdit.amount),
        payment_date: paymentToEdit.payment_date || '',
        payment_method: paymentToEdit.payment_method || 'Transfer',
        status: paymentToEdit.status,
        notes: paymentToEdit.notes || '',
      });
    } else {
      const initialTenant = prefillTenantId || (tenants[0]?.id || '');
      const tenantObj = tenants.find((t) => t.id === initialTenant);
      const defaultAmount = tenantObj?.rooms?.monthly_price ? Number(tenantObj.rooms.monthly_price) : 1500000;

      reset({
        tenant_id: initialTenant,
        period_month: currentMonth,
        period_year: currentYear,
        amount: defaultAmount,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'Transfer',
        status: 'LUNAS',
        notes: '',
      });
    }
    setServerError(null);
  }, [paymentToEdit, isOpen, reset, tenants, prefillTenantId, currentMonth, currentYear]);

  const onSubmit = async (values: PaymentFormValues) => {
    setServerError(null);
    let res;
    if (paymentToEdit) {
      res = await updatePayment(paymentToEdit.id, values);
    } else {
      res = await createPayment(values);
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
      title={paymentToEdit ? 'Edit Pembayaran' : 'Catat Pembayaran Baru'}
      description="Konfirmasi penerimaan uang kos atau ubah rincian transaksi"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
            {serverError}
          </div>
        )}

        {/* Pilih Penghuni */}
        <Select
          label="Pilih Penghuni Kos"
          error={errors.tenant_id?.message}
          {...register('tenant_id')}
          disabled={Boolean(paymentToEdit)}
        >
          <option value="">-- Pilih Penghuni --</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.full_name} (Kamar {t.rooms?.room_number || '-'})
            </option>
          ))}
        </Select>

        {/* Periode Bulan & Tahun */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Bulan Periode"
            error={errors.period_month?.message}
            {...register('period_month', { valueAsNumber: true })}
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {name}
              </option>
            ))}
          </Select>

          <Input
            type="number"
            label="Tahun Periode"
            error={errors.period_year?.message}
            {...register('period_year', { valueAsNumber: true })}
          />
        </div>

        {/* Nominal & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="number"
            label="Nominal Pembayaran (Rp)"
            placeholder="1500000"
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />

          <Select
            label="Status Pembayaran"
            error={errors.status?.message}
            {...register('status')}
          >
            <option value="LUNAS">LUNAS (Sudah Diterima)</option>
            <option value="BELUM BAYAR">BELUM BAYAR (Menunggu)</option>
            <option value="TERLAMBAT">TERLAMBAT (Lewat Tempo)</option>
          </Select>
        </div>

        {/* Tanggal & Metode Pembayaran */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Tanggal Pembayaran"
            error={errors.payment_date?.message}
            {...register('payment_date')}
          />

          <Select
            label="Metode Pembayaran"
            error={errors.payment_method?.message}
            {...register('payment_method')}
          >
            <option value="Transfer">Transfer Bank</option>
            <option value="Cash">Tunai (Cash)</option>
            <option value="E-Wallet">E-Wallet (GoPay/OVO/ShopeePay/QRIS)</option>
          </Select>
        </div>

        {/* Catatan internal */}
        <Textarea
          label="Catatan Internal Admin (Hanya terlihat oleh Admin)"
          placeholder="Contoh: Bukti transfer via BCA an Andi, dicek tgl 2"
          rows={2}
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {paymentToEdit ? 'Simpan Perubahan' : 'Catat Pembayaran'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

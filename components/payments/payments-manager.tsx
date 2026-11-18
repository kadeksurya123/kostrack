'use client';

import React, { useState } from 'react';
import { Payment, Tenant } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentModal } from './payment-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrency, formatDate, getMonthName, MONTH_NAMES } from '@/lib/utils/format';
import { deletePayment, markPaymentAsPaid, generateMonthlyPayments } from '@/actions/payments';
import {
  CreditCard,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PaymentsManagerProps {
  initialPayments: Payment[];
  tenants: Tenant[];
}

export function PaymentsManager({ initialPayments, tenants }: PaymentsManagerProps) {
  const router = useRouter();
  const [payments] = useState<Payment[]>(initialPayments);
  const now = new Date();

  // Filters
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState<number>(now.getMonth() + 1);
  const [yearFilter, setYearFilter] = useState<number>(now.getFullYear());
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Quick Action: Mark Lunas
  const [quickLunasId, setQuickLunasId] = useState<string | null>(null);
  const [isMarkingLunas, setIsMarkingLunas] = useState(false);

  // Delete Dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate Monthly
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState<string | null>(null);

  const filteredPayments = payments.filter((item) => {
    const q = search.toLowerCase();
    const tenantName = item.tenants?.full_name?.toLowerCase() || '';
    const roomNum = item.tenants?.rooms?.room_number?.toLowerCase() || '';
    const notes = item.notes?.toLowerCase() || '';

    const matchesSearch = !search || tenantName.includes(q) || roomNum.includes(q) || notes.includes(q);
    const matchesMonth = monthFilter === 0 || item.period_month === monthFilter;
    const matchesYear = yearFilter === 0 || item.period_year === yearFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesMonth && matchesYear && matchesStatus;
  });

  const totalNominal = filteredPayments.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalLunasNominal = filteredPayments
    .filter((p) => p.status === 'LUNAS')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
  const countLunas = filteredPayments.filter((p) => p.status === 'LUNAS').length;
  const countBelum = filteredPayments.filter((p) => p.status === 'BELUM BAYAR').length;
  const countTerlambat = filteredPayments.filter((p) => p.status === 'TERLAMBAT').length;

  const handleOpenAdd = () => {
    setSelectedPayment(null);
    setIsModalOpen(true);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateMsg(null);
    setErrorMsg(null);
    const m = monthFilter !== 0 ? monthFilter : now.getMonth() + 1;
    const y = yearFilter !== 0 ? yearFilter : now.getFullYear();
    const res = await generateMonthlyPayments(m, y);
    setIsGenerating(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Gagal generate tagihan');
    } else {
      setGenerateMsg(`✅ Berhasil! ${res.generated} tagihan berhasil di-generate untuk ${getMonthName(m)} ${y}.`);
      router.refresh();
    }
  };

  const handleOpenEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    setQuickLunasId(paymentId);
    setIsMarkingLunas(true);
    setErrorMsg(null);
    const res = await markPaymentAsPaid(paymentId, 'Transfer');
    setIsMarkingLunas(false);
    setQuickLunasId(null);

    if (!res.success) {
      setErrorMsg(res.error || 'Gagal menandai lunas');
    } else {
      router.refresh();
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setErrorMsg(null);
    const res = await deletePayment(deleteId);
    setIsDeleting(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Gagal menghapus pembayaran');
    } else {
      setDeleteId(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Manajemen Pembayaran</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Catat penerimaan uang kos, kelola status tagihan, dan pantau pembayaran penghuni
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleGenerate}
            isLoading={isGenerating}
            variant="ghost"
            className="gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" />
            Generate Tagihan Bulan Ini
          </Button>
          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Catat Pembayaran Baru
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Pemasukan Diterima</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {formatCurrency(totalLunasNominal)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Dari total {formatCurrency(totalNominal)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-emerald-700 uppercase">Lunas</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-bold text-slate-800">{countLunas}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-rose-600 uppercase">Belum Bayar</p>
          <span className="text-2xl font-bold text-slate-800 mt-1 block">{countBelum}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-red-950 uppercase">Terlambat</p>
          <span className="text-2xl font-bold text-slate-800 mt-1 block">{countTerlambat}</span>
        </div>
      </div>

      {generateMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
          {generateMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari penghuni, kamar, atau catatan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Bulan */}
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(parseInt(e.target.value, 10))}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value={0}>Semua Bulan</option>
                {MONTH_NAMES.map((name, i) => (
                  <option key={i + 1} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>

              {/* Tahun */}
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(parseInt(e.target.value, 10))}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value={0}>Semua Tahun</option>
                <option value={now.getFullYear() - 1}>{now.getFullYear() - 1}</option>
                <option value={now.getFullYear()}>{now.getFullYear()}</option>
                <option value={now.getFullYear() + 1}>{now.getFullYear() + 1}</option>
              </select>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="ALL">Semua Status</option>
                <option value="LUNAS">Lunas</option>
                <option value="BELUM BAYAR">Belum Bayar</option>
                <option value="TERLAMBAT">Terlambat</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredPayments.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <CreditCard className="w-10 h-10 text-slate-300" />
              <p>Tidak ada catatan pembayaran yang sesuai filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Penghuni / Kamar</th>
                    <th className="px-4 py-3.5">Periode</th>
                    <th className="px-4 py-3.5">Nominal</th>
                    <th className="px-4 py-3.5">Tgl Bayar & Metode</th>
                    <th className="px-4 py-3.5">Catatan Admin</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((p) => {
                    const isPaid = p.status === 'LUNAS';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">
                            {p.tenants?.full_name || 'Penghuni'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Kamar {p.tenants?.rooms?.room_number || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-700">
                          {getMonthName(p.period_month)} {p.period_year}
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-800">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {p.payment_date ? (
                            <div>
                              <div className="font-medium text-slate-800">
                                {formatDate(p.payment_date)}
                              </div>
                              <span className="inline-block text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 mt-0.5">
                                {p.payment_method || 'Transfer'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Belum dibayar</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-500 max-w-xs">
                          {p.notes ? (
                            <div className="flex items-start gap-1">
                              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span className="truncate">{p.notes}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Badge status={p.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isPaid && (
                              <Button
                                size="sm"
                                variant="primary"
                                className="h-7 text-[11px] px-2.5 bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleMarkAsPaid(p.id)}
                                isLoading={isMarkingLunas && quickLunasId === p.id}
                                title="Tandai pembayaran ini lunas hari ini"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Lunas
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => handleOpenEdit(p)}
                              title="Edit Data Pembayaran"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              onClick={() => setDeleteId(p.id)}
                              title="Hapus Pembayaran"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Add/Edit */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        paymentToEdit={selectedPayment}
        tenants={tenants}
        prefillMonth={monthFilter !== 0 ? monthFilter : undefined}
        prefillYear={yearFilter !== 0 ? yearFilter : undefined}
        onSuccess={() => {
          router.refresh();
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Hapus Data Pembayaran"
        message="Apakah Anda yakin ingin menghapus data pembayaran ini? Catatan ini akan dihapus permanen dari sistem."
      />
    </div>
  );
}

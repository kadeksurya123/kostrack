'use client';

import React, { useState } from 'react';
import { Payment } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getMonthName, MONTH_NAMES } from '@/lib/utils/format';
import {
  History,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentHistoryManagerProps {
  initialPayments: Payment[];
}

export function PaymentHistoryManager({ initialPayments }: PaymentHistoryManagerProps) {
  const [payments] = useState<Payment[]>(initialPayments);

  // Filters
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState<number>(0);
  const [yearFilter, setYearFilter] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Sorting
  const [sortField, setSortField] = useState<'period' | 'amount' | 'payment_date' | 'name'>('period');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered & Sorted Payments
  const filtered = payments.filter((item) => {
    const q = search.toLowerCase();
    const name = item.tenants?.full_name?.toLowerCase() || '';
    const room = item.tenants?.rooms?.room_number?.toLowerCase() || '';
    const notes = item.notes?.toLowerCase() || '';

    const matchesSearch = !search || name.includes(q) || room.includes(q) || notes.includes(q);
    const matchesMonth = monthFilter === 0 || item.period_month === monthFilter;
    const matchesYear = yearFilter === 0 || item.period_year === yearFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesMonth && matchesYear && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'period') {
      const aVal = a.period_year * 100 + a.period_month;
      const bVal = b.period_year * 100 + b.period_month;
      comparison = aVal - bVal;
    } else if (sortField === 'amount') {
      comparison = Number(a.amount) - Number(b.amount);
    } else if (sortField === 'payment_date') {
      const aDate = a.payment_date ? new Date(a.payment_date).getTime() : 0;
      const bDate = b.payment_date ? new Date(b.payment_date).getTime() : 0;
      comparison = aDate - bDate;
    } else if (sortField === 'name') {
      const aName = a.tenants?.full_name || '';
      const bName = b.tenants?.full_name || '';
      comparison = aName.localeCompare(bName);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination slice
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = ['Nama Penghuni', 'Kamar', 'Bulan', 'Tahun', 'Nominal', 'Tanggal Bayar', 'Metode', 'Status', 'Catatan'];
    const rows = sorted.map((p) => [
      `"${p.tenants?.full_name || '-'}"`,
      `"${p.tenants?.rooms?.room_number || '-'}"`,
      `"${getMonthName(p.period_month)}"`,
      p.period_year,
      p.amount,
      `"${p.payment_date || '-'}"`,
      `"${p.payment_method || '-'}"`,
      `"${p.status}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `riwayat-pembayaran-kostrack-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Riwayat Pembayaran</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Arsip seluruh transaksi pembayaran uang kos penghuni dari waktu ke waktu
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV} className="gap-2">
          <Download className="w-4 h-4 text-slate-600" />
          Ekspor CSV
        </Button>
      </div>

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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Bulan */}
              <select
                value={monthFilter}
                onChange={(e) => {
                  setMonthFilter(parseInt(e.target.value, 10));
                  setCurrentPage(1);
                }}
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
                onChange={(e) => {
                  setYearFilter(parseInt(e.target.value, 10));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value={0}>Semua Tahun</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
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
          {sorted.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <History className="w-10 h-10 text-slate-300" />
              <p>Tidak ada riwayat pembayaran yang cocok.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th
                      className="px-6 py-3.5 cursor-pointer hover:text-slate-800 transition-colors"
                      onClick={() => toggleSort('name')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Penghuni & Kamar</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:text-slate-800 transition-colors"
                      onClick={() => toggleSort('period')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Periode</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:text-slate-800 transition-colors"
                      onClick={() => toggleSort('amount')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Nominal</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:text-slate-800 transition-colors"
                      onClick={() => toggleSort('payment_date')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Tanggal Bayar</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5">Metode</th>
                    <th className="px-4 py-3.5">Catatan</th>
                    <th className="px-6 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((p) => {
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
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatDate(p.payment_date)}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {p.payment_method ? (
                            <span className="inline-block text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {p.payment_method}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-500 max-w-xs truncate">
                          {p.notes || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Badge status={p.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {sorted.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} hingga{' '}
                {Math.min(currentPage * itemsPerPage, sorted.length)} dari {sorted.length} transaksi
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2.5 text-xs"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-0.5" />
                  Sebelumnya
                </Button>
                <span className="text-xs font-semibold text-slate-700 px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2.5 text-xs"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Berikutnya
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

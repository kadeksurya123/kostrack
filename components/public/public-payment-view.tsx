'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Calendar,
  ShieldCheck,
  LogIn,
  RotateCw,
  Users,
  Info,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getMonthName, MONTH_NAMES } from '@/lib/utils/format';
import { PublicApiResponse, PublicPaymentItem } from '@/types';

export function PublicPaymentView() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PublicPaymentItem[]>([]);
  const [meta, setMeta] = useState<PublicApiResponse<PublicPaymentItem[]>['meta']>();
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
      });
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await fetch(`/api/public/payments?${params.toString()}`, {
        cache: 'no-store',
      });
      const json: PublicApiResponse<PublicPaymentItem[]> = await res.json();

      if (json.success) {
        setData(json.data);
        setMeta(json.meta);
      } else {
        setError(json.error || 'Gagal memuat status pembayaran');
      }
    } catch {
      setError('Koneksi terputus atau gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-slate-800 text-sm sm:text-base tracking-tight truncate">
                  KosTrack
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                  Publik
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate max-w-[150px] sm:max-w-xs font-medium">
                {meta?.boardingName || 'Papan Pembayaran Kos'}
              </p>
            </div>
          </div>

          <Link href="/login" className="shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-200 h-8 sm:h-9 px-2.5 sm:px-3"
            >
              <LogIn className="w-3.5 h-3.5 sm:mr-1.5 text-slate-400" />
              <span className="hidden sm:inline">Login Pemilik (Admin)</span>
              <span className="sm:hidden text-[11px]">Admin</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Hero Banner */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
              <span>Privasi Terjaga & Bebas Login</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-800 tracking-tight">
              Monitoring Pembayaran Uang Kos
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 max-w-xl">
              Halaman ini diperbarui langsung oleh pengelola kos untuk mempermudah pengecekan status
              uang sewa bulanan secara transparan.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200/70 w-full sm:w-auto shrink-0">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[9px] sm:text-[10px] font-semibold uppercase">
                Jatuh Tempo Bulanan
              </span>
              <span className="font-bold text-slate-700 text-[11px] sm:text-xs">
                Tanggal {meta?.dueDay || 10} Setiap Bulan
              </span>
            </div>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-white rounded-xl p-3 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div className="space-y-0.5 sm:space-y-1">
              <span className="text-[9px] sm:text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
                Lunas
              </span>
              <p className="text-xl sm:text-3xl font-bold text-slate-800">{meta?.totalPaid ?? 0}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
                Pembayaran diterima
              </p>
            </div>
            <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 self-end sm:self-auto">
              <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div className="space-y-0.5 sm:space-y-1">
              <span className="text-[9px] sm:text-xs font-semibold text-rose-700 uppercase tracking-wider block truncate">
                Belum Bayar
              </span>
              <p className="text-xl sm:text-3xl font-bold text-slate-800">{meta?.totalUnpaid ?? 0}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
                Sebelum jatuh tempo
              </p>
            </div>
            <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 self-end sm:self-auto">
              <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div className="space-y-0.5 sm:space-y-1">
              <span className="text-[9px] sm:text-xs font-semibold text-red-950 uppercase tracking-wider block">
                Terlambat
              </span>
              <p className="text-xl sm:text-3xl font-bold text-slate-800">{meta?.totalLate ?? 0}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
                Lewat tanggal jatuh tempo
              </p>
            </div>
            <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-red-950 text-red-100 flex items-center justify-center shrink-0 self-end sm:self-auto">
              <AlertOctagon className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Filter Bar & Controls */}
        <Card>
          <CardContent className="p-3 sm:p-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center justify-between">
              {/* Search Field */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama atau kamar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                />
              </div>

              {/* Month, Year & Refresh Filters */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                  aria-label="Filter Bulan"
                  className="flex-1 md:w-auto px-2.5 sm:px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {MONTH_NAMES.map((name, i) => (
                    <option key={i + 1} value={i + 1}>
                      {name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                  aria-label="Filter Tahun"
                  className="w-24 px-2.5 sm:px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchData}
                  disabled={loading}
                  className="h-8.5 px-3 shrink-0"
                  title="Segarkan data"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Status Legend */}
            <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] sm:text-xs text-slate-500">
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-400" /> Keterangan:
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <strong className="text-slate-700">LUNAS</strong>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <strong className="text-slate-700">BELUM BAYAR</strong>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-950" />
                <strong className="text-slate-700">TERLAMBAT</strong>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Data Container: Desktop Table + Mobile Cards */}
        <Card>
          <CardContent className="p-0">
            {error && (
              <div className="p-6 text-center text-xs text-rose-600">
                <p>{error}</p>
                <Button size="sm" variant="outline" onClick={fetchData} className="mt-3">
                  Coba Lagi
                </Button>
              </div>
            )}

            {!error && loading ? (
              <div className="py-14 text-center text-xs text-slate-400 flex flex-col items-center gap-2.5">
                <RotateCw className="w-5 h-5 animate-spin text-emerald-500" />
                <p>Memuat status pembayaran...</p>
              </div>
            ) : !error && data.length === 0 ? (
              <div className="py-14 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <Users className="w-8 h-8 text-slate-300" />
                <p>Tidak ada data pembayaran yang ditemukan untuk periode ini.</p>
              </div>
            ) : (
              <>
                {/* 1. Mobile Cards View (Tampil rapi di layar HP) */}
                <div className="sm:hidden divide-y divide-slate-100">
                  {data.map((item) => (
                    <div
                      key={item.payment_id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 text-[11px]">
                            Kamar {item.room_number}
                          </span>
                          <span className="font-semibold text-slate-900 text-sm truncate">
                            {item.tenant_name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>
                            {getMonthName(item.period_month)} {item.period_year}
                          </span>
                        </p>
                      </div>

                      <div className="shrink-0">
                        <Badge status={item.status} className="text-[11px] px-2.5 py-0.5" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2. Desktop Table View (Tampil di tablet & komputer) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Nama Penghuni</th>
                        <th className="px-4 py-4">Nomor Kamar</th>
                        <th className="px-4 py-4">Periode</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.map((item) => (
                        <tr
                          key={item.payment_id}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="px-6 py-4 font-semibold text-slate-800">
                            {item.tenant_name}
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 font-medium text-slate-700">
                              Kamar {item.room_number}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-medium text-slate-600">
                            {getMonthName(item.period_month)} {item.period_year}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Badge status={item.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Privacy Note */}
        <div className="text-center text-slate-400 text-[10px] sm:text-[11px] py-2 sm:py-4">
          <p>
            Data dilindungi oleh kebijakan privasi KosTrack. Nomor telepon, email, dan catatan
            internal pemilik tidak dipublikasikan.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 sm:py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-xs text-slate-500">
          <p className="text-[11px] sm:text-xs text-center sm:text-left">
            &copy; {new Date().getFullYear()} <strong>KosTrack</strong> &bull; Sistem Monitoring
            Pembayaran Uang Kos
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-emerald-600 font-medium text-xs">
              Area Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { getDashboardData } from '@/actions/dashboard';
import { StatCard } from '@/components/dashboard/stat-card';
import { MonthlyChart } from '@/components/dashboard/monthly-chart';
import { RecentPaymentsTable } from '@/components/dashboard/recent-payments-table';
import { formatCurrency, getMonthName } from '@/lib/utils/format';
import {
  Users,
  DoorOpen,
  DoorClosed,
  Wallet,
  CheckCircle2,
  Clock,
  AlertOctagon,
  PlusCircle,
  UserPlus,
  DoorClosed as DoorIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard Admin - KosTrack',
};

export default async function DashboardPage() {
  const { stats, recentPayments, monthlyIncomes, boardingName } = await getDashboardData();
  const curMonth = new Date().getMonth() + 1;
  const curYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
            Selamat Datang di Admin Panel
          </span>
          <h1 className="text-2xl font-bold tracking-tight">{boardingName}</h1>
          <p className="text-xs text-emerald-100 max-w-xl">
            Ringkasan status operasional dan monitoring pembayaran periode {getMonthName(curMonth)}{' '}
            {curYear}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/admin/pembayaran">
            <Button
              size="sm"
              className="bg-white text-emerald-800 hover:bg-emerald-50 border-0 font-semibold shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              Catat Pembayaran
            </Button>
          </Link>
          <Link href="/admin/penghuni">
            <Button
              size="sm"
              variant="outline"
              className="bg-emerald-700/50 hover:bg-emerald-700 text-white border-emerald-400/40"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Penghuni
            </Button>
          </Link>
          <Link href="/admin/kamar">
            <Button
              size="sm"
              variant="outline"
              className="bg-emerald-700/50 hover:bg-emerald-700 text-white border-emerald-400/40"
            >
              <DoorIcon className="w-4 h-4" />
              Kelola Kamar
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 1: Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pemasukan Bulan Ini"
          value={formatCurrency(stats.totalIncomeThisMonth)}
          subtitle={`${stats.paidCountThisMonth} pembayaran lunas tercatat`}
          icon={Wallet}
          variant="emerald"
        />
        <StatCard
          title="Penghuni Aktif"
          value={stats.totalActiveTenants}
          subtitle={`Dari ${stats.totalRooms} total kapasitas`}
          icon={Users}
          variant="blue"
        />
        <StatCard
          title="Kamar Terisi"
          value={`${stats.occupiedRooms} / ${stats.totalRooms}`}
          subtitle={`${stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0}% okupansi kamar`}
          icon={DoorClosed}
          variant="slate"
        />
        <StatCard
          title="Kamar Kosong"
          value={stats.vacantRooms}
          subtitle="Tersedia untuk dihuni"
          icon={DoorOpen}
          variant="emerald"
        />
      </div>

      {/* Row 2: Status Tagihan Bulan Ini */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Sudah Membayar
            </span>
            <div className="text-3xl font-bold text-slate-800 mt-2">
              {stats.paidCountThisMonth}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Penghuni lunas bulan ini</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Belum Membayar
            </span>
            <div className="text-3xl font-bold text-slate-800 mt-2">
              {stats.unpaidCountThisMonth}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Sebelum tanggal jatuh tempo</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-red-950 bg-red-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Terlambat
            </span>
            <div className="text-3xl font-bold text-slate-800 mt-2">
              {stats.lateCountThisMonth}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Melewati batas jatuh tempo</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-950 text-red-100 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Row 3: Income Chart & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <MonthlyChart data={monthlyIncomes} />
        </div>
        <div className="lg:col-span-2">
          <RecentPaymentsTable payments={recentPayments} />
        </div>
      </div>
    </div>
  );
}

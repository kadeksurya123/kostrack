import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getMonthName } from '@/lib/utils/format';
import { Payment } from '@/types';
import { ArrowRight, CreditCard } from 'lucide-react';

interface RecentPaymentsTableProps {
  payments: Payment[];
}

export function RecentPaymentsTable({ payments }: RecentPaymentsTableProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6">
        <div>
          <CardTitle className="text-base sm:text-lg">Pembayaran Terbaru</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">Transaksi pembayaran yang baru dicatat</p>
        </div>
        <Link
          href="/admin/pembayaran"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 shrink-0"
        >
          Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {payments.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <CreditCard className="w-8 h-8 text-slate-300" />
            <p>Belum ada catatan pembayaran.</p>
          </div>
        ) : (
          <>
            {/* 1. Mobile Cards View (Tampil rapi di layar HP) */}
            <div className="sm:hidden divide-y divide-slate-100">
              {payments.map((p) => (
                <div key={p.id} className="p-3.5 space-y-1.5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold text-slate-800 text-xs truncate">
                        {p.tenants?.full_name || 'Penghuni'}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium shrink-0">
                        Kamar {p.tenants?.rooms?.room_number || '-'}
                      </span>
                    </div>
                    <span className="font-bold text-xs text-slate-900 shrink-0">
                      {formatCurrency(p.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>
                      {getMonthName(p.period_month)} {p.period_year} &bull; {p.payment_method || 'Transfer'}
                    </span>
                    <Badge status={p.status} className="text-[10px] px-2 py-0.2" />
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Desktop Table View (Tampil di tablet & komputer) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">Penghuni / Kamar</th>
                    <th className="px-4 py-3">Periode</th>
                    <th className="px-4 py-3">Nominal</th>
                    <th className="px-4 py-3">Metode</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => {
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-slate-800">
                            {p.tenants?.full_name || 'Penghuni'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Kamar {p.tenants?.rooms?.room_number || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {getMonthName(p.period_month)} {p.period_year}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500">
                          {p.payment_method || '-'}
                          {p.payment_date && (
                            <div className="text-[10px] text-slate-400">
                              {formatDate(p.payment_date, 'dd/MM/yyyy')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Badge status={p.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

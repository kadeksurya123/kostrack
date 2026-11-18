'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';
import { MonthlyIncomeBar } from '@/actions/dashboard';
import { TrendingUp } from 'lucide-react';

interface MonthlyChartProps {
  data: MonthlyIncomeBar[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const maxVal = Math.max(...data.map((d) => d.total), 1);

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6">
        <div>
          <CardTitle className="text-base sm:text-lg">Grafik Pemasukan Bulanan</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">Riwayat penerimaan uang kos 6 bulan terakhir</p>
        </div>
        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
          <TrendingUp className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="h-44 sm:h-48 w-full flex items-end justify-between gap-1 sm:gap-3 pt-6 pb-2">
          {data.map((item, idx) => {
            const heightPct = Math.max(Math.round((item.total / maxVal) * 100), 4);
            const isLatest = idx === data.length - 1;
            const monthShort = item.name.split(' ')[0] || item.name;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2 group h-full justify-end min-w-0">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] sm:text-[10px] bg-slate-800 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md shadow pointer-events-none whitespace-nowrap mb-1">
                  {formatCurrency(item.total)}
                </div>

                {/* Bar */}
                <div className="w-full max-w-[32px] sm:max-w-[48px] bg-slate-100 rounded-t-md sm:rounded-t-lg relative flex items-end h-full">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-md sm:rounded-t-lg transition-all duration-500 ${
                      isLatest
                        ? 'bg-emerald-500 group-hover:bg-emerald-600 shadow-sm shadow-emerald-500/20'
                        : 'bg-emerald-300 group-hover:bg-emerald-400'
                    }`}
                  />
                </div>

                {/* Label: Singkat di HP (Jun), Lengkap di Desktop (Jun 2026) */}
                <span
                  className={`text-[10px] sm:text-[11px] font-medium text-center truncate w-full ${
                    isLatest ? 'text-emerald-700 font-bold' : 'text-slate-500'
                  }`}
                  title={item.name}
                >
                  <span className="sm:hidden">{monthShort}</span>
                  <span className="hidden sm:inline">{item.name}</span>
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

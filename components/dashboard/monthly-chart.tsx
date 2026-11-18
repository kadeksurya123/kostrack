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
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle>Grafik Pemasukan Bulanan</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">Riwayat penerimaan uang kos 6 bulan terakhir</p>
        </div>
        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
          <TrendingUp className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end">
        <div className="h-48 w-full flex items-end justify-between gap-3 pt-6 pb-2">
          {data.map((item, idx) => {
            const heightPct = Math.max(Math.round((item.total / maxVal) * 100), 4);
            const isLatest = idx === data.length - 1;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-800 text-white px-2 py-1 rounded-md shadow pointer-events-none whitespace-nowrap mb-1">
                  {formatCurrency(item.total)}
                </div>

                {/* Bar */}
                <div className="w-full max-w-[48px] bg-slate-100 rounded-t-lg relative flex items-end h-full">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isLatest
                        ? 'bg-emerald-500 group-hover:bg-emerald-600 shadow-sm shadow-emerald-500/20'
                        : 'bg-emerald-300 group-hover:bg-emerald-400'
                    }`}
                  />
                </div>

                {/* Label */}
                <span
                  className={`text-[11px] truncate font-medium ${
                    isLatest ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

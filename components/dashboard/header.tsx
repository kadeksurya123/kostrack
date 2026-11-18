'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, ExternalLink, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';

interface HeaderProps {
  onOpenSidebar: () => void;
  boardingName?: string;
}

export function Header({ onOpenSidebar, boardingName = 'KosTrack' }: HeaderProps) {
  const today = new Date();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
            {boardingName}
          </h2>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Panel Manajemen Pembayaran Uang Kos
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(today, 'EEEE, dd MMMM yyyy')}</span>
        </div>

        <Link
          href="/status-pembayaran"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 px-3 py-1.5 rounded-xl transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Halaman Publik</span>
        </Link>
      </div>
    </header>
  );
}

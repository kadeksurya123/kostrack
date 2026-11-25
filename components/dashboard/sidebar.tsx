'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  Users,
  DoorClosed,
  History,
  Settings,
  ExternalLink,
  LogOut,
  Building2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { logoutAdmin } from '@/actions/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Pembayaran',
    href: '/admin/pembayaran',
    icon: CreditCard,
  },
  {
    title: 'Data Penghuni',
    href: '/admin/penghuni',
    icon: Users,
  },
  {
    title: 'Data Kamar',
    href: '/admin/kamar',
    icon: DoorClosed,
  },
  {
    title: 'Riwayat Pembayaran',
    href: '/admin/riwayat',
    icon: History,
  },
  {
    title: 'Pengaturan',
    href: '/admin/pengaturan',
    icon: Settings,
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand / Logo */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm shrink-0 border border-slate-200">
              <img src="/logo.jpg" alt="KosTrack Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-base tracking-tight">KosTrack</span>
              <span className="block text-[10px] text-emerald-600 font-semibold tracking-wider uppercase -mt-0.5">
                Admin Panel
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Utama
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-emerald-600' : 'text-slate-400'
                  )}
                />
                {item.title}
              </Link>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Tautan Eksternal
          </div>
          <Link
            href="/status-pembayaran"
            target="_blank"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4 text-slate-400" />
              Halaman Publik
            </span>
            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">
              Live
            </span>
          </Link>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">Administrator</p>
              <p className="text-[11px] text-slate-400 truncate">Pengelola Kos</p>
            </div>
          </div>

          <form action={logoutAdmin}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Keluar Akun
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

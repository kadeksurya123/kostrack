import React, { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Login Admin - KosTrack',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          href="/status-pembayaran"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Status</span>
        </Link>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
          Admin Portal
        </span>
      </div>

      <Suspense
        fallback={
          <div className="w-full max-w-md h-96 bg-white rounded-2xl border border-slate-200 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}

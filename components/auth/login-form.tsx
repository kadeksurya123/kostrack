'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormValues, loginSchema } from '@/lib/validations/auth';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building2, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin/dashboard';
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null);
    setIsFailed(false);

    if (!isSupabaseConfigured()) {
      setErrorMessage(
        'Supabase belum terhubung. Silakan isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di file .env.local untuk mengaktifkan autentikasi akun admin Anda.'
      );
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        const errorText = error.message.includes('Invalid login credentials')
          ? 'Email atau kata sandi tidak sesuai.'
          : error.message;

        setErrorMessage(errorText);
        // Tampilkan pop-up Verifikasi Gagal
        setIsFailed(true);
        setTimeout(() => {
          setIsFailed(false);
        }, 2200);
        return;
      }

      // Tampilkan animasi & gambar Verifikasi Berhasil
      setIsSuccess(true);
      setTimeout(() => {
        router.push(redirectUrl);
        router.refresh();
      }, 1800);
    } catch {
      setErrorMessage('Terjadi kesalahan saat menghubungi server autentikasi.');
      setIsFailed(true);
      setTimeout(() => {
        setIsFailed(false);
      }, 2200);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Overlay Animasi Sukses Login */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xs sm:max-w-sm w-full text-center shadow-2xl border border-slate-100 flex flex-col items-center animate-in zoom-in-95 duration-200">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-md mb-4 border-2 border-emerald-500 bg-slate-50 flex items-center justify-center">
              <img
                src="/login-success.jpg"
                alt="Verifikasi Berhasil"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              Verifikasi Berhasil!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Sedang mengalihkan ke Dashboard Admin...
            </p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-emerald-500 h-full w-full animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Overlay Animasi Gagal Login */}
      {isFailed && (
        <div 
          onClick={() => setIsFailed(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-xs sm:max-w-sm w-full text-center shadow-2xl border border-rose-200 flex flex-col items-center animate-in zoom-in-95 duration-200"
          >
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-md mb-4 border-2 border-rose-500 bg-slate-50 flex items-center justify-center">
              <img
                src="/login-failed.jpg"
                alt="Verifikasi Gagal"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-rose-600 tracking-tight">
              Verifikasi Gagal!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {errorMessage || 'Email atau kata sandi tidak sesuai.'}
            </p>
            <button
              type="button"
              onClick={() => setIsFailed(false)}
              className="mt-4 px-4 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 sm:p-8">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-500 text-white items-center justify-center shadow-md shadow-emerald-500/20 mb-2">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">KosTrack Admin</h1>
          <p className="text-xs text-slate-500">
            Masuk untuk mengelola data penghuni, kamar, dan status pembayaran
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Input
              type="email"
              label="Alamat Email"
              placeholder="admin@kostrack.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-9 pointer-events-none" />
          </div>

          <div className="relative">
            <Input
              type="password"
              label="Kata Sandi"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-9 pointer-events-none" />
          </div>

          <Button type="submit" isLoading={isSubmitting} className="w-full h-11 mt-2">
            <span>Masuk ke Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Penghuni kos? Anda tidak memerlukan akun untuk melihat status.{' '}
            <a
              href="/status-pembayaran"
              className="text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-2"
            >
              Buka Halaman Publik
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

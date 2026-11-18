'use server';

import { createClient, isSupabaseServerConfigured } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validations/auth';
import { redirect } from 'next/navigation';

export async function loginAdmin(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Data tidak valid',
    };
  }

  if (!isSupabaseServerConfigured()) {
    return {
      error: 'Supabase belum dikonfigurasi. Harap isi NEXT_PUBLIC_SUPABASE_URL dan ANON_KEY di file .env.local',
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: error.message.includes('Invalid login credentials')
        ? 'Email atau password salah.'
        : error.message,
    };
  }

  redirect('/admin/dashboard');
}

export async function logoutAdmin() {
  if (isSupabaseServerConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect('/login');
}

export async function getAdminUser() {
  if (!isSupabaseServerConfigured()) {
    return null;
  }
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

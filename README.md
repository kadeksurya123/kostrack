# KosTrack - Sistem Monitoring Pembayaran Uang Kos Berbasis Web

**KosTrack** adalah platform aplikasi web modern yang dirancang khusus untuk pemilik dan pengelola rumah kos dalam mengelola data kamar, penghuni, dan memonitor penerimaan pembayaran sewa bulanan secara transparan, akurat, dan aman.

Aplikasi ini membagi hak akses secara ketat menjadi dua area:
1. **Admin Dashboard (Private)**: Khusus pemilik/pengelola kos dengan autentikasi email & password untuk manajemen penuh data kamar, penghuni, pencatatan transaksi, riwayat pembayaran, dan konfigurasi kos.
2. **Halaman Publik Penghuni (Public)**: Dapat diakses bebas oleh penghuni kos **tanpa perlu registrasi, login, atau password**. Dilengkapi fitur penyamaran nama (*privacy masking*) sehingga privasi penghuni tetap terlindungi (nomor telepon, email, dan catatan internal admin tidak akan pernah bocor ke publik).

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) App Router (TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components & Icons**: [shadcn/ui](https://ui.shadcn.com/) standard with [Lucide React](https://lucide.dev/)
- **Database & Auth**: [Supabase PostgreSQL](https://supabase.com/) & Supabase Auth
- **Backend API**: Next.js Route Handlers & Server Actions
- **Form & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Date Formatting**: [date-fns](https://date-fns.org/) (dengan locale bahasa Indonesia)
- **Typography & Color**: Font Inter, Primary Emerald Green (`#10B981`), Background (`#F8FAFC`), Slate Dark (`#1E293B`)
- **Deployment Ready**: Dioptimalkan penuh untuk [Vercel](https://vercel.com/)

---

## 📁 Struktur Direktori Proyek

```text
webkos/
├── actions/                  # Server Actions (auth, rooms, tenants, payments, settings, dashboard)
├── app/
│   ├── admin/               # Area Dashboard Admin (Terproteksi)
│   │   ├── dashboard/       # Ringkasan statistik, okupansi, grafik pemasukan
│   │   ├── kamar/           # CRUD data kamar & harga sewa
│   │   ├── pembayaran/      # Catat & kelola tagihan/pembayaran bulanan
│   │   ├── pengaturan/      # Konfigurasi nama kos, jatuh tempo, & privasi
│   │   ├── penghuni/        # CRUD data penghuni & riwayat penempatan
│   │   └── riwayat/         # Arsip seluruh riwayat pembayaran + ekspor CSV
│   ├── api/
│   │   └── public/
│   │       └── payments/    # Public Route Handler (sanitized, read-only)
│   ├── login/               # Halaman Login Admin Supabase Auth
│   ├── status-pembayaran/   # Halaman Publik Monitoring Pembayaran (Tanpa Login)
│   ├── globals.css          # Styling Tailwind CSS
│   ├── layout.tsx           # Root Layout (Font Inter, Metadata)
│   └── page.tsx             # Redirect ke /status-pembayaran
├── components/
│   ├── auth/                # Form login admin
│   ├── dashboard/           # Sidebar, header, stat cards, grafik bulanan
│   ├── payments/            # Modal & tabel manajemen pembayaran & riwayat
│   ├── public/              # Komponen tabel & filter status pembayaran publik
│   ├── rooms/               # Modal & manajemen kamar
│   ├── settings/            # Form konfigurasi pengaturan kos
│   ├── tenants/             # Modal & manajemen data penghuni
│   └── ui/                  # Button, Card, Badge, Modal, Input, Select, ConfirmDialog
├── lib/
│   ├── supabase/            # Client, Server, & Middleware/Proxy Supabase SSR
│   ├── utils/               # Format mata uang IDR, tanggal, nama masking, payment logic
│   └── validations/         # Schema validasi Zod
├── public/                  # Static assets
├── supabase/
│   └── migrations/
│       ├── 01_initial_schema.sql  # Schema DDL, RLS, Trigger, Index, Public View
│       └── 02_sample_seed.sql     # Data contoh kamar & penghuni demo
├── proxy.ts                 # Next.js Proxy/Middleware proteksi rute /admin
├── package.json
└── README.md
```

---

## 🚀 Panduan Instalasi Lokal

### 1. Prasyarat Sistem
- **Node.js**: Versi 20.9.0 atau yang lebih baru (rekomendasi Node.js 22 LTS atau 24).
- **npm** (atau pnpm/yarn).
- Akun gratis di [Supabase](https://supabase.com/).

### 2. Clone & Install Dependencies
Buka terminal dan jalankan:
```bash
# Masuk ke direktori proyek
cd d:/webkos

# Install seluruh dependency
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Isi variabel berikut di dalam `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*(Lihat bagian panduan Supabase di bawah untuk cara mendapatkan URL dan Anon Key).*

### 4. Menjalankan Aplikasi
```bash
# Mode development (dengan Turbopack)
npm run dev

# Aplikasi akan aktif di: http://localhost:3000
```

Buka browser:
- Halaman Publik Penghuni: [http://localhost:3000/status-pembayaran](http://localhost:3000/status-pembayaran)
- Login Admin: [http://localhost:3000/login](http://localhost:3000/login)

---

## 🗄️ Panduan Menyiapkan Database Supabase

### 1. Buat Project Baru di Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com/dashboard).
2. Klik tombol **New Project**.
3. Masukkan **Name** (misalnya `kostrack-db`), pilih **Database Password** yang kuat, dan pilih Region terdekat (misal: *Singapore*).
4. Tunggu beberapa saat hingga database selesai dibuat.

### 2. Eksekusi SQL Migration
1. Di Supabase Dashboard project Anda, buka menu **SQL Editor** pada navigasi sebelah kiri.
2. Klik **New Query**.
3. Buka file `supabase/migrations/01_initial_schema.sql` dari project ini, salin seluruh kodenya, lalu tempelkan (*paste*) ke SQL Editor Supabase.
4. Klik tombol **Run** (atau tekan `Ctrl+Enter`).
5. Periksa hasilnya: Tabel `profiles`, `boarding_settings`, `rooms`, `tenants`, `payments`, view `public_payments_overview`, Row Level Security (RLS), trigger auto-update, dan trigger akun baru berhasil dibuat!

*(Opsional)* Jika ingin mengisi data demo (beberapa kamar dan penghuni contoh):
1. Buka kembali **SQL Editor**.
2. Salin isi file `supabase/migrations/02_sample_seed.sql`, tempel, lalu klik **Run**.

### 3. Mengambil Supabase URL & Anon Key
1. Buka menu **Project Settings** (ikon gerigi di kiri bawah) -> pilih **API**.
2. Di bagian **Project URL**, salin nilai URL (misal: `https://xyzcompany.supabase.co`).
3. Di bagian **Project API Keys**, salin nilai key `anon` `public`.
4. Tempelkan kedua nilai tersebut ke file `.env.local` di komputer Anda.

### 4. Membuat Akun Admin Pertama Secara Aman
Aplikasi KosTrack tidak menyediakan form registrasi publik demi keamanan. Untuk membuat akun Admin pertama:
1. Buka menu **Authentication** di Supabase Dashboard -> pilih sub-menu **Users**.
2. Klik tombol **Add user** -> pilih **Create user**.
3. Masukkan:
   - **User Email**: misal `admin@kostrack.com`
   - **Password**: masukkan password admin yang kuat
   - Centang **Auto Confirm User?** (agar email langsung aktif tanpa perlu verifikasi email)
4. Klik **Create user**.
5. Trigger otomatis database `on_auth_user_created` akan otomatis mendaftarkan akun tersebut ke tabel `public.profiles` dengan role `admin`.
6. Sekarang Anda dapat login ke KosTrack di `http://localhost:3000/login` menggunakan email dan password tersebut!

---

## 🔐 Keamanan & Row Level Security (RLS)

1. **Table RLS**: Seluruh tabel (`profiles`, `boarding_settings`, `rooms`, `tenants`, `payments`) menerapkan RLS ketat.
2. **Admin Policy**: Hanya user terautentikasi yang terdaftar di `profiles` dengan role `admin` yang berhak melakukan operasi INSERT, UPDATE, dan DELETE.
3. **Public Exposure Prevention**:
   - Pengunjung publik **dilarang membaca langsung** tabel `tenants` atau `payments`.
   - Data kontak pribadi penghuni (nomor telepon, tanggal lahir, catatan admin) **tidak pernah dikirimkan ke frontend publik**.
   - API publik `/api/public/payments` melakukan filtering dan sanitasi data hanya untuk kolom publik (`tenant_name`, `room_number`, `period_month`, `period_year`, `amount`, `payment_date`, `status`).
   - Fitur **Privacy Masking**: Jika diaktifkan, nama penghuni otomatis disamarkan (contoh: "Andi Saputra" menjadi "Andi S.").

---

## 🌐 Panduan Deployment ke Vercel

Aplikasi ini sudah 100% kompatibel dan siap di-deploy langsung ke platform Vercel.

### Langkah 1: Push Project ke GitHub
```bash
git init
git add .
git commit -m "feat: initial commit KosTrack full-stack application"
git branch -M main
git remote add origin https://github.com/<username>/<nama-repo>.git
git push -u origin main
```

### Langkah 2: Import ke Vercel
1. Buka [Vercel Dashboard](https://vercel.com/) dan login dengan akun GitHub Anda.
2. Klik tombol **Add New...** -> pilih **Project**.
3. Pilih repository GitHub KosTrack Anda, lalu klik **Import**.
4. Di bagian **Framework Preset**, Vercel akan otomatis mendeteksi **Next.js**.

### Langkah 3: Konfigurasi Environment Variables di Vercel
Pada bagian **Environment Variables** sebelum klik Deploy, tambahkan:
| Key | Value | Keterangan |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` | URL Project Supabase Anda |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Anon/Public API Key Supabase |

*(Pastikan dicentang untuk semua environment: Production, Preview, dan Development).*

5. Klik tombol **Deploy**.
6. Vercel akan menjalankan build Next.js dan website Anda akan aktif dalam 1-2 menit (misal: `https://kostrack.vercel.app`).

### Langkah 4: Pengaturan Redirect URL di Supabase untuk Production
Agar session autentikasi login admin berjalan sempurna di domain production Vercel:
1. Buka **Supabase Dashboard** -> pilih menu **Authentication** -> pilih **URL Configuration**.
2. Pada bagian **Site URL**, masukkan domain Vercel Anda:
   ```text
   https://kostrack.vercel.app
   ```
   *(Atau custom domain Anda jika menggunakan domain sendiri).*
3. Pada bagian **Redirect URLs**, tambahkan:
   ```text
   https://kostrack.vercel.app/**
   http://localhost:3000/**
   ```
4. Klik **Save**.

---

## 💡 Logika Status Pembayaran

Status pembayaran ditentukan dengan aturan bisnis berikut:
- **LUNAS (Hijau)**: Admin telah mencatat konfirmasi pembayaran dengan tanggal bayar dan metode pembayaran yang valid.
- **BELUM BAYAR (Merah)**: Penghuni belum membayar dan tanggal saat ini **belum melewati tanggal jatuh tempo** bulan berjalan (default: tanggal 10).
- **TERLAMBAT (Merah Tua)**: Penghuni belum membayar dan tanggal saat ini **telah melewati batas tanggal jatuh tempo** bulan berjalan.
- **Perubahan Harga Sewa**: Nilai tagihan yang tersimpan pada transaksi masa lalu tidak akan berubah meskipun harga kamar diubah di masa depan (nominal aktual tersimpan pada setiap baris pembayaran).
- **Penghuni Baru & Keluar**: Penghuni baru tidak otomatis memiliki riwayat tagihan sebelum tanggal mulai masuk (`move_in_date`), dan penghuni yang sudah keluar tetap mempertahankan riwayat pembayaran lama mereka.

---

## 🧪 Verifikasi & Pengujian Fitur

| No | Skenario Pengujian | Hasil |
| :---: | :--- | :---: |
| 1 | Pengunjung publik membuka `/status-pembayaran` tanpa login | ✅ Berhasil |
| 2 | Halaman publik memfilter bulan, tahun, dan pencarian nama | ✅ Berhasil |
| 3 | Admin login via `/login` dan diproteksi dari akses publik | ✅ Berhasil |
| 4 | Rute `/admin/*` otomatis me-redirect pengunjung yang belum login ke `/login` | ✅ Berhasil |
| 5 | Tambah, edit, dan hapus kamar di `/admin/kamar` | ✅ Berhasil |
| 6 | Tambah, edit, dan hapus penghuni di `/admin/penghuni` | ✅ Berhasil |
| 7 | Catat pembayaran & 1-click konfirmasi lunas di `/admin/pembayaran` | ✅ Berhasil |
| 8 | Validasi pencegahan tagihan ganda untuk penghuni pada periode yang sama | ✅ Berhasil |
| 9 | Riwayat pembayaran lengkap dengan fitur sortir, filter, dan ekspor CSV di `/admin/riwayat` | ✅ Berhasil |
| 10 | Konfigurasi jatuh tempo, nama kos, dan privasi masking di `/admin/pengaturan` | ✅ Berhasil |
| 11 | Build production (`npm run build`) berjalan bersih tanpa error | ✅ Berhasil |

---

## 📄 Lisensi
Hak Cipta &copy; 2026 KosTrack. Dibuat untuk pengelolaan rumah kos yang profesional dan terpercaya.

import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KosTrack - Sistem Monitoring Pembayaran Uang Kos',
  description: 'Aplikasi manajemen dan monitoring pembayaran uang kos modern, transparan, dan terpercaya.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-[#F8FAFC] text-[#1E293B] font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}

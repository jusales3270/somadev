import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AppShell from '@/components/app-shell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Soma Todo',
  description: 'Todo app — pixel perfection, performance e acessibilidade.',
  themeColor: '#0b0f19',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased`}>
      <body className="min-h-dvh bg-[#070A12] text-zinc-100 selection:bg-indigo-500/30 selection:text-zinc-50">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
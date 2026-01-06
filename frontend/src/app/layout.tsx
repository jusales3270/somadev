import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SomaDev | SomaVerso",
  description: "AI Powered Software Factory",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex`}>
        {/* Sidebar Fixa */}
        <Sidebar />

        {/* Conteúdo Principal Dinâmico */}
        <main className="flex-1 bg-zinc-950 text-white overflow-hidden">
          {children}
        </main>
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  );
}
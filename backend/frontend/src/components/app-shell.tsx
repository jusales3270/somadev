'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Github, ListTodo } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-fuchsia-600/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_0%,rgba(99,102,241,0.12),transparent_55%),radial-gradient(900px_circle_at_0%_70%,rgba(236,72,153,0.10),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070A12]/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-xl px-2 py-1 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
            aria-label="Ir para a página inicial"
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 transition group-hover:bg-white/10">
              <ListTodo className="h-5 w-5 text-indigo-200" />
              <span aria-hidden className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/10 opacity-0 blur-sm transition group-hover:opacity-100" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-zinc-50">Soma Todo</span>
              <span className="text-xs text-zinc-400">Pixel perfect • A11y • Fast</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
              aria-label="Abrir GitHub"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="relative border-t border-white/10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-6 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} SomaDev — Todo UI.</p>
          <p className="text-zinc-500">Construído com Next.js + Tailwind + Framer Motion.</p>
        </div>
      </footer>
    </div>
  );
}
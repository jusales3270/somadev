'use client';

import * as React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(' ');
}

export default function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition will-change-transform select-none ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-0 ' +
    'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';

  const variants: Record<Variant, string> = {
    primary:
      'border border-indigo-400/20 bg-gradient-to-b from-indigo-500/25 to-indigo-500/10 text-zinc-50 shadow-[0_10px_30px_-18px_rgba(99,102,241,0.9)] hover:from-indigo-500/35 hover:to-indigo-500/15 hover:border-indigo-300/30',
    secondary:
      'border border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10 hover:border-white/15',
    ghost: 'border border-transparent bg-transparent text-zinc-200 hover:bg-white/5',
    danger:
      'border border-rose-400/20 bg-gradient-to-b from-rose-500/20 to-rose-500/10 text-zinc-50 hover:from-rose-500/28 hover:to-rose-500/12 hover:border-rose-300/30',
  };

  const sizes: Record<Size, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  };

  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
'use client';

import * as React from 'react';

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(' ');
}

export default function Badge({
  className,
  tone = 'neutral',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'success' | 'warning' | 'info';
}) {
  const tones: Record<string, string> = {
    neutral: 'border-white/10 bg-white/5 text-zinc-200',
    success: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200',
    warning: 'border-amber-400/20 bg-amber-500/10 text-amber-200',
    info: 'border-indigo-400/20 bg-indigo-500/10 text-indigo-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
'use client';

import * as React from 'react';

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(' ');
}

export default function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-zinc-100 placeholder:text-zinc-500',
        'transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:border-indigo-300/30',
        'hover:border-white/15',
        className
      )}
      {...props}
    />
  );
}
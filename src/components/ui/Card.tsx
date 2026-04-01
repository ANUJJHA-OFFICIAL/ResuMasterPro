import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, variant = 'default', children, ...props }: React.ComponentPropsWithoutRef<'div'> & { variant?: 'default' | 'glass' | 'outline' }) {
  const variants = {
    default: 'bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800',
    glass: 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-2xl',
    outline: 'border-2 border-slate-100 dark:border-slate-800 bg-transparent',
  };

  return (
    <div
      className={cn('rounded-3xl p-6 transition-all', variants[variant as keyof typeof variants], className)}
      {...props}
    >
      {children}
    </div>
  );
}

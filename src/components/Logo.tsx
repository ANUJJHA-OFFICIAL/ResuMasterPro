import { FileText } from 'lucide-react';
import { cn } from '../lib/utils';

export function Logo({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={cn('flex items-center gap-2 font-bold tracking-tight text-slate-900 dark:text-white', className)}>
      <div className={cn('flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30', sizes[size])}>
        <FileText className={cn(size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-8 w-8')} />
      </div>
      <span className={cn(textSizes[size])}>
        ResuMaster<span className="text-blue-600">Pro</span>
      </span>
    </div>
  );
}

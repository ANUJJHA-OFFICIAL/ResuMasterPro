import React from 'react';
import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { Logo } from '../Logo';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  image?: string;
}

export function AuthLayout({ children, title, subtitle, image }: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={cn("flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300", theme === 'dark' ? 'dark' : '')}>
      {/* Theme Toggle (Floating) */}
      <div className="fixed right-6 top-6 z-50 flex items-center rounded-2xl bg-white/80 dark:bg-slate-900/80 p-1 shadow-xl backdrop-blur-xl border border-slate-100 dark:border-slate-800">
        <button
          onClick={() => theme !== 'light' && toggleTheme()}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300",
            theme === 'light' 
              ? "bg-white text-blue-600 shadow-sm" 
              : "text-slate-400 hover:text-slate-200"
          )}
          title="Light Mode"
        >
          <Sun className="h-4 w-4" />
        </button>
        <button
          onClick={() => theme !== 'dark' && toggleTheme()}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300",
            theme === 'dark' 
              ? "bg-slate-700 text-blue-400 shadow-sm" 
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
          title="Dark Mode"
        >
          <Moon className="h-4 w-4" />
        </button>
      </div>

      {/* Left Side: Branding & Illustration */}
      <div className="hidden w-1/2 flex-col justify-between bg-slate-900 dark:bg-slate-900 p-12 lg:flex border-r border-slate-800">
        <Logo className="text-white" size="lg" />
        
        <div className="space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold leading-tight text-white"
          >
            {title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400"
          >
            {subtitle}
          </motion.p>
        </div>

        <div className="relative h-64 w-full overflow-hidden rounded-3xl bg-blue-600/20 backdrop-blur-3xl">
          <img 
            src={image || "https://picsum.photos/seed/resume/800/600"} 
            alt="Resume Builder" 
            className="h-full w-full object-cover opacity-50 mix-blend-overlay"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
            <p className="text-lg font-medium text-white italic">
              "The best way to predict the future is to create it. Start by building your professional identity today."
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Forms */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden">
            <Logo size="md" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

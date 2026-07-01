'use client';

import Link from 'next/link';
import React, { ReactNode, useEffect, useState } from 'react';
import { cn } from '../utils';
import { Sparkles, CheckCircle2, TrendingUp, Users } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  description?: string;
  tabActive: 'login' | 'signup';
}

const curiosityTexts = [
  "Your tasks are watching you",
  "One login away from organized chaos.",
  "Productivity starts here.",
  "Track, collaborate, and conquer goals.",
];

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  description, 
  tabActive 
}) => {
  const [textIndex, setTextIndex] = useState(0);
  const [fadeState, setFadeState] = useState('animate-fade-in');

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState('opacity-0 transition-opacity duration-500');
      setTimeout(() => {
        setTextIndex((prev) => (prev + 1) % curiosityTexts.length);
        setFadeState('animate-fade-in');
      }, 500);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_30%)]" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="bg-linear-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-xl font-semibold tracking-[0.2em] text-transparent">
            Eye&apos;s on U
          </span>
        </div>

        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-300 backdrop-blur-sm">
            <Sparkles className="h-3 w-3 animate-pulse" />
            Organize & Optimize
          </div>

          <div className="flex min-h-22 items-center">
            <h2 className={cn('min-h-22 text-4xl font-semibold leading-tight tracking-tight text-white', fadeState)}>
              {curiosityTexts[textIndex]}
            </h2>
          </div>

          <p className="text-base leading-relaxed text-slate-400">
            A polished workspace for teams who value clarity, accountability, and momentum.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </div>
            <span className="text-2xl font-semibold tracking-tight text-white">10,240+</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">Total Tasks</span>
          </div>

          <div className="flex flex-col gap-1 border-x border-white/10 px-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-300">
              <Users className="h-3.5 w-3.5" />
              Active Teams
            </div>
            <span className="text-2xl font-semibold tracking-tight text-white">142</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">Daily Users</span>
          </div>

          <div className="flex flex-col gap-1 pl-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-300">
              <TrendingUp className="h-3.5 w-3.5" />
              Efficiency
            </div>
            <span className="text-2xl font-semibold tracking-tight text-white">98.4%</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">Velocity Rate</span>
          </div>
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center p-6 sm:p-12 lg:w-1/2">
        <div className="z-10 w-full max-w-md space-y-8">
          <div className="overflow-hidden rounded-[28px] border border-border/60 bg-card/80 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.4)] backdrop-blur-xl">
            <div className="space-y-6 p-6 sm:p-8">
              <div className="space-y-2 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground lg:hidden">Eye&apos;s on U</p>
                <h1 className="bg-linear-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
                  {title}
                </h1>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
                {description && <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground/80">{description}</p>}
              </div>

              <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border/60 bg-background/70 p-1">
                <Link href="/login" className={cn('rounded-xl py-2.5 text-center text-sm font-semibold transition-all', tabActive === 'login' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground')}>
                  Login
                </Link>
                <Link href="/signup" className={cn('rounded-xl py-2.5 text-center text-sm font-semibold transition-all', tabActive === 'signup' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground')}>
                  Signup
                </Link>
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

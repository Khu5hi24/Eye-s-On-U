'use client';

import Link from 'next/link';
import React, { ReactNode, useEffect, useState } from 'react';
import { cn } from '../utils';
import { Shield, Sparkles, CheckCircle2, TrendingUp, Users } from 'lucide-react';

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
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
      {/* Left side: Premium branding, stats & curiosity content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 p-12 flex-col justify-between">
        {/* Top brand info */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white text-slate-950 flex items-center justify-center shadow-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Eye&apos;s on U
          </span>
        </div>

        {/* Middle: Rotating Curiosity Content */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
            <Sparkles className="h-3 w-3 animate-pulse" />
            Organize & Optimize
          </div>
          
          <div className="h-28 flex items-center">
            <h2 className={cn("text-4xl font-extrabold tracking-tight text-white leading-tight min-h-[5.5rem]", fadeState)}>
              {curiosityTexts[textIndex]}
            </h2>
          </div>

          <p className="text-slate-400 text-base leading-relaxed">
            A production-ready workspace for teams who value tracking, clarity, and accountability. Build velocity, remove blockers, and achieve outcomes seamlessly.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 border border-white/10 bg-white/5 backdrop-blur-md rounded-lg p-5 shadow-2xl">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">10,240+</span>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Tasks</span>
          </div>

          <div className="flex flex-col gap-1 border-x border-white/10 px-4">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
              <Users className="h-3.5 w-3.5" />
              Active Teams
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">142</span>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Daily Users</span>
          </div>

          <div className="flex flex-col gap-1 pl-2">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              Efficiency
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">98.4%</span>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Velocity Rate</span>
          </div>
        </div>
      </div>

      {/* Right side: Signup / Login form layout */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8 z-10">
          <div className="glass border border-border/50 rounded-lg overflow-hidden shadow-xl transition-all duration-300 bg-card/90 backdrop-blur-lg">
            <div className="p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-bold lg:hidden">
                  Eye&apos;s on U
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text">
                  {title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {subtitle}
                </p>
                {description && (
                  <p className="text-xs text-muted-foreground/80 mt-1 max-w-sm mx-auto">
                    {description}
                  </p>
                )}
              </div>

              {/* Navigation Tabs */}
              <div className="grid grid-cols-2 rounded-2xl border border-border/60 overflow-hidden bg-background/50 p-1">
                <Link
                  href="/login"
                  className={cn(
                    'py-2.5 text-sm font-semibold text-center transition-all rounded-xl',
                    tabActive === 'login'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  )}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className={cn(
                    'py-2.5 text-sm font-semibold text-center transition-all rounded-xl',
                    tabActive === 'signup'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  )}
                >
                  Signup
                </Link>
              </div>

              {/* Form Content */}
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

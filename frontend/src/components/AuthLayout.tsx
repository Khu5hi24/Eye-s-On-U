'use client';

import Link from 'next/link';
import React, { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  description?: string;
  tabActive: 'login' | 'signup';
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  description,
  tabActive
}) => {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-transparent">
      {/* Calm Luxury subtle ambient gradient background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-background via-secondary/40 to-muted/30" />

      {/* Ambient luxury blurs */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-accent/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-accent/5 blur-[120px]" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[500px] px-6">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Centered Premium Logo */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Sparkles className="h-5 w-5 text-accent animate-pulse-soft" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">
              EYE&apos;S ON U
            </span>
          </div>

          {/* Heading Section */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground font-sans">
                {subtitle}
              </p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground/80 font-sans mt-0.5">
                {description}
              </p>
            )}
            {!subtitle && (
              <p className="text-xs text-muted-foreground font-sans">
                {tabActive === 'login' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-accent font-semibold hover:underline">
                      Sign up
                    </Link>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <Link href="/login" className="text-accent font-semibold hover:underline">
                      Log in
                    </Link>
                  </>
                )}
              </p>
            )}
          </div>

          {/* Form Card Content */}
          <div className="w-full bg-card border border-border/80 rounded-md p-6 sm:p-10 shadow-xs text-left transition-all duration-300">
            {children}
          </div>

          {/* Footer Assistance */}
          <span className="text-xs text-foreground/60 hover:text-foreground tracking-wide cursor-pointer transition duration-150">
            Need help? Contact Support
          </span>
        </div>
      </div>
    </div>
  );
};

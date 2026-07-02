'use client';

import React from 'react';
import { ToastContainer } from '@/components/Toast';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#64748b12_1px,transparent_1px),linear-gradient(to_bottom,#64748b12_1px,transparent_1px)] bg-[size:18px_28px] pointer-events-none" />

      {/* Children Content */}
      <div className="h-full w-full flex items-center justify-center">
        {children}
      </div>

      <ToastContainer />
    </div>
  );
}

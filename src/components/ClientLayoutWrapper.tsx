'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { cn } from '../utils';
import { ToastContainer } from './Toast';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useAuth } from '../hooks/useAuth';

const authPaths = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/verify-otp'];

export const ClientLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { loading, restoreSession } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useKeyboardShortcuts();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const isAuthRoute = pathname ? authPaths.some((route) => pathname.startsWith(route)) : false;

  if (loading && !isAuthRoute) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090b11] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-muted-foreground animate-pulse-soft">Restoring session...</p>
        </div>
      </div>
    );
  }

  if (isAuthRoute) {
    return (
      <>
        {children}
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
      <div className="flex flex-1 pt-16">
        <Sidebar
          isOpenOnMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main
          className={cn(
            'flex-1 p-4 sm:p-6 md:p-8 transition-all duration-300 overflow-x-hidden min-h-[calc(100vh-4rem)]',
            sidebarCollapsed ? 'md:pl-20' : 'md:pl-68'
          )}
        >
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
        <ToastContainer />
      </div>
    </div>
  );
};

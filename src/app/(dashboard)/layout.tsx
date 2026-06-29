'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { cn } from '@/utils';
import { ToastContainer } from '@/components/Toast';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAuth } from '@/hooks/useAuth';
import { useTaskStore } from '@/store/taskStore';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, restoreSession, isAuthenticated } = useAuth();
  const loadDashboardData = useTaskStore((state) => state.loadDashboardData);
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useKeyboardShortcuts();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, loadDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090b11] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-muted-foreground animate-pulse">Summoning productivity...</p>
        </div>
      </div>
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
            sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
          )}
        >
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
          <footer className="mt-10 border-t border-border/60 pt-6 text-xs text-muted-foreground">
            <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>Eye&apos;s On U Task Manager</p>
              <div className="flex flex-wrap gap-4">
                <a href="mailto:support@eyesonu.com" className="hover:text-foreground">support@eyesonu.com</a>
                <a href="https://www.linkedin.com" className="hover:text-foreground">LinkedIn</a>
                <a href="https://x.com" className="hover:text-foreground">X</a>
              </div>
            </div>
          </footer>
        </main>
        <ToastContainer />
      </div>
    </div>
  );
}

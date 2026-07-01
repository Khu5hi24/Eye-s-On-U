'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Users,
  UserCog,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../utils';
import { useAuthStore } from '../store/auth.store';

interface SidebarProps {
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
  sidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenOnMobile = false,
  onCloseMobile,
  sidebarCollapsed = false,
  onToggleCollapse,
}) => {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    ...(isAdmin
      ? [
          { name: 'Add Task', href: '/tasks/new', icon: Plus },
          { name: 'Team Members', href: '/team', icon: Users },
          { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        ]
      : []),
  ];

  const isActive = (href: string) => {
    if (href === '/tasks') {
      return pathname === '/tasks' || (pathname.startsWith('/tasks/') && !pathname.startsWith('/tasks/new'));
    }
    return pathname === href;
  };

  const SidebarContent = (
    <div className="flex h-full flex-col rounded-[28px] border border-border/70 bg-card/80 p-3 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-border/60 bg-background/50 px-3 py-3 md:hidden">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Workspace</p>
          <p className="text-sm font-semibold text-foreground">Navigation</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onCloseMobile} className="h-8 w-8 rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 flex-1 space-y-1.5 px-1 py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                'group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10'
                  : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
              )}
            >
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl transition-all', active ? 'bg-white/20' : 'bg-background/70 group-hover:bg-background')}>
                <Icon className={cn('h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-105', active ? 'text-current' : 'text-muted-foreground')} />
              </div>

              <span className={cn('transition-opacity duration-300', sidebarCollapsed ? 'md:opacity-0 md:w-0 md:overflow-hidden' : 'opacity-100')}>
                {item.name}
              </span>

              {sidebarCollapsed && (
                <div className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 md:block">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="hidden justify-center border-t border-border/60 p-3 md:flex">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
          onClick={onToggleCollapse}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className={cn('fixed bottom-0 left-0 top-16 z-30 hidden transition-all duration-300 md:block', sidebarCollapsed ? 'w-16' : 'w-52')}>
        {SidebarContent}
      </aside>

      <div className={cn('fixed inset-0 z-50 transition-opacity duration-300 md:hidden', isOpenOnMobile ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCloseMobile} />
        <div className={cn('absolute left-0 top-0 h-full w-52 max-w-[80vw] transition-transform duration-300 ease-out', isOpenOnMobile ? 'translate-x-0' : '-translate-x-full')}>
          {SidebarContent}
        </div>
      </div>
    </>
  );
};

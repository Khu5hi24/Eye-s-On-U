'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell,
  User, 
  Settings, 
  LogOut, 
  Sparkles, 
  CheckCheck, 
  Menu
} from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/auth.store';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator 
} from './ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from './ui/dialog';
import { cn } from '../utils';

export const Navbar: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {

  const { 
    profile: taskProfile, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    clearNotifications,
  } = useTaskStore();
  const { user, logout, updateProfile } = useAuthStore();
  const router = useRouter();

  const profile = user ?? taskProfile ?? {
    name: 'Guest User',
    email: '',
    role: 'Employee',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getInitials = (userName: string) => {
    if (!userName) return 'U';
    return userName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-4 shadow-xs sm:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-md md:hidden" onClick={onMenuClick} aria-label="Open sidebar">
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/dashboard" className="group flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-accent animate-pulse-soft" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-wide text-foreground font-heading">
                EYE&apos;S ON U
              </span>
              <span className="hidden text-[9px] font-semibold uppercase tracking-[0.25em] text-muted-foreground sm:block">
                {profile.role}
              </span>
            </div>
          </Link>
        </div>

        <div className="hidden items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-1.5 shadow-xs md:flex">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-accent">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">Focus on what matters</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/tasks/new">
            <Button variant="outline" className="hidden h-9 rounded-md px-3.5 text-xs font-semibold sm:flex">
              <span className="mr-1 text-sm font-normal">+</span>
              Quick Add
            </Button>
          </Link>
          <ThemeToggle />
          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <div className="flex items-center justify-between p-3 border-b border-border/30">
                <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-[11px] font-medium flex items-center gap-1 text-primary hover:bg-secondary"
                    onClick={markAllNotificationsAsRead}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Mark all read</span>
                  </Button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 stroke-1 opacity-40 mb-2" />
                    <p className="text-xs">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <DropdownMenuItem
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={cn(
                        "flex flex-col items-start gap-1 p-3 rounded-lg border-b border-border/10 cursor-pointer transition-all",
                        !notif.read ? "bg-primary/5 hover:bg-primary/10 border-l-2 border-l-primary" : "hover:bg-secondary/40"
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                          notif.type === 'assigned' && "bg-blue-500/10 text-blue-500",
                          notif.type === 'deadline' && "bg-orange-500/10 text-orange-500",
                          notif.type === 'completed' && "bg-green-500/10 text-green-500",
                          notif.type === 'alert' && "bg-red-500/10 text-red-500"
                        )}>
                          {notif.type}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-foreground line-clamp-1">{notif.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{notif.message}</p>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-2 border-t border-border/30 bg-secondary/10 flex justify-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-full text-xs text-muted-foreground hover:text-foreground font-medium"
                    onClick={clearNotifications}
                  >
                    Clear all notifications
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 w-9 rounded-full overflow-hidden border border-border/80 cursor-pointer shadow-xs hover:scale-105 transition-transform outline-hidden flex items-center justify-center bg-gradient-to-tr from-[#b89772]/20 to-[#c5a880]/30 text-accent font-bold text-xs font-heading">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={profile.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{getInitials(profile.name)}</span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal py-2.5 px-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-foreground leading-none">{profile.name}</p>
                  <p className="text-xs text-muted-foreground leading-none mt-1">{profile.email}</p>
                  <p className="text-[10px] text-primary/80 font-bold uppercase tracking-wider mt-1.5">{profile.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => router.push('/profile')}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={async () => {
                  await logout();
                  router.push('/login');
                }}
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </nav>
    </>
  );
};

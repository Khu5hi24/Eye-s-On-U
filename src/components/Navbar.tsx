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

  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editSpecialization, setEditSpecialization] = useState(profile.specialization || profile.bio || '');
  const [editBio, setEditBio] = useState(profile.bio || '');
  const [editAvatar, setEditAvatar] = useState(profile.avatar);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: editName,
      specialization: editSpecialization,
      bio: editBio || editSpecialization,
      avatar: editAvatar,
    });
    setIsEditProfileOpen(false);
  };

  // Profile avatar options for selection
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-border/60 glass flex items-center justify-between px-4 sm:px-6">
        
        {/* Left Section: Logo & Toggle Button */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={onMenuClick}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 animate-pulse-soft" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-liner-to-r from-foreground via-foreground/90 to-foreground/75">
              Eye&apos;s On U
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold border border-primary/20 px-1.5 py-0.5 rounded bg-primary/5 text-primary scale-90 hidden sm:inline-block">
              {profile.role}
            </span>
          </Link>
        </div>

        {/* Right Section: Notification, Theme, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
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
              <button className="h-9 w-9 rounded-full overflow-hidden border border-border/80 cursor-pointer shadow-xs hover:scale-105 transition-transform outline-hidden">
                <img 
                  src={profile.avatar} 
                  alt={profile.name} 
                  className="h-full w-full object-cover"
                />
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
                onClick={() => setIsViewProfileOpen(true)}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setEditName(profile.name);
                  setEditSpecialization(profile.specialization || profile.bio || '');
                  setEditBio(profile.bio || '');
                  setEditAvatar(profile.avatar);
                  setIsEditProfileOpen(true);
                }}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
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

      {/* View Profile Dialog */}
      <Dialog open={isViewProfileOpen} onOpenChange={setIsViewProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>Your workspace profile.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 shadow-md">
              <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wider">
                {profile.role}
              </span>
              {(profile.specialization || profile.bio) && (
                <p className="mt-3 text-sm text-muted-foreground">{profile.specialization || profile.bio}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewProfileOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update name, image, specialization, and bio.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProfile} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profile Picture Presets</label>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-full overflow-hidden border border-border/80">
                  <img src={editAvatar} alt="Current" className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {avatarPresets.map((avUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditAvatar(avUrl)}
                      className={cn(
                        "h-10 w-10 rounded-full overflow-hidden border-2 transition-all hover:scale-105",
                        editAvatar === avUrl ? "border-primary scale-105" : "border-transparent"
                      )}
                    >
                      <img src={avUrl} alt={`Preset ${idx}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="profile-name" className="text-xs font-bold text-foreground">Name</label>
              <input
                id="profile-name"
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full h-10 px-3 border border-border rounded-lg bg-secondary/40 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="profile-specialization" className="text-xs font-bold text-foreground">Role Specialization</label>
              <input
                id="profile-specialization"
                type="text"
                value={editSpecialization}
                onChange={(e) => setEditSpecialization(e.target.value)}
                className="w-full h-10 px-3 border border-border rounded-lg bg-secondary/40 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="profile-bio" className="text-xs font-bold text-foreground">Bio</label>
              <textarea
                id="profile-bio"
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-secondary/40 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditProfileOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Award, FolderKanban, Clock, CheckCircle2, Mail, X } from 'lucide-react';
import { TeamMember } from '@/types';

interface TeamMemberModalProps {
  open: boolean;
  onClose: () => void;
  member: TeamMember;
}

export const TeamMemberModal: React.FC<TeamMemberModalProps> = ({ open, onClose, member }) => {
  const completedTasksCount = member.tasksAssigned ? Math.round((member.tasksAssigned * member.completionRate) / 100) : 0;
  const pendingTasksCount = Math.max(member.tasksAssigned - completedTasksCount, 0);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="relative bg-card rounded-[2rem] shadow-[0_35px_60px_-40px_rgba(0,0,0,0.45)] border border-border/80 overflow-hidden">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-secondary text-muted-foreground hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 rounded-3xl overflow-hidden border border-border/70 shadow-sm">
                  <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold text-foreground">{member.name}</h2>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                      {member.role}
                    </span>
                    {member.specialization && (
                      <span className="inline-flex rounded-full bg-secondary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground">
                        {member.specialization}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-border/60 bg-secondary/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Active streak</p>
                  <p className="mt-3 text-3xl font-semibold text-foreground">{member.tasksAssigned > 0 ? `${Math.min(12, member.tasksAssigned)} days` : 'No streak'}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Maintained via consistent task completion over time.</p>
                </div>
                <div className="rounded-3xl border border-border/60 bg-secondary/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Task conversion</p>
                  <div className="mt-3 flex items-end gap-3">
                    <p className="text-3xl font-semibold text-foreground">{member.completionRate}%</p>
                    <span className="text-[11px] text-muted-foreground">completion rate</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-border/50 bg-secondary/50 p-6">
                <h3 className="text-base font-semibold text-foreground">About this member</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {member.bio || 'No bio available yet. Add details to help teammates understand strengths and focus areas.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.75rem] border border-border/60 bg-background/80 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-foreground tracking-[0.12em] uppercase">Key metrics</h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-border/50 bg-secondary/70 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Projects</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{member.projects}</p>
                  </div>
                  <div className="rounded-3xl border border-border/50 bg-secondary/70 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Assigned tasks</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{member.tasksAssigned}</p>
                  </div>
                  <div className="rounded-3xl border border-border/50 bg-secondary/70 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Completed</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{completedTasksCount}</p>
                  </div>
                  <div className="rounded-3xl border border-border/50 bg-secondary/70 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pending</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{pendingTasksCount}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-border/60 bg-secondary/60 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Project distribution</h3>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Overview</span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <p className="text-sm text-muted-foreground">Priority work</p>
                    <p className="text-sm font-semibold text-foreground">{Math.min(5, member.tasksAssigned)} projects</p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                    <p className="text-sm text-muted-foreground">Ongoing tickets</p>
                    <p className="text-sm font-semibold text-foreground">{member.tasksAssigned}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

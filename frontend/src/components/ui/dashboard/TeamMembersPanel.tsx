'use client';

import React from 'react';
import Link from 'next/link';
import { useTeamStore } from '../../../store/teamStore';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Users, ArrowRight, CheckCircle2, FolderKanban } from 'lucide-react';
import { cn } from '../../../utils';
import type { TeamMember } from '../../../types';

export const TeamMembersPanel: React.FC = () => {
  const { teamMembers } = useTeamStore();

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
    <Card className="glass h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Team Members
          </span>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">
            {teamMembers.length} Members
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {teamMembers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No team members found.
          </div>
        ) : teamMembers.map((member) => (
          <Link
            key={member.id}
            href={`/team/${member.id}`}
            className="group flex w-full items-center gap-3 p-2.5 rounded-xl text-left hover:bg-secondary/40 transition-all duration-200"
          >
            <div className="relative flex items-center justify-center">
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="h-10 w-10 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#b89772]/20 to-[#c5a880]/30 border border-accent/20 text-accent flex items-center justify-center text-xs font-bold font-heading shadow-inner">
                  {getInitials(member.name)}
                </div>
              )}
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card',
                  member.status === 'active' && 'bg-emerald-500',
                  member.status === 'busy' && 'bg-amber-500',
                  member.status === 'offline' && 'bg-slate-400'
                )}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {member.name}
                </p>
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-muted-foreground truncate">{member.role}</p>

              <div className="flex items-center gap-3 mt-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {member.completionRate}%
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                  <FolderKanban className="h-3 w-3 text-blue-500" />
                  {member.projects}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                  <Users className="h-3 w-3 text-amber-500" />
                  {member.tasksAssigned} tasks
                </span>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};

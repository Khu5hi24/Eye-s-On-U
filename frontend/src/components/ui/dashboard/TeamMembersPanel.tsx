'use client';

import React from 'react';
import Link from 'next/link';
import { useTeamStore } from '../../../store/teamStore';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Users, FolderKanban, UserCheck, ArrowRight, CircleDot } from 'lucide-react';
import { cn } from '../../../utils';

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
    <Card className="glass w-full border border-border/80">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold tracking-tight text-foreground flex items-center justify-between">
          <span className="flex items-center gap-2 font-heading">
            <Users className="h-5 w-5 text-primary" />
            Active Team Members
          </span>
          <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-lg font-bold uppercase tracking-wider">
            {teamMembers.length} Members
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teamMembers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No team members found.
          </div>
        ) : (
          <div className={cn(
            "grid gap-4",
            teamMembers.length === 1 && "grid-cols-1 max-w-sm",
            teamMembers.length === 2 && "grid-cols-1 sm:grid-cols-2 max-w-2xl",
            teamMembers.length === 3 && "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl",
            teamMembers.length === 4 && "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 max-w-6xl",
            teamMembers.length >= 5 && "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
          )}>
            {teamMembers.map((member) => {
              const roleColorClass = (() => {
                const role = member.role.toLowerCase();
                if (role.includes('lead') || role.includes('manager') || role.includes('admin')) {
                  return 'bg-amber-500/15 text-amber-900 border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
                }
                if (role.includes('frontend') || role.includes('engineer')) {
                  return 'bg-blue-500/15 text-blue-900 border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
                }
                if (role.includes('design') || role.includes('ui')) {
                  return 'bg-purple-500/15 text-purple-900 border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';
                }
                return 'bg-slate-500/15 text-slate-800 border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20';
              })();

              return (
                <Link
                  key={member.id}
                  href={`/team/${member.id}`}
                  className="group flex flex-col justify-between p-4 border border-border/70 hover:border-border hover:bg-secondary/15 bg-card/50 rounded-2xl text-left transition-all duration-350"
                >
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="relative">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-11 w-11 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-accent/20 to-accent/30 border border-accent/20 text-accent flex items-center justify-center text-xs font-bold font-heading shadow-inner">
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
                    
                    <span className={cn("inline-flex items-center px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border rounded-md shrink-0 max-w-[80px] truncate", roleColorClass)}>
                      {member.role}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {member.name}
                    </h4>
                    <p className="text-[9px] text-foreground/60 dark:text-foreground/80 flex items-center gap-1 uppercase tracking-wider font-bold">
                      <CircleDot className={cn("h-2 w-2",
                        member.status === 'active' && 'text-emerald-500',
                        member.status === 'busy' && 'text-amber-500',
                        member.status === 'offline' && 'text-slate-400'
                      )} />
                      {member.status}
                    </p>
                  </div>

                  {/* Completion Rate Bar */}
                  <div className="space-y-1 mt-3.5">
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className="text-foreground/60 dark:text-foreground/70">Workload Rate</span>
                      <span className="text-foreground">{member.completionRate || 0}%</span>
                    </div>
                    <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${member.completionRate || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats & Hover Indicators */}
                  <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-border/40 text-[10px] text-foreground/70 dark:text-foreground/80 font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5" title="Projects">
                        <FolderKanban className="h-3 w-3 text-blue-500" />
                        {member.projects || 0}
                      </span>
                      <span className="flex items-center gap-0.5" title="Tasks">
                        <UserCheck className="h-3 w-3 text-primary" />
                        {member.tasksAssigned || 0}
                      </span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

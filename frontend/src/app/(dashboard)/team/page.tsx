'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeamStore } from '@/store/teamStore';
import {
  Users,
  Search,
  Mail,
  CheckCircle2,
  FolderKanban,
  UserCheck,
  ArrowUpRight,
  CircleDot,
  Filter
} from 'lucide-react';
import { cn } from '@/utils';

export default function TeamPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { teamMembers } = useTeamStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

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

  // Filter members based on search query & status selection
  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || member.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">Team Directory</h1>
          <p className="mt-1 text-xs text-muted-foreground font-sans">
            Monitor workloads, performance metrics, and role assignments for your active staff.
          </p>
        </div>
        <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-wider rounded-lg">
          <Users className="h-3.5 w-3.5" />
          {teamMembers.length} Members Total
        </span>
      </div>

      {/* Control Actions (Search & Filters) */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, role or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 border border-border rounded-xl bg-card/60 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-3 border border-border rounded-xl bg-card text-sm cursor-pointer w-full md:w-44 focus:outline-hidden focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
          </select>
        </div>

      </div>

      {/* Team Cards Grid */}
      {filteredMembers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card/40">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 stroke-1" />
          <p className="text-sm font-semibold text-foreground">No team members match your criteria</p>
          <p className="text-xs text-muted-foreground mt-1">Try resetting the filters or modifying your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
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
              <Card 
                key={member.id} 
                className="group border border-border/80 bg-card hover:bg-secondary/10 hover:border-border transition-all duration-300 relative flex flex-col justify-between"
              >
                <CardContent className="p-6 flex flex-col justify-between h-full space-y-5">
                  
                  {/* Top: Avatar, Status & Role info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="relative shrink-0">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-14 w-14 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-accent/20 to-accent/30 border border-accent/20 text-accent flex items-center justify-center text-sm font-bold font-heading shadow-inner">
                          {getInitials(member.name)}
                        </div>
                      )}
                      <span
                        className={cn(
                          'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card',
                          member.status === 'active' && 'bg-emerald-500',
                          member.status === 'busy' && 'bg-amber-500',
                          member.status === 'offline' && 'bg-slate-400'
                        )}
                      />
                    </div>

                    <div className="flex-1 text-right">
                      <span className={cn("inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border rounded-md", roleColorClass)}>
                        {member.role}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center justify-end gap-1 font-semibold uppercase tracking-wider">
                        <CircleDot className={cn("h-2.5 w-2.5", 
                          member.status === 'active' && 'text-emerald-500',
                          member.status === 'busy' && 'text-amber-500',
                          member.status === 'offline' && 'text-slate-400'
                        )} />
                        {member.status}
                      </p>
                    </div>
                  </div>

                  {/* Name and Contacts */}
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {member.name}
                    </h2>
                    {member.email ? (
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span>{member.email}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground/50 italic">No email linked</p>
                    )}
                  </div>

                  {/* Progress: Completion Rate bar */}
                  <div className="space-y-1.5 pt-2 border-t border-border/40">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-muted-foreground">Task Completion Rate</span>
                      <span className="text-foreground">{member.completionRate || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                        style={{ width: `${member.completionRate || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom metrics & View Profile Link */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/40 gap-2">
                    
                    {/* Small stats list */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground" title="Assigned Projects">
                        <FolderKanban className="h-3.5 w-3.5 text-blue-500" />
                        <span>{member.projects || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground" title="Assigned Tasks">
                        <UserCheck className="h-3.5 w-3.5 text-primary" />
                        <span>{member.tasksAssigned || 0}</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={`/team/${member.id}`}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold text-primary hover:text-primary/80 border border-border/80 hover:border-primary/30 hover:bg-primary/5 rounded-lg transition-all"
                    >
                      <span>View details</span>
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>

                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

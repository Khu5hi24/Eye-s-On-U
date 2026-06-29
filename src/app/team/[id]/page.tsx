'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTeamStore } from '@/store/teamStore';
import { useTaskStore } from '@/store/taskStore';
import { StatusBadge, PriorityBadge } from '@/components/TaskTable';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Users, 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  Calendar,
  AlertTriangle,
  Mail,
  Award
} from 'lucide-react';
import { cn, formatDate } from '@/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TeamMemberDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { teamMembers } = useTeamStore();
  const { tasks } = useTaskStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const member = teamMembers.find((m) => m.id === id);

  if (!mounted) return null;

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Users className="h-12 w-12 text-rose-500 stroke-1" />
        <h2 className="text-xl font-bold">Team Member Not Found</h2>
        <p className="text-sm text-muted-foreground">The member ID you requested does not exist or has left the team.</p>
        <Link href="/">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Filter tasks assigned to this member
  const memberTasks = tasks.filter((t) => t.assignedTo === member.id);
  const completedTasksCount = memberTasks.filter((t) => t.status === 'completed').length;
  const pendingTasksCount = memberTasks.filter((t) => t.status === 'pending').length;
  const activeTasksCount = memberTasks.filter((t) => t.status === 'in-progress').length;
  const overdueTasksCount = memberTasks.filter((t) => t.status === 'overdue').length;

  // Calculate actual completion rate from tasks if tasks exist
  const computedCompletionRate = memberTasks.length > 0 
    ? Math.round((completedTasksCount / memberTasks.length) * 100)
    : member.completionRate; // fallback to mock rate

  // Sort upcoming deadlines (tasks not completed, sorted by due date)
  const upcomingDeadlines = memberTasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Mock project names based on active projects count
  const mockProjects = Array.from({ length: member.projects }, (_, i) => {
    const names = [
      'Phoenix Migration Board',
      'Quantum Analytics API',
      'Apollo Admin Shell',
      'Aegis Mobile Client',
      'Atlas Integration Pipelines'
    ];
    return names[i % names.length];
  });

  return (
    <div className="space-y-6">
      
      {/* Header Back Button */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Member Profile Summary & Stats */}
        <div className="space-y-6">
          <Card className="glass">
            <CardContent className="p-6 text-center space-y-4">
              
              {/* Profile Avatar with status bubble */}
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full rounded-full object-cover border-2 border-primary/10 shadow-md"
                />
                <span
                  className={cn(
                    'absolute bottom-0.5 right-0.5 h-4.5 w-4.5 rounded-full border-3 border-card',
                    member.status === 'active' && 'bg-emerald-500',
                    member.status === 'busy' && 'bg-amber-500',
                    member.status === 'offline' && 'bg-slate-400'
                  )}
                />
              </div>

              {/* Identity details */}
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">{member.name}</h2>
                <p className="text-sm text-muted-foreground">{member.role}</p>
                <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground mt-2">
                  <Mail className="h-3 w-3" />
                  <span>{member.name.toLowerCase().replace(' ', '.')}@eyesonu.com</span>
                </div>
              </div>

              <div className="border-t border-border/40 pt-4 flex justify-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {member.status}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  ID: #{member.id}
                </span>
              </div>

            </CardContent>
          </Card>

          {/* Performance indexes */}
          <Card className="glass">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2.5 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-emerald-500" />
                Performance Metrics
              </h3>
              
              <div className="space-y-4">
                
                {/* Completion rate progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-muted-foreground">Task Completion Rate</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{computedCompletionRate}%</span>
                  </div>
                  <div className="w-full bg-secondary/60 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${computedCompletionRate}%` }}
                    />
                  </div>
                </div>

                {/* Task ratio breakdowns */}
                <div className="grid grid-cols-2 gap-3 text-center pt-2">
                  <div className="p-2 border border-border/40 bg-secondary/15 rounded-xl">
                    <p className="text-lg font-bold text-foreground">{memberTasks.length}</p>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Total Tasks</p>
                  </div>
                  <div className="p-2 border border-border/40 bg-secondary/15 rounded-xl">
                    <p className="text-lg font-bold text-foreground">{completedTasksCount}</p>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Completed</p>
                  </div>
                  <div className="p-2 border border-border/40 bg-secondary/15 rounded-xl">
                    <p className="text-lg font-bold text-foreground">{activeTasksCount}</p>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Active</p>
                  </div>
                  <div className="p-2 border border-border/40 bg-secondary/15 rounded-xl">
                    <p className={cn("text-lg font-bold", overdueTasksCount > 0 ? "text-rose-500" : "text-foreground")}>
                      {overdueTasksCount}
                    </p>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Overdue</p>
                  </div>
                </div>

              </div>

            </CardContent>
          </Card>

        </div>

        {/* Right Side: Assigned Projects, Deadlines, Task List */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Projects and Deadlines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Project List */}
            <Card className="glass">
              <CardContent className="p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2.5 flex items-center gap-1.5">
                  <FolderKanban className="h-4 w-4 text-blue-500" />
                  Assigned Projects ({member.projects})
                </h3>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {mockProjects.map((project, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-secondary/25 hover:bg-secondary/40 rounded-lg text-xs font-semibold text-foreground transition-colors cursor-pointer">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>{project}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="glass">
              <CardContent className="p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2.5 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Upcoming Deadlines ({upcomingDeadlines.length})
                </h3>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {upcomingDeadlines.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic py-3 text-center">
                      No active task deadlines
                    </div>
                  ) : (
                    upcomingDeadlines.map((task) => (
                      <Link 
                        key={task.id} 
                        href={`/tasks/${task.id}`} 
                        className="flex items-center justify-between p-2 bg-secondary/25 hover:bg-secondary/40 rounded-lg text-xs transition-all group"
                      >
                        <span className="font-semibold text-foreground truncate max-w-[120px] group-hover:text-primary">
                          {task.title}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1",
                          task.status === 'overdue' ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-600"
                        )}>
                          {task.status === 'overdue' && <AlertTriangle className="h-3 w-3" />}
                          {task.dueDate.split('-').slice(1).join('/')}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Detailed Task List Table */}
          <Card className="glass">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-3">
                Assigned Task List
              </h3>
              
              {memberTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No tasks assigned to {member.name} yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/40">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-secondary/30 font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40">
                      <tr>
                        <th className="p-3">Task Title</th>
                        <th className="p-3">Priority</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {memberTasks.map((t) => (
                        <tr key={t.id} className="hover:bg-secondary/15 transition-colors group">
                          <td className="p-3 font-semibold">
                            <Link href={`/tasks/${t.id}`} className="hover:underline group-hover:text-primary transition-colors">
                              {t.title}
                            </Link>
                          </td>
                          <td className="p-3"><PriorityBadge priority={t.priority} /></td>
                          <td className="p-3"><StatusBadge status={t.status} /></td>
                          <td className="p-3 font-semibold text-muted-foreground">{formatDate(t.dueDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}

// Support React Card fallback
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn("border border-border/60 bg-card rounded-2xl shadow-xs", className)}>
    {children}
  </div>
);

const CardContent: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn("p-6", className)}>{children}</div>
);

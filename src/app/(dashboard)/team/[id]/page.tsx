'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTaskStore } from '@/store/taskStore';
import { useTeamStore } from '@/store/teamStore';
import { dashboardService } from '@/services/dashboard.service';
import { useToastStore } from '@/store/toastStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge, PriorityBadge } from '@/components/TaskTable';
import { formatDate, cn } from '@/utils';
import { ArrowLeft, Award, Calendar, FolderKanban, Mail, Users } from 'lucide-react';
import type { TeamMember, Task } from '@/types';

const specializationOptions = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Mobile Developer',
  'DevOps Engineer',
  'QA Engineer',
  'Software Architect',
  'Systems Engineer',
  'Data Engineer',
  'UI/UX Developer',
  'Security Engineer',
  'Cloud Engineer',
  'Product Engineer',
  'Machine Learning Engineer',
  'Technical Lead',
];

export default function TeamMemberDetailPage(props: any) {
  const { params } = props as { params: Promise<{ id: string }> };
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { teamMembers, updateMember } = useTeamStore();
  const { tasks, updateTask } = useTaskStore();
  const [mounted, setMounted] = useState(false);
  const [memberRole, setMemberRole] = useState('employee');
  const [memberSpecialization, setMemberSpecialization] = useState('');
  const { showToast } = useToastStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const member = teamMembers.find((m) => m.id === id);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (member) {
      setMemberRole(member.role);
      setMemberSpecialization(member.specialization || '');
    }
  }, [member]);

  const memberTasks = tasks.filter((task) => task.assignedTo === member?.id);
  const completedTasksCount = memberTasks.filter((task) => task.status === 'completed').length;
  const activeTasksCount = memberTasks.filter((task) => task.status === 'in-progress').length;
  const overdueTasksCount = memberTasks.filter((task) => task.status === 'overdue').length;
  const completionRate = memberTasks.length > 0 ? Math.round((completedTasksCount / memberTasks.length) * 100) : member?.completionRate || 0;

  const upcomingDeadlines = memberTasks
    .filter((task) => task.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const mockProjects = Array.from({ length: member?.projects || 0 }, (_, index) => {
    const names = [
      'Phoenix Migration Board',
      'Quantum Analytics API',
      'Apollo Admin Shell',
      'Aegis Mobile Client',
      'Atlas Integration Pipelines',
    ];
    return names[index % names.length];
  });

  const handleTaskUpdate = async (taskId: string, field: 'dueDate' | 'assignedTo', value: string) => {
    await updateTask(taskId, { [field]: value } as Partial<Task>);
  };

  const handleSaveRole = async () => {
    if (!member || !isAdmin) return;

    try {
      await dashboardService.updateTeamMember(member.id, {
        role: memberRole,
        specialization: memberSpecialization,
      });
      updateMember(member.id, { role: memberRole, specialization: memberSpecialization });
      showToast('Member updated successfully.', 'success');
    } catch (error) {
      const message = (error as any)?.response?.data?.message || 'Unable to update member.';
      showToast(message, 'error');
    }
  };

  if (!mounted || !isAuthenticated) return null;

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Users className="h-12 w-12 text-rose-500 stroke-1" />
        <h2 className="text-xl font-bold">Team Member Not Found</h2>
        <p className="text-sm text-muted-foreground">The member ID you requested does not exist or has left the team.</p>
        <Link href="/team">
          <Button>Back to team</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Manage {member.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit this member's role, assignment, and task due dates from one place.</p>
        </div>
        <Link href="/team" className="text-sm font-semibold text-primary hover:text-primary/80">
          Back to team
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card className="glass">
            <CardContent className="p-6 text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-primary/10 shadow-md">
                <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                <span
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 h-4.5 w-4.5 rounded-full border-2 border-card',
                    member.status === 'active' ? 'bg-emerald-500' : member.status === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
                  )}
                />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-foreground">{member.name}</h2>
                <p className="text-sm text-muted-foreground">{member.email || `${member.name.toLowerCase().replace(/\s+/g, '.')}@eyesonu.com`}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-foreground">
                    {member.role}
                  </span>
                  {member.specialization ? (
                    <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                      {member.specialization}
                    </span>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Key metrics</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-border/50 bg-secondary/70 p-4 text-center">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Projects</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">{member.projects}</p>
                </div>
                <div className="rounded-3xl border border-border/50 bg-secondary/70 p-4 text-center">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Assigned tasks</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">{member.tasksAssigned}</p>
                </div>
                <div className="rounded-3xl border border-border/50 bg-secondary/70 p-4 text-center">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Completion rate</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">{completionRate}%</p>
                </div>
                <div className="rounded-3xl border border-border/50 bg-secondary/70 p-4 text-center">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Overdue</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">{overdueTasksCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="glass">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Role assignment</h3>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] font-semibold text-primary">Admin only</span>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Member role</label>
                  <select
                    value={memberRole}
                    onChange={(event) => setMemberRole(event.target.value)}
                    className="w-full h-11 px-4 border border-border rounded-xl bg-secondary/30 text-sm"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Role specialization</label>
                  <select
                    value={memberSpecialization}
                    onChange={(event) => setMemberSpecialization(event.target.value)}
                    className="w-full h-11 px-4 border border-border rounded-xl bg-secondary/30 text-sm"
                  >
                    <option value="">Select specialization</option>
                    {specializationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <Button variant="default" onClick={handleSaveRole} className="w-full h-11">
                  Save Role
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground border-b border-border/40 pb-2.5">
                  <FolderKanban className="h-4 w-4 text-blue-500" />
                  Assigned Projects
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {mockProjects.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No project cards available.</p>
                  ) : mockProjects.map((project, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/25 hover:bg-secondary/40 text-xs font-semibold text-foreground transition-colors">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      {project}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground border-b border-border/40 pb-2.5">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  Upcoming Deadlines
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {upcomingDeadlines.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No upcoming deadlines.</p>
                  ) : upcomingDeadlines.map((task) => (
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-secondary/25 hover:bg-secondary/40 text-xs transition-colors"
                    >
                      <span className="truncate font-semibold text-foreground">{task.title}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                        {formatDate(task.dueDate)}
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Assigned tasks</h2>
                  <p className="text-sm text-muted-foreground">Edit this member's due dates and assignments quickly.</p>
                </div>
                {isAdmin && <span className="rounded-full bg-primary/10 px-3 py-2 text-xs uppercase tracking-[0.16em] font-semibold text-primary">Admin</span>}
              </div>

              {memberTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">No tasks assigned to this member yet.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/40">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-secondary/30 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border/40">
                      <tr>
                        <th className="p-3">Task</th>
                        <th className="p-3">Priority</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Due Date</th>
                        <th className="p-3">Assign</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {memberTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-secondary/15 transition-colors">
                          <td className="p-3 font-semibold text-foreground">
                            <Link href={`/tasks/${task.id}`} className="hover:underline">{task.title}</Link>
                          </td>
                          <td className="p-3"><PriorityBadge priority={task.priority} /></td>
                          <td className="p-3"><StatusBadge status={task.status} /></td>
                          <td className="p-3">
                            {isAdmin ? (
                              <input
                                type="date"
                                value={task.dueDate}
                                onChange={(event) => handleTaskUpdate(task.id, 'dueDate', event.target.value)}
                                className="w-full h-10 px-3 border border-border rounded-xl bg-secondary/30 text-sm"
                              />
                            ) : (
                              <span className="text-muted-foreground">{formatDate(task.dueDate)}</span>
                            )}
                          </td>
                          <td className="p-3">
                            {isAdmin ? (
                              <select
                                value={task.assignedTo}
                                onChange={(event) => handleTaskUpdate(task.id, 'assignedTo', event.target.value)}
                                className="w-full h-10 px-3 border border-border rounded-xl bg-secondary/30 text-sm"
                              >
                                {teamMembers.map((option) => (
                                  <option key={option.id} value={option.id}>
                                    {option.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-muted-foreground">
                                {teamMembers.find((entry) => entry.id === task.assignedTo)?.name || 'Unassigned'}
                              </span>
                            )}
                          </td>
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

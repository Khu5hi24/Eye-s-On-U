'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Edit3, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { Task, TeamMember } from '../types';
import { useTaskStore } from '../store/taskStore';
import { useTeamStore } from '../store/teamStore';
import { useAuthStore } from '../store/auth.store';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { formatDate } from '../utils';
import { cn } from '../utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog';

// 1. Reusable Status Badge Component
export const StatusBadge: React.FC<{ status: Task['status'] }> = ({ status }) => {
  const styles = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/30',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/30',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30',
    overdue: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800/30',
  };

  const labels = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',
    overdue: 'Overdue',
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
      styles[status]
    )}>
      <span className="h-1.5 w-1.5 rounded-full mr-1.5 bg-current" />
      {labels[status]}
    </span>
  );
};

// 2. Reusable Priority Badge Component
export const PriorityBadge: React.FC<{ priority: Task['priority'] }> = ({ priority }) => {
  const styles = {
    low: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-800/30',
    medium: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/30',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/30',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/30 font-bold',
  };

  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
      styles[priority]
    )}>
      {labels[priority]}
    </span>
  );
};

interface TaskTableProps {
  tasks: Task[];
  limit?: number;
  onEdit?: (task: Task) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  limit,
  onEdit
}) => {
  const { deleteTask } = useTaskStore();
  const { teamMembers } = useTeamStore();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const isAdmin = user?.role === 'admin';

  const handleEditClick = (task: Task) => {
    if (onEdit) {
      onEdit(task);
    } else {
      router.push(`/tasks/${task.id}?edit=true`);
    }
  };

  // Filter limit if specified
  const displayedTasks = limit ? tasks.slice(0, limit) : tasks;

  // Find team member details
  const getMemberDetails = (memberId: string): TeamMember | undefined => {
    return teamMembers.find((m: TeamMember) => m.id === memberId);
  };

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

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteTask(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="w-full overflow-x-auto rounded-xl border border-border/60 bg-card">
        <table className="w-full border-collapse text-left text-sm text-foreground">

          <thead className="bg-secondary/40 text-xs font-extrabold uppercase tracking-wider text-foreground border-b border-border/40">
            <tr>
              <th scope="col" className="px-4 py-2.5 w-24">Task ID</th>
              <th scope="col" className="px-4 py-2.5 w-52">Task Name</th>
              <th scope="col" className="px-4 py-2.5 w-44">Assigned To</th>
              <th scope="col" className="px-4 py-2.5 w-28">Priority</th>
              <th scope="col" className="px-4 py-2.5 w-32">Status</th>
              <th scope="col" className="px-4 py-2.5 w-32">Due Date</th>
              <th scope="col" className="px-4 py-2.5 w-24 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/30">
            {displayedTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="h-8 w-8 stroke-1 opacity-50" />
                    <p className="font-semibold text-sm">No tasks found</p>
                    <p className="text-xs">Adjust your search or filter configuration.</p>
                  </div>
                </td>
              </tr>
            ) : (
              displayedTasks.map((task) => {
                const assignee = getMemberDetails(task.assignedTo);

                return (
                  <tr key={task.id} className="hover:bg-secondary/20 transition-colors group">

                    {/* Task ID */}
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {task.id ? `TSK-${task.id.slice(-6).toUpperCase()}` : 'TSK-XXXX'}
                      </span>
                    </td>

                    {/* Task Title */}
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {task.title}
                        </span>
                        <span className="text-[11px] text-foreground/75 font-semibold truncate block max-w-[150px] mt-0.5" title={task.description}>
                          {task.description}
                        </span>
                      </div>
                    </td>

                    {/* Assignee */}
                    <td className="px-4 py-2.5">
                      {assignee ? (
                        <Link
                          href={`/team/${assignee.id}`}
                          className="flex items-center gap-2 group/member hover:underline"
                        >
                          {assignee.avatar ? (
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              className="h-6 w-6 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-[#b89772]/20 to-[#c5a880]/30 border border-accent/20 text-accent flex items-center justify-center text-[10px] font-bold font-heading shadow-inner">
                              {getInitials(assignee.name)}
                            </div>
                          )}
                          <span className="font-medium text-xs text-foreground group-hover/member:text-primary">
                            {assignee.name}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unassigned</span>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-2.5">
                      <PriorityBadge priority={task.priority} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-2.5">
                      <StatusBadge status={task.status} />
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-2.5 text-xs font-bold text-foreground/80">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-blue-500" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/tasks/${task.id}`} passHref>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-sky-500 hover:text-sky-600 hover:bg-sky-500/10">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                            onClick={() => handleEditClick(task)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                            onClick={() => setDeleteId(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>

      {/* Delete Confirmation Warning Modal */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>Confirm Task Deletion</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
};

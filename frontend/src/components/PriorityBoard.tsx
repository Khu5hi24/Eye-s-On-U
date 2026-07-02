'use client';

import React from 'react';
import { useTaskStore } from '../store/taskStore';
import { useTeamStore } from '../store/teamStore';
import { useAuthStore } from '../store/auth.store';
import { Task, TaskPriority } from '../types';
import { StatusBadge } from './TaskTable';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '../utils';

export const PriorityBoard: React.FC = () => {
  const { filteredTasks, updateTask } = useTaskStore();
  const { teamMembers } = useTeamStore();
  const isAdmin = useAuthStore((state) => state.user?.role === 'admin');

  const priorities: TaskPriority[] = ['low', 'medium', 'high', 'critical'];

  const getMemberAvatar = (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    return member ? member.avatar : null;
  };

  const getMemberName = (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    return member ? member.name : 'Unassigned';
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetPriority: TaskPriority) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = filteredTasks.find((t) => t.id === taskId);
    if (task && isAdmin) {
      if (task.priority === targetPriority) return; // No change

      updateTask(taskId, { priority: targetPriority });
    }
  };

  // Filter tasks for each priority
  const tasksByPriority = (priority: TaskPriority) => {
    return filteredTasks.filter((t) => t.priority === priority);
  };

  const columnHeaders = {
    low: { label: 'Low Priority', color: 'bg-slate-500/10 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-800' },
    medium: { label: 'Medium Priority', color: 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
    high: { label: 'High Priority', color: 'bg-orange-500/10 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
    critical: { label: 'Critical Priority', color: 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
  };

  return (
    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 xl:grid-cols-4">
      {priorities.map((priority) => {
        const laneTasks = tasksByPriority(priority);
        const header = columnHeaders[priority];

        return (
          <div
            key={priority}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, priority)}
            className="glass flex min-h-125 flex-col rounded-3xl border border-border/60 transition-all"
          >
            {/* Header */}
            <div className={cn(
              "p-4 border-b border-border/40 font-bold text-xs uppercase tracking-wider flex items-center justify-between rounded-t-2xl",
              header.color
            )}>
              <span>{header.label}</span>
              <span className="rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-bold">
                {laneTasks.length}
              </span>
            </div>

            {/* Cards Lane */}
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              {laneTasks.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-[20px] border-2 border-dashed border-border/40 p-4 text-center text-xs italic text-muted-foreground">
                  Drag cards here to set priority to {priority}
                </div>
              ) : (
                laneTasks.map((task) => {
                  const avatar = getMemberAvatar(task.assignedTo);

                  return (
                    <div
                      key={task.id}
                      draggable={isAdmin}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="group cursor-grab rounded-[20px] border border-border/70 bg-card/80 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md active:cursor-grabbing"
                    >
                      <div className="flex flex-col gap-3">
                        {/* Title */}
                        <div className="space-y-1">
                          <Link href={`/tasks/${task.id}`} className="font-semibold text-xs leading-relaxed text-foreground group-hover:text-primary transition-colors hover:underline line-clamp-2">
                            {task.title}
                          </Link>
                          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        </div>

                        {/* Badges & Meta */}
                        <div className="flex items-center justify-between gap-2 border-t border-border/30 pt-2.5">
                          <StatusBadge status={task.status} />

                          <div className="flex items-center gap-2">
                            {/* Date */}
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {task.dueDate.split('-').slice(1).join('/')}
                            </span>

                            {/* Assignee Avatar */}
                            {avatar ? (
                              <img
                                src={avatar}
                                alt={getMemberName(task.assignedTo)}
                                title={getMemberName(task.assignedTo)}
                                className="h-5 w-5 rounded-full object-cover border border-border"
                              />
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center">
                                <User className="h-3 w-3 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
};

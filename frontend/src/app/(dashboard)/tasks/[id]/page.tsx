'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTaskStore } from '@/store/taskStore';
import { useTeamStore } from '@/store/teamStore';
import { StatusBadge, PriorityBadge } from '@/components/TaskTable';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  User,
  Paperclip,
  History,
  Clock,
  Edit3,
  Trash2,
  AlertCircle,
  Upload,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { CalendarPicker } from '@/components/ui/CalendarPicker';
import { cn, formatDate } from '@/utils';
import { TaskStatus, TaskPriority, TeamMember } from '@/types';
import { useToastStore } from '@/store/toastStore';

export default function TaskDetailPage(props: any) {
  const { params } = props as { params: Promise<{ id: string }> };
  const router = useRouter();
  const { id } = use(params);

  const { tasks, updateTask, deleteTask, activityLogs } = useTaskStore();
  const { teamMembers } = useTeamStore();

  const [mounted, setMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const searchParams = useSearchParams();
  const editParam = searchParams.get('edit');

  // Edit form states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<TaskStatus>('pending');
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
  const [editAssignee, setEditAssignee] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Attachments State
  interface Attachment {
    name: string;
    size: string;
    type: string;
    base64: string;
  }
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`attachments_${id}`);
      if (stored) {
        try {
          setAttachments(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse attachments', e);
        }
      }
    }
  }, [id]);

  const saveAttachments = (newFiles: Attachment[]) => {
    setAttachments(newFiles);
    localStorage.setItem(`attachments_${id}`, JSON.stringify(newFiles));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments = [...attachments];
    const { showToast } = useToastStore.getState();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Limit check: 5MB
      if (file.size > 5 * 1024 * 1024) {
        showToast(`File "${file.name}" is too large. Please select a file smaller than 5 MB.`, 'error');
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const formattedSize = (() => {
          if (file.size === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB'];
          const idx = Math.floor(Math.log(file.size) / Math.log(k));
          return parseFloat((file.size / Math.pow(k, idx)).toFixed(1)) + ' ' + sizes[idx];
        })();

        // Prevent duplicate file name upload in same session
        if (newAttachments.some(a => a.name === file.name)) {
          return;
        }

        newAttachments.push({
          name: file.name,
          size: formattedSize,
          type: file.name.split('.').pop() || 'unknown',
          base64
        });

        saveAttachments([...newAttachments]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAttachment = (nameToRemove: string) => {
    const updated = attachments.filter(a => a.name !== nameToRemove);
    saveAttachments(updated);
  };

  const handleDownloadAttachment = (file: Attachment) => {
    const link = document.createElement('a');
    link.href = file.base64;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const task = tasks.find((t) => t.id === id);

  useEffect(() => {
    if (editParam === 'true' && task) {
      setIsEditing(true);
    }
  }, [editParam, task]);

  // Set initial edit state when task is found
  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description);
      setEditStatus(task.status);
      setEditPriority(task.priority);
      setEditAssignee(task.assignedTo);
      setEditDueDate(task.dueDate);
    }
  }, [task]);

  if (!mounted) return null;

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 stroke-1" />
        <h2 className="text-xl font-bold">Task Not Found</h2>
        <p className="text-sm text-muted-foreground">The task ID you requested does not exist or has been deleted.</p>
        <Link href="/tasks">
          <Button>Back to Tasks</Button>
        </Link>
      </div>
    );
  }

  const assignee = teamMembers.find((m) => m.id === task.assignedTo);
  const taskLogs = activityLogs.filter((log) => log.taskId === task.id);

  // Calculate days remaining or overdue status
  const calculateDeadline = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} day(s) overdue`, isOverdue: true };
    }
    if (diffDays === 0) {
      return { text: 'Due today', isOverdue: false, isUrgent: true };
    }
    return { text: `${diffDays} day(s) left`, isOverdue: false };
  };

  const deadlineInfo = calculateDeadline();

  // Mock Attachments
  const mockAttachments: Array<{ name: string; size: string; type: string }> = [];

  const handleSaveEdit = () => {
    updateTask(task.id, {
      title: editTitle,
      description: editDescription,
      status: editStatus,
      priority: editPriority,
      assignedTo: editAssignee,
      dueDate: editDueDate,
    });
    setIsEditing(false);
    router.replace(`/tasks/${task.id}`);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    router.push('/tasks');
  };

  return (
    <div className="space-y-6">

      {/* Back button & Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/tasks" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Task Manager
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5 h-9" onClick={() => setIsEditing(true)}>
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Button>
          <Button variant="destructive" size="sm" className="flex items-center gap-1.5 h-9" onClick={() => setIsDeleting(true)}>
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left Col: Task Main Details */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="glass">
            <CardContent className="p-6 sm:p-8 space-y-6">

              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                  deadlineInfo.isOverdue
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    : "bg-secondary text-muted-foreground border-border/40"
                )}>
                  <Clock className="h-3.5 w-3.5" />
                  {deadlineInfo.text}
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {task.title}
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  Created on {formatDate(task.createdAt)} • Last updated on {formatDate(task.updatedAt)}
                </p>
              </div>

              <div className="border-t border-border/40 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Description</h3>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {task.description || "No description provided for this task."}
                </p>
              </div>

              {/* Attachments Section */}
              <div className="border-t border-border/40 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Paperclip className="h-4 w-4" />
                  Attachments ({attachments.length})
                </h3>
                {attachments.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No files attached to this task.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachments.map((file, idx) => {
                      const isImg = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(file.type.toLowerCase());
                      return (
                        <div
                          key={idx}
                          className="p-3 border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors rounded-xl flex items-center justify-between cursor-pointer group"
                          onClick={() => handleDownloadAttachment(file)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {isImg ? (
                              <img
                                src={file.base64}
                                alt={file.name}
                                className="h-9 w-9 rounded-lg object-cover border border-border shrink-0"
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center border border-border shrink-0 text-[10px] font-bold text-muted-foreground uppercase">
                                {file.type.substring(0, 3)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">{file.name}</p>
                              <p className="text-[10px] text-muted-foreground">{file.size}</p>
                            </div>
                          </div>
                          <span className="text-[10px] bg-secondary px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            Download
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Activity Logs Timeline */}
          <Card className="glass">
            <CardContent className="p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-1.5 border-b border-border/40 pb-3">
                <History className="h-4 w-4" />
                Task Activity Timeline ({taskLogs.length})
              </h3>

              <div className="relative border-l border-border pl-6 ml-3 space-y-6">
                {taskLogs.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic py-2 pl-2">
                    No activity logs recorded for this task yet.
                  </div>
                ) : (
                  taskLogs.map((log) => (
                    <div key={log.id} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-9 top-0.5 h-5.5 w-5.5 rounded-full border border-border bg-card flex items-center justify-center group-hover:border-primary transition-colors">
                        <History className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-xs font-semibold text-foreground">
                            {log.action}
                          </p>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          By <span className="font-semibold">{log.user}</span>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Col: Assignee details & Info cards */}
        <div className="space-y-6">

          {/* Assignee Card */}
          <Card className="glass">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2.5">
                Assignee
              </h3>

              {assignee ? (
                <Link
                  href={`/team/${assignee.id}`}
                  className="flex items-center gap-3.5 group hover:bg-secondary/20 p-2 rounded-xl transition-colors text-left"
                >
                  <div className="relative">
                    {assignee.avatar ? (
                      <img
                        src={assignee.avatar}
                        alt={assignee.name}
                        className="h-12 w-12 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-accent/20 to-accent/30 border border-accent/20 text-accent flex items-center justify-center text-sm font-bold font-heading shadow-inner">
                        {assignee.name?.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'U'}
                      </div>
                    )}
                    <span className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card",
                      assignee.status === 'active' && 'bg-emerald-500',
                      assignee.status === 'busy' && 'bg-amber-500',
                      assignee.status === 'offline' && 'bg-slate-400'
                    )} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors hover:underline leading-tight">
                      {assignee.name}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-normal mt-0.5">{assignee.role}</p>
                    <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {assignee.status}
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-3 p-4 border border-dashed border-border rounded-xl">
                  <User className="h-6 w-6 text-muted-foreground stroke-1" />
                  <span className="text-xs text-muted-foreground italic">No assignee designated</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Target Metadata details */}
          <Card className="glass">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2.5">
                Schedule Details
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Due Date</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(task.dueDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Category</span>
                  <span className="font-semibold text-foreground capitalize">{task.status}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Priority Level</span>
                  <span className="font-semibold text-foreground capitalize">{task.priority}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Edit Dialog Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Task Details</DialogTitle>
            <DialogDescription>Change information relating to this task.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full h-10 px-3 border border-border rounded-lg bg-secondary/40 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-secondary/40 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                  className="w-full h-10 px-3 border border-border rounded-lg bg-secondary/40 text-sm cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                  className="w-full h-10 px-3 border border-border rounded-lg bg-secondary/40 text-sm cursor-pointer"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Assignee & Due Date Picker */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Assignee</label>
                <select
                  value={editAssignee}
                  onChange={(e) => setEditAssignee(e.target.value)}
                  className="w-full h-10 px-3 border border-border rounded-lg bg-secondary/40 text-sm cursor-pointer"
                >
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-foreground">Due Date</label>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full h-10 px-3 border border-border rounded-lg bg-secondary/40 text-sm flex items-center justify-between text-left hover:bg-secondary/50 focus:outline-hidden transition-all"
                  >
                    <span>{editDueDate}</span>
                  </button>
                  {showDatePicker && (
                    <div className="absolute right-0 bottom-12 z-50 shadow-2xl">
                      <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                      <div className="relative z-50">
                        <CalendarPicker
                          selectedDate={editDueDate}
                          onChange={(date) => {
                            setEditDueDate(date);
                            setShowDatePicker(false);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* File Attachments */}
            <div className="space-y-2 border-t border-border/30 pt-4">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5" />
                <span>Task Attachments (Max 5 MB per file)</span>
              </label>
              
              <div className="flex items-center gap-2">
                <label className="flex items-center justify-center gap-2 px-3 py-2 border border-border border-dashed hover:border-solid hover:bg-secondary/40 rounded-lg cursor-pointer transition-all text-xs font-semibold text-muted-foreground hover:text-foreground">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Choose Files</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto mt-2 pr-1">
                  {attachments.map((file, idx) => {
                    const isImg = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(file.type.toLowerCase());
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/50 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          {isImg ? (
                            <img
                              src={file.base64}
                              alt={file.name}
                              className="h-7 w-7 rounded object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="h-7 w-7 rounded bg-secondary flex items-center justify-center border border-border shrink-0 text-[8px] font-bold text-muted-foreground uppercase">
                              {file.type.substring(0, 3)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-foreground font-semibold">{file.name}</p>
                            <p className="text-[9px] text-muted-foreground">{file.size}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(file.name)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/30">
              <Button variant="outline" onClick={() => { setIsEditing(false); router.replace(`/tasks/${task.id}`); }}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>

          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
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
            <Button variant="outline" onClick={() => setIsDeleting(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// Support React Card fallback since simple import is used
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

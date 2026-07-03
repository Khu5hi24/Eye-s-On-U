'use client';

import React, { useEffect, useState } from 'react';
import { CalendarPicker } from './ui/CalendarPicker';
import { useTeamStore } from '../store/teamStore';
import { Task, TaskPriority, TaskStatus } from '../types';
import { Button } from './ui/button';
import { Calendar, X, Paperclip } from 'lucide-react';
import { cn } from '../utils';

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (
    data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
    file?: { name: string; size: string; type: string; base64: string } | null
  ) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Task'
}) => {
  const { teamMembers } = useTeamStore();

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || 'pending');
  const [priority, setPriority] = useState<TaskPriority>(initialData?.priority || 'medium');
  const [assignedTo, setAssignedTo] = useState(initialData?.assignedTo || '');

  // Default due date to today
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate || new Date().toISOString().split('T')[0]
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // File attachment states
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [attachedBase64, setAttachedBase64] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Enforce 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds the 5MB limit. Please upload a smaller file.');
      return;
    }

    setAttachedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAttachedBase64(base64);
      if (file.type.startsWith('image/')) {
        setFilePreview(base64);
      } else {
        setFilePreview(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
    setFilePreview(null);
    setFileError(null);
    setAttachedBase64(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignedTo) return;

    const filePayload = attachedFile && attachedBase64 ? {
      name: attachedFile.name,
      size: (() => {
        if (attachedFile.size === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const idx = Math.floor(Math.log(attachedFile.size) / Math.log(k));
        return parseFloat((attachedFile.size / Math.pow(k, idx)).toFixed(1)) + ' ' + sizes[idx];
      })(),
      type: attachedFile.name.split('.').pop() || 'unknown',
      base64: attachedBase64
    } : null;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignedTo,
      dueDate,
    }, filePayload);
  };

  useEffect(() => {
    if (!assignedTo && teamMembers.length > 0) {
      setAssignedTo(teamMembers[0].id);
    }
  }, [assignedTo, teamMembers]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-card border border-border/60 rounded-2xl glass shadow-md">

      {/* Title */}
      <div className="space-y-1.5">
        <label htmlFor="task-title" className="text-xs font-extrabold uppercase tracking-wider text-foreground/90">
          Task Title
        </label>
        <input
          id="task-title"
          type="text"
          required
          placeholder="e.g. Migrate database schemas"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full h-11 px-4 border border-border rounded-xl bg-secondary/30 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="task-desc" className="text-xs font-extrabold uppercase tracking-wider text-foreground/90">
          Description
        </label>
        <textarea
          id="task-desc"
          rows={4}
          placeholder="Add detailed task notes and goals..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 border border-border rounded-xl bg-secondary/30 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none animate-none"
        />
      </div>

      {/* File Attachment */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold uppercase tracking-wider text-foreground/90 flex items-center gap-1">
          Attachment <span className="text-[10px] text-foreground/80 font-bold normal-case">(optional, max 5MB)</span>
        </label>
        
        <div className="flex flex-col gap-3">
          {!attachedFile ? (
            <div className="relative border-2 border-dashed border-border/85 hover:border-accent/40 rounded-xl p-4 flex flex-col items-center justify-center bg-secondary/10 transition-colors group cursor-pointer">
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <span className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors flex items-center gap-1.5">
                <Paperclip className="h-4 w-4" />
                Attach a file
              </span>
              <p className="text-[10px] text-foreground/75 font-semibold mt-1">Images, PDFs, or documents up to 5MB</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-secondary/25 border border-border/60 rounded-xl relative group">
              {filePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={filePreview}
                  alt="preview"
                  className="h-12 w-12 rounded-lg object-cover border border-border/60"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">
                  {attachedFile.name.split('.').pop()?.toUpperCase() || 'FILE'}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{attachedFile.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {(attachedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={removeAttachedFile}
                className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {fileError && (
            <p className="text-[11px] font-semibold text-rose-500">{fileError}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Status */}
        <div className="space-y-1.5">
          <label htmlFor="task-status" className="text-xs font-extrabold uppercase tracking-wider text-foreground/90">
            Status
          </label>
          <select
            id="task-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full h-11 px-4 border border-border rounded-xl bg-secondary/30 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <label htmlFor="task-priority" className="text-xs font-extrabold uppercase tracking-wider text-foreground/90">
            Priority
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full h-11 px-4 border border-border rounded-xl bg-secondary/30 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Assignee */}
        <div className="space-y-1.5">
          <label htmlFor="task-assignee" className="text-xs font-extrabold uppercase tracking-wider text-foreground/90">
            Assign Team Member
          </label>
          <select
            id="task-assignee"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full h-11 px-4 border border-border rounded-xl bg-secondary/30 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.role})
              </option>
            ))}
          </select>
          {teamMembers.length === 0 && (
            <p className="text-xs text-destructive">No team members available.</p>
          )}
        </div>

        {/* Due Date Picker */}
        <div className="space-y-1.5 relative">
          <label className="text-xs font-extrabold uppercase tracking-wider text-foreground/90">
            Due Date
          </label>
          <div>
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full h-11 px-4 border border-border rounded-xl bg-secondary/30 text-sm flex items-center justify-between hover:bg-secondary/50 focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all text-left"
            >
              <span className="font-bold text-foreground">{dueDate}</span>
              <Calendar className="h-4 w-4 text-blue-500" />
            </button>

            {showDatePicker && (
              <div className="absolute right-0 md:left-0 z-50 mt-2 shadow-2xl animate-fade-in">
                <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                <div className="relative z-50">
                  <CalendarPicker
                    selectedDate={dueDate}
                    onChange={(date) => {
                      setDueDate(date);
                      setShowDatePicker(false);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
        <Button type="button" variant="outline" onClick={onCancel} className="h-10 px-5">
          Cancel
        </Button>
        <Button type="submit" className="h-10 px-5" disabled={!assignedTo}>
          {submitLabel}
        </Button>
      </div>

    </form>
  );
};

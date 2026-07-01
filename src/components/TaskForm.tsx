'use client';

import React, { useEffect, useState } from 'react';
import { CalendarPicker } from './ui/CalendarPicker';
import { useTeamStore } from '../store/teamStore';
import { Task, TaskPriority, TaskStatus } from '../types';
import { Button } from './ui/button';
import { Calendar } from 'lucide-react';
import { cn } from '../utils';

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignedTo) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignedTo,
      dueDate,
    });
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
        <label htmlFor="task-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
        <label htmlFor="task-desc" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Description
        </label>
        <textarea
          id="task-desc"
          rows={4}
          placeholder="Add detailed task notes and goals..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 border border-border rounded-xl bg-secondary/30 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Status */}
        <div className="space-y-1.5">
          <label htmlFor="task-status" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
          <label htmlFor="task-priority" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
          <label htmlFor="task-assignee" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Due Date
          </label>
          <div>
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full h-11 px-4 border border-border rounded-xl bg-secondary/30 text-sm flex items-center justify-between hover:bg-secondary/50 focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all text-left"
            >
              <span className="font-medium text-foreground">{dueDate}</span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
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

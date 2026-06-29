'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, FileDown, Kanban } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useTeamStore } from '../store/teamStore';
import { useToastStore } from '../store/toastStore';
import { useDebounce } from '../hooks/useDebounce';
import { TaskTable, StatusBadge, PriorityBadge } from './TaskTable';
import { PriorityBoard } from './PriorityBoard';
import { Task, TaskStatus, TaskPriority } from '../types';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { CalendarPicker } from './ui/CalendarPicker';
import { cn, exportToCSV } from '../utils';

export const TasksList: React.FC = () => {
  const { filteredTasks, tasks, filters, setFilters, searchTasks, sortTasks, resetFilters, updateTask } = useTaskStore();
  const { teamMembers } = useTeamStore();
  const { showToast } = useToastStore();

  const [searchInput, setSearchInput] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'table' | 'board'>('table');

  // Form states for editing
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<TaskStatus>('pending');
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
  const [editAssignee, setEditAssignee] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Search Debouncing
  const debouncedSearch = useDebounce(searchInput, 300);
  useEffect(() => {
    searchTasks(debouncedSearch);
  }, [debouncedSearch, searchTasks]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  // Instead of an effect setting state on filter change, derived state can handle pagination boundary
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  
  // Update state only if we're out of bounds and we actually have pages
  useEffect(() => {
    if (currentPage !== validPage && totalPages > 0) {
      setCurrentPage(validPage);
    }
  }, [validPage, currentPage, totalPages]);

  const paginatedTasks = filteredTasks.slice(
    (validPage - 1) * itemsPerPage,
    validPage * itemsPerPage
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSort = (field: typeof filters.sortBy) => {
    const currentSort = filters.sortBy;
    const currentOrder = filters.sortOrder;
    const newOrder = currentSort === field && currentOrder === 'asc' ? 'desc' : 'asc';
    sortTasks(field, newOrder);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
    setEditPriority(task.priority);
    setEditAssignee(task.assignedTo);
    setEditDueDate(task.dueDate);
  };

  const handleSaveEdit = () => {
    if (!editingTask) return;
    updateTask(editingTask.id, {
      title: editTitle,
      description: editDescription,
      status: editStatus,
      priority: editPriority,
      assignedTo: editAssignee,
      dueDate: editDueDate,
    });
    setEditingTask(null);
  };

  const handleCSVExport = () => {
    if (filteredTasks.length === 0) {
      showToast('No tasks available to export', 'warning');
      return;
    }
    // Transform task data to make it readable in Excel/CSV
    const exportData = filteredTasks.map((t) => {
      const assigneeName = teamMembers.find((m) => m.id === t.assignedTo)?.name || 'Unassigned';
      return {
        ID: t.id,
        Title: t.title,
        Description: t.description,
        Status: t.status.toUpperCase(),
        Priority: t.priority.toUpperCase(),
        Assignee: assigneeName,
        'Due Date': t.dueDate,
        'Created At': t.createdAt.split('T')[0],
      };
    });
    exportToCSV(exportData, 'eyes_on_u_tasks.csv');
    showToast('Tasks exported to CSV successfully!', 'success');
  };

  const statusOptions: { value: TaskStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' },
  ];

  const priorityOptions: { value: TaskPriority | 'all'; label: string }[] = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  return (
    <div className="space-y-6">
      
      {/* View Tabs */}
      <div className="flex border-b border-border/40 pb-px">
        <button
          onClick={() => setActiveTab('table')}
          className={cn(
            "px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer",
            activeTab === 'table'
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Table View
        </button>
        <button
          onClick={() => setActiveTab('board')}
          className={cn(
            "px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5",
            activeTab === 'board'
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Kanban className="h-3.5 w-3.5" />
          Priority Board (Drag & Drop)
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchInput}
            onChange={handleSearch}
            className="w-full h-10 pl-9 pr-4 border border-border rounded-lg bg-card text-sm focus:outline-hidden focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filters.status || 'all'}
            onChange={(e) => setFilters({ status: e.target.value as TaskStatus | 'all' })}
            className="h-10 px-3 border border-border rounded-lg bg-card text-sm focus:outline-hidden focus:ring-2 focus:ring-ring cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={filters.priority || 'all'}
            onChange={(e) => setFilters({ priority: e.target.value as TaskPriority | 'all' })}
            className="h-10 px-3 border border-border rounded-lg bg-card text-sm focus:outline-hidden focus:ring-2 focus:ring-ring cursor-pointer"
          >
            {priorityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSort('dueDate')}
            className={cn(
              'h-10 w-10',
              filters.sortBy === 'dueDate' && 'bg-secondary'
            )}
            title="Sort by due date"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={handleCSVExport}
            className="h-10 flex items-center gap-1.5 text-xs font-semibold px-3"
            title="Export tasks to CSV"
          >
            <FileDown className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>

          {(filters.status || filters.priority || filters.searchQuery || filters.sortBy) && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-10 text-xs font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-500/10">
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Active filter pills */}
      {(filters.status || filters.priority || filters.searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
          {filters.status && filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded-full">
              <StatusBadge status={filters.status} />
            </span>
          )}
          {filters.priority && filters.priority !== 'all' && (
            <span className="inline-flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded-full">
              <PriorityBadge priority={filters.priority} />
            </span>
          )}
          {filters.searchQuery && (
            <span className="text-xs bg-secondary text-foreground px-2 py-1 rounded-full font-medium">
              Search: &quot;{filters.searchQuery}&quot;
            </span>
          )}
        </div>
      )}

      {/* Main View Display */}
      {activeTab === 'table' ? (
        <div className="space-y-4">
          <div className="text-xs text-muted-foreground font-medium">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>

          {/* Table */}
          <TaskTable tasks={paginatedTasks} onEdit={openEdit} />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border/30">
              <span className="text-xs text-muted-foreground">
                Page <span className="font-bold text-foreground">{currentPage}</span> of <span className="font-bold text-foreground">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 flex items-center gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Kanban Drag and Drop board view */
        <PriorityBoard />
      )}

      {/* Edit Dialog */}
      <Dialog open={editingTask !== null} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Task Details</DialogTitle>
            <DialogDescription>Update task fields below to keep team members aligned.</DialogDescription>
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

            {/* Grid options */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                  className="w-full h-10 px-3 border border-border rounded-lg bg-secondary/40 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring cursor-pointer"
                >
                  {statusOptions.filter(o => o.value !== 'all').map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                  className="w-full h-10 px-3 border border-border rounded-lg bg-secondary/40 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring cursor-pointer"
                >
                  {priorityOptions.filter(o => o.value !== 'all').map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
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
                  className="w-full h-10 px-3 border border-border rounded-lg bg-secondary/40 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring cursor-pointer"
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

            <div className="flex justify-end gap-2 pt-4 border-t border-border/30">
              <Button variant="outline" onClick={() => setEditingTask(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
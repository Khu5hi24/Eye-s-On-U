import { create } from 'zustand';
import { ActivityLog, Notification, Task, TaskPriority, TaskStatus, TeamMember, UserProfile } from '../types';
import { dashboardService } from '../services/dashboard.service';
import { useToastStore } from './toastStore';

export interface TaskFilters {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  assignedTo?: string | 'all';
  searchQuery?: string;
  sortBy?: 'dueDate' | 'priority' | 'status' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface UnifiedState {
  tasks: Task[];
  filters: TaskFilters;
  filteredTasks: Task[];
  teamMembers: TeamMember[];
  selectedMemberId: string | null;
  profile: UserProfile;
  notifications: Notification[];
  activityLogs: ActivityLog[];
  sidebarCollapsed: boolean;
  loading: boolean;
  error?: string;
  loadDashboardData: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setFilters: (filters: Partial<TaskFilters>) => void;
  filterTasks: () => void;
  searchTasks: (query: string) => void;
  sortTasks: (sortBy: TaskFilters['sortBy'], sortOrder?: TaskFilters['sortOrder']) => void;
  resetFilters: () => void;
  updateMember: (id: string, updates: Partial<TeamMember>) => void;
  selectMember: (id: string | null) => void;
  getMemberById: (id: string) => TeamMember | undefined;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  addActivityLog: (taskId: string, taskTitle: string, action: string, user: string) => void;
}

const priorityWeight: Record<TaskPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const getId = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value._id || value.id || '';
};

const toTask = (task: any): Task => ({
  id: getId(task),
  title: task.title || 'Untitled task',
  description: task.description || '',
  status: task.status || 'pending',
  priority: task.priority || 'medium',
  assignedTo: getId(task.assignedTo),
  createdBy: getId(task.createdBy),
  dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
  createdAt: task.createdAt || new Date().toISOString(),
  updatedAt: task.updatedAt || task.createdAt || new Date().toISOString(),
});

const toMember = (member: any): TeamMember => ({
  id: getId(member),
  name: member.name || 'Unnamed member',
  email: member.email || '',
  avatar: member.avatar || member.profilePicture || '',
  role: member.role || 'employee',
  bio: member.bio || '',
  specialization: member.specialization || '',
  phone: member.phone || '',
  gender: member.gender || '',
  projects: Math.max(1, Math.ceil((member.tasksAssigned || 0) / 3)),
  tasksAssigned: member.tasksAssigned || 0,
  completionRate: member.completionRate || 0,
  status: member.status || 'active',
});

const applyFilters = (tasks: Task[], filters: TaskFilters): Task[] => {
  let result = [...tasks];

  if (filters.status && filters.status !== 'all') result = result.filter((task) => task.status === filters.status);
  if (filters.priority && filters.priority !== 'all') result = result.filter((task) => task.priority === filters.priority);
  if (filters.assignedTo && filters.assignedTo !== 'all') result = result.filter((task) => task.assignedTo === filters.assignedTo);

  if (filters.searchQuery?.trim()) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter((task) => task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q));
  }

  if (filters.sortBy) {
    const order = filters.sortOrder === 'desc' ? -1 : 1;
    result.sort((a, b) => {
      if (filters.sortBy === 'title') return order * a.title.localeCompare(b.title);
      if (filters.sortBy === 'dueDate') return order * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      if (filters.sortBy === 'priority') return order * (priorityWeight[a.priority] - priorityWeight[b.priority]);
      if (filters.sortBy === 'status') return order * a.status.localeCompare(b.status);
      if (filters.sortBy === 'createdAt') return order * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return 0;
    });
  }

  return result;
};

const buildNotifications = (tasks: Task[]): Notification[] => {
  const now = Date.now();
  return tasks
    .filter((task) => task.status !== 'completed')
    .filter((task) => {
      const due = new Date(task.dueDate).getTime();
      return Number.isFinite(due) && due - now <= 3 * 24 * 60 * 60 * 1000;
    })
    .slice(0, 8)
    .map((task) => ({
      id: `task-${task.id}`,
      type: new Date(task.dueDate).getTime() < now ? 'alert' : 'deadline',
      title: new Date(task.dueDate).getTime() < now ? 'Task overdue' : 'Deadline approaching',
      message: `${task.title} is due ${task.dueDate}.`,
      read: false,
      timestamp: task.updatedAt,
      taskId: task.id,
    }));
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const err = error as any;
  return err?.response?.data?.message || err?.message || fallback;
};

export const useTaskStore = create<UnifiedState>((set, get) => ({
  tasks: [],
  filters: {},
  filteredTasks: [],
  teamMembers: [],
  selectedMemberId: null,
  profile: {
    name: 'Guest User',
    email: '',
    role: 'employee',
    avatar: '',
  },
  notifications: [],
  activityLogs: [],
  sidebarCollapsed: false,
  loading: false,
  error: undefined,

  loadDashboardData: async () => {
    set({ loading: true, error: undefined });
    try {
      const [tasksRes, teamRes] = await Promise.all([
        dashboardService.getTasks(),
        dashboardService.getTeamMembers(),
      ]);
      const tasks = (tasksRes.data?.data || []).map(toTask);
      const teamMembers = (teamRes.data?.data || []).map(toMember);
      const notifications = buildNotifications(tasks);

      set((state) => ({
        tasks,
        teamMembers,
        notifications,
        filteredTasks: applyFilters(tasks, state.filters),
      }));
    } catch (error) {
      set({ error: getErrorMessage(error, 'Unable to load dashboard data.') });
    } finally {
      set({ loading: false });
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await dashboardService.createTask(taskData);
      const task = toTask(response.data?.data);
      set((state) => {
        const tasks = [task, ...state.tasks];
        return {
          tasks,
          filteredTasks: applyFilters(tasks, state.filters),
          notifications: buildNotifications(tasks),
        };
      });
      await get().loadDashboardData();
      useToastStore.getState().showToast(`Task "${task.title}" created.`, 'success');
      return task;
    } catch (error) {
      useToastStore.getState().showToast(getErrorMessage(error, 'Unable to create task.'), 'error');
      return null;
    }
  },

  updateTask: async (id, updates) => {
    try {
      const response = updates.status && Object.keys(updates).length === 1
        ? await dashboardService.updateTaskStatus(id, updates.status)
        : await dashboardService.updateTask(id, updates);
      const task = toTask(response.data?.data);
      set((state) => {
        const tasks = state.tasks.map((item) => (item.id === id ? task : item));
        return {
          tasks,
          filteredTasks: applyFilters(tasks, state.filters),
          notifications: buildNotifications(tasks),
        };
      });
      await get().loadDashboardData();
      useToastStore.getState().showToast('Task updated.', 'success');
    } catch (error) {
      useToastStore.getState().showToast(getErrorMessage(error, 'Unable to update task.'), 'error');
    }
  },

  deleteTask: async (id) => {
    try {
      await dashboardService.deleteTask(id);
      set((state) => {
        const tasks = state.tasks.filter((task) => task.id !== id);
        return {
          tasks,
          filteredTasks: applyFilters(tasks, state.filters),
          notifications: buildNotifications(tasks),
        };
      });
      await get().loadDashboardData();
      useToastStore.getState().showToast('Task deleted.', 'warning');
    } catch (error) {
      useToastStore.getState().showToast(getErrorMessage(error, 'Unable to delete task.'), 'error');
    }
  },

  setFilters: (filters) => set((state) => {
    const next = { ...state.filters, ...filters };
    return { filters: next, filteredTasks: applyFilters(state.tasks, next) };
  }),
  filterTasks: () => set((state) => ({ filteredTasks: applyFilters(state.tasks, state.filters) })),
  searchTasks: (query) => set((state) => {
    const filters = { ...state.filters, searchQuery: query };
    return { filters, filteredTasks: applyFilters(state.tasks, filters) };
  }),
  sortTasks: (sortBy, sortOrder = 'asc') => set((state) => {
    const filters = { ...state.filters, sortBy, sortOrder };
    return { filters, filteredTasks: applyFilters(state.tasks, filters) };
  }),
  resetFilters: () => set((state) => ({ filters: {}, filteredTasks: applyFilters(state.tasks, {}) })),

  updateMember: (id, updates) => set((state) => ({ teamMembers: state.teamMembers.map((m) => (m.id === id ? { ...m, ...updates } : m)) })),
  selectMember: (id) => set({ selectedMemberId: id }),
  getMemberById: (id) => get().teamMembers.find((member) => member.id === id),
  updateProfile: (profile) => set((state) => ({ profile: { ...state.profile, ...profile } })),
  addNotification: (notification) => set((state) => ({
    notifications: [{
      ...notification,
      id: `notif-${Date.now()}`,
      read: false,
      timestamp: new Date().toISOString(),
    }, ...state.notifications],
  })),
  markNotificationAsRead: (id) => set((state) => ({ notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllNotificationsAsRead: () => set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) })),
  clearNotifications: () => set({ notifications: [] }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  addActivityLog: (taskId, taskTitle, action, user) => set((state) => ({
    activityLogs: [{
      id: `log-${Date.now()}`,
      taskId,
      taskTitle,
      action,
      user,
      timestamp: new Date().toISOString(),
    }, ...state.activityLogs],
  })),
}));

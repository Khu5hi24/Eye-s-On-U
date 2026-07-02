import type { ComponentType } from 'react';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';
export type ThemeMode = 'light' | 'dark';
export type ThemePreference = ThemeMode | 'system' | 'auto';
export type PriorityLevel = TaskPriority;
export type NotificationType = 'assigned' | 'deadline' | 'completed' | 'alert';
export type TeamMemberStatus = 'active' | 'offline' | 'busy';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: PriorityLevel;
  assignedTo: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email?: string;
  bio?: string;
  specialization?: string;
  phone?: string;
  gender?: string;
  projects: number;
  tasksAssigned: number;
  completionRate: number;
  status: TeamMemberStatus;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  taskTitle: string;
  action: string; // 'Created', 'Updated Status to Completed', etc.
  user: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  taskId?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
  bio?: string;
  specialization?: string;
  phone?: string;
  gender?: string;
}

export interface DashboardCardData {
  title: string;
  count: number;
  icon: ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  link: string;
  growth: string;
  isPositive: boolean;
  percentage: number;
}

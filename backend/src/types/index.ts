import { Types } from 'mongoose';

export type UserRole = 'admin' | 'employee' | 'user';

export interface IUser {
  name: string;
  email: string;
  password: string;
  avatar: string;
  bio?: string;
  role: UserRole;
  isVerified: boolean;
}

export interface IOTP {
  email: string;
  otp: string;
  expiresAt: Date;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';

export interface ITask {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date;
  assignedTo: Types.ObjectId | string;
  createdBy: Types.ObjectId | string;
}

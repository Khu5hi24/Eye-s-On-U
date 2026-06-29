'use client';

import React from 'react';
import { TaskTable } from './TaskTable';
import { useTaskStore } from '../store/taskStore';

export const RecentTasks: React.FC = () => {
  const { tasks } = useTaskStore();
  return <TaskTable tasks={tasks} limit={5} />;
};
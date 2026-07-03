'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTaskStore } from '@/store/taskStore';
import { TaskForm } from '@/components/TaskForm';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function NewTaskPage() {
  const router = useRouter();
  const { createTask } = useTaskStore();
  const { user, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated && user?.role !== 'admin') router.replace('/tasks');
  }, [isAuthenticated, router, user?.role]);

  if (!isAuthenticated || user?.role !== 'admin') return null;

  const handleSubmit = async (taskData: any, file?: { name: string; size: string; type: string; base64: string } | null) => {
    // Create task in store (automatically runs side effects)
    const createdTask = await createTask(taskData);
    
    if (createdTask && createdTask.id && file) {
      localStorage.setItem(`attachments_${createdTask.id}`, JSON.stringify([file]));
    }
    
    // Redirect to Task list page
    router.push('/tasks');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="space-y-1">
        <Link href="/tasks" className="inline-flex items-center gap-1.5 text-xs text-foreground/80 hover:text-primary font-bold transition-colors mb-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Tasks
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Plus className="h-6 w-6 text-primary" />
          Create New Task
        </h1>
        <p className="text-sm font-semibold text-foreground/80">Assign and schedule a new task for your team.</p>
      </div>

      {/* Reusable Form */}
      <TaskForm 
        onSubmit={handleSubmit}
        onCancel={() => router.push('/tasks')}
        submitLabel="Create Task"
      />

    </div>
  );
}

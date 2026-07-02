'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TasksList } from '@/components/TasksList';
import { useAuth } from '@/hooks/useAuth';

export default function TasksPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Task Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track all tasks</p>
        </div>
        {isAdmin && (
          <Link href="/tasks/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </Link>
        )}
      </div>
      <TasksList />
    </div>
  );
}

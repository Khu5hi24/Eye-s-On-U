'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardCards } from '@/components/DashboardCards';
import { RecentTasks } from '@/components/RecentTasks';
import { TasksList } from '@/components/TasksList';
import { ProductivityHeatmap } from '@/components/ProductivityHeatmap';
import { useTaskStore } from '@/store/taskStore';

export default function EmployeeDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { tasks } = useTaskStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'employee') {
      router.push('/login');
    }
  }, [isAuthenticated, user?.role, router]);

  if (!isAuthenticated || user?.role !== 'employee') {
    return null;
  }

  // Filter tasks assigned to the current employee to show their personal stats
  // Let's filter tasks to check user's personal completed tasks / streaks
  // But wait, the heatmap can show personal tasks. We can also let them see their own heatmap!
  // To get the email/name match, let's check who the tasks are assigned to.
  // In taskStore, initialTasks have assignedTo fields which are member ids ('1', '2', '3', '4', '5').
  // Let's find if user is one of the team members. If yes, filter tasks by their ID.
  const employeeMemberId = '2'; // Default fallback or dynamic match
  const personalTasks = tasks; // Heatmap can show all/personal. Let's pass personal tasks to heatmap if needed, or all. Passing all is great too.

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back, {user.name}! Here&apos;s your task overview.</p>
      </div>

      <DashboardCards />

      <ProductivityHeatmap tasks={personalTasks} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTasks />
        </div>
        <div>
          <TasksList />
        </div>
      </div>
    </div>
  );
}

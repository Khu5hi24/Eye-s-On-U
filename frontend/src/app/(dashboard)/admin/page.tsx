'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardCards } from '@/components/DashboardCards';
import { DashboardCharts } from '@/components/DashboardCharts';
import { DashboardInsights } from '@/components/DashboardInsights';
import { RecentTasks } from '@/components/RecentTasks';
import { ProductivityHeatmap } from '@/components/ProductivityHeatmap';
import { useTaskStore } from '@/store/taskStore';

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { tasks } = useTaskStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, user?.role, router]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back, {user.name}!</p>
      </div>

      <DashboardCards />

      <ProductivityHeatmap tasks={tasks} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardCharts />
        </div>
        <div>
          <DashboardInsights />
        </div>
      </div>

      <RecentTasks />
    </div>
  );
}


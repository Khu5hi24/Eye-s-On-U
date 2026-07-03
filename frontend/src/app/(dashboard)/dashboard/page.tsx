'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardCards } from '@/components/DashboardCards';
import { RecentTasks } from '@/components/RecentTasks';
import { TasksList } from '@/components/TasksList';
import { DashboardCharts } from '@/components/DashboardCharts';
import { ProductivityHeatmap } from '@/components/ProductivityHeatmap';
import { useTaskStore } from '@/store/taskStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, BriefcaseBusiness, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { TeamMembersPanel } from '@/components/ui/dashboard/TeamMembersPanel';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { tasks, teamMembers, loading, error } = useTaskStore();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  const personalTasks = tasks;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/60 bg-slate-950/90 p-6 shadow-sm dark:bg-slate-100/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-100 dark:text-slate-900">Welcome</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white dark:text-slate-950">{user.name}</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold text-slate-200 dark:text-slate-800">Here’s your team pulse for today, with priorities, progress, and the essentials in one place.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/team">
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                View Team
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <DashboardCards />

      {loading && (
        <Card className="border-border/60 bg-card/80">
          <CardContent className="p-6 text-sm text-muted-foreground">Loading dashboard data...</CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-2 p-6 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      )}

      {!loading && !error && tasks.length === 0 && (
        <Card className="border-border/60 bg-card/80">
          <CardContent className="p-6 text-sm text-muted-foreground">No tasks found in database.</CardContent>
        </Card>
      )}

      <DashboardCharts />

      {/* Task Summary and Quick Actions removed per request */}

      <ProductivityHeatmap tasks={personalTasks} />

      <div className="space-y-6">
        <RecentTasks />
        <TeamMembersPanel />
      </div>
    </div>
  );
}

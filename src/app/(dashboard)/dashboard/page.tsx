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
  const { tasks, loading, error } = useTaskStore();
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
      <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">Welcome back</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{user.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Here’s your team pulse for today, with priorities, progress, and the essentials in one place.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isAdmin && (
              <Link href="/tasks/new">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Task
                </Button>
              </Link>
            )}
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

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Task Summary</CardTitle>
              <p className="text-sm text-muted-foreground">A quick view of your active work.</p>
            </div>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <BriefcaseBusiness className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
                <p className="text-2xl font-semibold text-foreground">{tasks.length}</p>
                <p className="text-sm text-muted-foreground">Total tasks</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
                <p className="text-2xl font-semibold text-foreground">{tasks.filter((task) => task.status === 'in-progress').length}</p>
                <p className="text-sm text-muted-foreground">In progress</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
                <p className="text-2xl font-semibold text-foreground">{tasks.filter((task) => task.status === 'completed').length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link href="/tasks">
              <Button variant="outline" className="w-full justify-start">Open task board</Button>
            </Link>
            {isAdmin && (
              <Link href="/analytics">
                <Button variant="outline" className="w-full justify-start">View analytics</Button>
              </Link>
            )}
            <Link href="/profile">
              <Button variant="outline" className="w-full justify-start">Update profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <ProductivityHeatmap tasks={personalTasks} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTasks />
        </div>
        <div>
          <TeamMembersPanel />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { DashboardCharts } from '@/components/DashboardCharts';
import { DashboardInsights } from '@/components/DashboardInsights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router, user?.role]);

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">Review trends, capacity, delivery health, and team performance from the latest data.</p>
        </div>
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 text-primary">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>
      <div className="grid gap-6">
        <Card className="border-border/60 bg-card/80 h-full">
          <CardHeader>
            <CardTitle className="text-lg">Performance overview</CardTitle>
          </CardHeader>
          <CardContent className="h-full min-h-[28rem]">
            <DashboardCharts />
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/80 h-full">
          <CardHeader>
            <CardTitle className="text-lg">Insights</CardTitle>
          </CardHeader>
          <CardContent className="h-full min-h-[28rem]">
            <DashboardInsights />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

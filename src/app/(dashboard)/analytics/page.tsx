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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review trends, capacity, and delivery health.</p>
        </div>
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <TrendingUp className="h-4 w-4" />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg">Performance overview</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardCharts />
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg">Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardInsights />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

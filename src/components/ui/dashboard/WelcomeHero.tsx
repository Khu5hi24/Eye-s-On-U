'use client';

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../../store/taskStore';
import { Clock, CalendarDays, Zap } from 'lucide-react';
import { Card, CardContent } from '../card';
import { cn } from '../../../utils';

export const WelcomeHero: React.FC = () => {
  const { tasks } = useTaskStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getWeekSummary = () => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    return { total, completed, pending, inProgress };
  };

  const summary = getWeekSummary();

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <Card className="glass border-border/40 overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Left: Greeting & Note */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {getGreeting()}, <span className="text-primary">Admin</span>
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Stay productive. You have {summary.pending} pending and {summary.inProgress} in-progress tasks today.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full">
                <CalendarDays className="h-3 w-3" />
                {formattedDate}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full">
                <Clock className="h-3 w-3" />
                {formattedTime}
              </span>
            </div>
          </div>

          {/* Right: Weekly Summary Mini-Stats */}
          <div className="flex items-center gap-3 sm:gap-4">
            {[
              { label: 'Total', value: summary.total, color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
              { label: 'Done', value: summary.completed, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
              { label: 'Pending', value: summary.pending, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
              { label: 'Active', value: summary.inProgress, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
            ].map((stat) => (
              <div key={stat.label} className={cn('flex flex-col items-center px-3 py-2 rounded-xl', stat.color)}>
                <span className="text-lg font-bold leading-none">{stat.value}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider mt-1 opacity-80">{stat.label}</span>
              </div>
            ))}
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
};
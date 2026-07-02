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
    <Card className="border-border/80 shadow-xs overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* Left: Greeting & Note */}
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground font-heading">
              {getGreeting()}, <span className="text-accent font-semibold">Workspace Member</span>
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 leading-relaxed">
              <Zap className="h-3.5 w-3.5 text-accent animate-pulse" />
              Stay productive. You have {summary.pending} pending and {summary.inProgress} in-progress tasks today.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-md uppercase tracking-wider">
                <CalendarDays className="h-3 w-3 text-accent" />
                {formattedDate}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-md uppercase tracking-wider">
                <Clock className="h-3 w-3 text-accent" />
                {formattedTime}
              </span>
            </div>
          </div>

          {/* Right: Weekly Summary Mini-Stats */}
          <div className="flex items-center gap-3 sm:gap-4">
            {[
              { label: 'Total', value: summary.total, color: 'bg-secondary text-foreground' },
              { label: 'Done', value: summary.completed, color: 'bg-[#3b6e58]/10 text-[#3b6e58] dark:text-[#3b6e58]/90' },
              { label: 'Pending', value: summary.pending, color: 'bg-[#c5a880]/10 text-[#c5a880]' },
              { label: 'Active', value: summary.inProgress, color: 'bg-primary/10 text-primary' },
            ].map((stat) => (
              <div key={stat.label} className={cn('flex flex-col items-center px-3 py-1.5 rounded-md border border-border/40 min-w-[3.5rem]', stat.color)}>
                <span className="text-base font-bold leading-none font-heading">{stat.value}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider mt-1 opacity-80">{stat.label}</span>
              </div>
            ))}
          </div>

        </div>
      </CardContent>
    </Card>
  );
};
'use client';

import React from 'react';
import { useTaskStore } from '../store/taskStore';
import { useTeamStore } from '../store/teamStore';
import { Card, CardContent } from './ui/card';
import { Sparkles, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { cn } from '../utils';

export const DashboardInsights: React.FC = () => {
  const { tasks } = useTaskStore();
  const { teamMembers } = useTeamStore();

  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const criticalOverdue = tasks.filter(
    (t) => t.priority === 'critical' && t.status === 'overdue'
  ).length;
  const highInProgress = tasks.filter(
    (t) => t.priority === 'high' && t.status === 'in-progress'
  ).length;

  const averageCompletionRate = Math.round(
    teamMembers.reduce((acc, m) => acc + m.completionRate, 0) / teamMembers.length
  );

  const busyMembers = teamMembers.filter((m) => m.status === 'busy').length;

  const insights = [
    {
      show: criticalOverdue > 0,
      title: 'Action Needed: Critical Overdue Tasks',
      message: `You have ${criticalOverdue} critical task(s) overdue. High risk of missing milestone deliverables.`,
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
    },
    {
      show: highInProgress > 0,
      title: 'High Load Active Progress',
      message: `Team is currently working on ${highInProgress} high priority task(s). Keep monitoring progress lanes.`,
      icon: Sparkles,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      show: true,
      title: 'Team Performance Index',
      message: `Average team task completion rate is currently at a healthy ${averageCompletionRate}%.`,
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      show: busyMembers > 0,
      title: 'Resource Allocation Alert',
      message: `${busyMembers} team member(s) are currently flagged as "Busy". Consider reassigning upcoming tasks.`,
      icon: CheckCircle,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
  ].filter((item) => item.show);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {insights.map((insight, idx) => {
        const Icon = insight.icon;
        return (
          <Card key={idx} className={cn("glass border shadow-xs transition-all hover:shadow-md", insight.bg)}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={cn("p-1.5 rounded-lg bg-card/60 flex-shrink-0 mt-0.5 shadow-sm")}>
                <Icon className={cn("h-4 w-4", insight.color)} />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-bold text-foreground leading-tight truncate">
                  {insight.title}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {insight.message}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

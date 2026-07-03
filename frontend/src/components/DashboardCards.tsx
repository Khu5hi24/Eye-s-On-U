'use client';

import React from 'react';
import Link from 'next/link';
import { ClipboardList, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { Card, CardContent } from './ui/card';
import { cn } from '../utils';

export const DashboardCards: React.FC = () => {
  const { tasks } = useTaskStore();

  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const overdue = tasks.filter((t) => t.status === 'overdue').length;

  const cardData = [
    {
      title: 'Total Tasks',
      count: total,
      icon: ClipboardList,
      color: 'text-slate-600 dark:text-slate-300',
      bg: 'bg-slate-500/10',
      link: '/tasks/total',
      growth: 'Live DB',
      isPositive: true,
      percentage: 100,
    },
    {
      title: 'Pending Tasks',
      count: pending,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-300',
      bg: 'bg-amber-500/10',
      link: '/tasks/pending',
      growth: 'Awaiting work',
      isPositive: true,
      percentage: total > 0 ? Math.round((pending / total) * 100) : 0,
    },
    {
      title: 'Completed Tasks',
      count: completed,
      icon: CheckCircle,
      color: 'text-emerald-600 dark:text-emerald-300',
      bg: 'bg-emerald-500/10',
      link: '/tasks/completed',
      growth: 'Finished',
      isPositive: true,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    },
    {
      title: 'Overdue Tasks',
      count: overdue,
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-300',
      bg: 'bg-rose-500/10',
      link: '/tasks/overdue',
      growth: 'Needs action',
      isPositive: false,
      percentage: total > 0 ? Math.round((overdue / total) * 100) : 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cardData.map((card, idx) => {
        const Icon = card.icon;

        return (
          <Link key={idx} href={card.link} className="group block">
            <Card className="cursor-pointer border-border/80 shadow-xs hover:border-accent/40">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-foreground/80">{card.title}</p>
                    <h3 className="mt-2.5 text-3xl font-bold tracking-tight text-foreground font-heading">{card.count}</h3>
                  </div>
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-md shadow-xs', card.bg)}>
                    <Icon className={cn('h-5 w-5', card.color)} />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide', card.isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400')}>
                    {card.percentage}%
                  </span>
                  <span className="text-xs font-bold text-foreground/80 uppercase tracking-wide">{card.growth}</span>
                </div>

                <div className="mt-4 h-1 overflow-hidden rounded-sm bg-secondary">
                  <div
                    className={cn('h-full rounded-sm transition-all duration-500', card.title === 'Total Tasks' ? 'bg-primary/40' : card.title === 'Pending Tasks' ? 'bg-amber-500/80' : card.title === 'Completed Tasks' ? 'bg-emerald-500/80' : 'bg-rose-500/80')}
                    style={{ width: `${Math.min(100, Math.max(5, card.percentage))}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};

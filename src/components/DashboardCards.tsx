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
      link: '/tasks',
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
            <Card className="glass cursor-pointer overflow-hidden border-border/60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">{card.title}</p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-tight text-foreground transition-transform duration-300 group-hover:scale-[1.02]">{card.count}</h3>
                  </div>
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl shadow-inner', card.bg)}>
                    <Icon className={cn('h-5 w-5', card.color)} />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <span className={cn('inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold', card.isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400')}>
                    {card.percentage}%
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">{card.growth}</span>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary/60">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', card.title === 'Total Tasks' ? 'bg-slate-500' : card.title === 'Pending Tasks' ? 'bg-amber-400' : card.title === 'Completed Tasks' ? 'bg-emerald-400' : 'bg-rose-400')}
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

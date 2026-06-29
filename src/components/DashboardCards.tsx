'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ClipboardList, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
} from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { Card, CardContent } from './ui/card';
import { cn } from '../utils';

export const DashboardCards: React.FC = () => {
  const { tasks } = useTaskStore();

  const total = tasks.length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const overdue = tasks.filter(t => t.status === 'overdue').length;

  const cardData = [
    {
      title: 'Total Tasks',
      count: total,
      icon: ClipboardList,
      color: 'text-slate-500',
      bg: 'bg-slate-500/10',
      border: 'hover:border-slate-400/40',
      link: '/tasks/total',
      growth: 'Live DB',
      isPositive: true,
      percentage: 100,
    },
    {
      title: 'Pending Tasks',
      count: pending,
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'hover:border-amber-400/40',
      link: '/tasks/pending',
      growth: 'Awaiting work',
      isPositive: true,
      percentage: total > 0 ? Math.round((pending / total) * 100) : 0,
    },
    {
      title: 'Completed Tasks',
      count: completed,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'hover:border-emerald-400/40',
      link: '/tasks/completed',
      growth: 'Finished',
      isPositive: true,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    },
    {
      title: 'Overdue Tasks',
      count: overdue,
      icon: AlertTriangle,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'hover:border-rose-400/40',
      link: '/tasks',
      growth: 'Needs action',
      isPositive: false,
      percentage: total > 0 ? Math.round((overdue / total) * 100) : 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardData.map((card, idx) => {
        const Icon = card.icon;
        
        return (
          <Link key={idx} href={card.link} className="block group">
            <Card className={cn(
              "glass transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer",
              card.border
            )}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {card.title}
                    </p>
                    <h3 className="text-3xl font-bold text-foreground mt-2 tracking-tight group-hover:scale-[1.02] transition-transform origin-left">
                      {card.count}
                    </h3>
                  </div>
                  
                  <div className={cn("p-2.5 rounded-xl shadow-inner", card.bg)}>
                    <Icon className={cn("h-5 w-5", card.color)} />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-5">
                  <span className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full",
                    card.isPositive 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  )}>
                    <span>{card.percentage}%</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {card.growth}
                  </span>
                </div>

                {/* Progress bar inside cards */}
                <div className="w-full bg-secondary/50 rounded-full h-1 mt-4 overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      card.title === 'Total Tasks' && 'bg-slate-400',
                      card.title === 'Pending Tasks' && 'bg-amber-400',
                      card.title === 'Completed Tasks' && 'bg-emerald-400',
                      card.title === 'Overdue Tasks' && 'bg-rose-400'
                    )}
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

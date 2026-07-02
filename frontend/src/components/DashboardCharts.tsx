'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTaskStore } from '../store/taskStore';
import { useTeamStore } from '../store/teamStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export const DashboardCharts: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { tasks } = useTaskStore();
  const { teamMembers } = useTeamStore();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((idx) => (
          <Card key={idx} className="h-80 animate-pulse-soft flex flex-col justify-between p-5">
            <div className="h-5 w-1/2 rounded-md bg-secondary" />
            <div className="h-44 w-full rounded-md bg-secondary/60" />
            <div className="h-3 w-3/4 rounded-md bg-secondary" />
          </Card>
        ))}
      </div>
    );
  }

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const progressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const overdueCount = tasks.filter((t) => t.status === 'overdue').length;

  const pieData = [
    { name: 'Pending', value: pendingCount, color: '#c5a880' },
    { name: 'In Progress', value: progressCount, color: '#7a828a' },
    { name: 'Completed', value: completedCount, color: '#3b6e58' },
    { name: 'Overdue', value: overdueCount, color: '#d9383a' },
  ].filter((item) => item.value > 0);

  const now = new Date();
  const weeklyData = Array.from({ length: 4 }).map((_, index) => {
    const end = new Date(now);
    end.setDate(now.getDate() - (3 - index) * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    const weekTasks = tasks.filter((task) => {
      const created = new Date(task.createdAt);
      return created >= start && created <= end;
    });

    return {
      name: `W${index + 1}`,
      Created: weekTasks.length,
      Completed: weekTasks.filter((task) => task.status === 'completed').length,
      Pending: weekTasks.filter((task) => task.status !== 'completed').length,
    };
  });

  const topMembers = [...teamMembers]
    .sort((a, b) => b.completionRate - a.completionRate || b.tasksAssigned - a.tasksAssigned)
    .slice(0, 5)
    .map((member) => ({
      name: member.name.split(' ')[0],
      Completion: member.completionRate,
      Tasks: member.tasksAssigned,
    }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="overflow-hidden border-border/80">
        <CardHeader className="border-b border-border/40 bg-secondary/20">
          <CardTitle className="flex items-center justify-between text-xs font-semibold tracking-wide uppercase text-foreground">
            <span>Weekly Activity</span>
            <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase text-accent">Tasks Flow</span>
          </CardTitle>
          <CardDescription className="text-xs">Created, completed, and pending overview</CardDescription>
        </CardHeader>
        <CardContent className="h-64 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="#8a8880" fontSize={10} tickLine={false} />
              <YAxis stroke="#8a8880" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px' }} />
              <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="Created" fill="var(--foreground)" opacity={0.85} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Completed" fill="#3b6e58" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Pending" fill="#c5a880" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/80">
        <CardHeader className="border-b border-border/40 bg-secondary/20">
          <CardTitle className="flex items-center justify-between text-xs font-semibold tracking-wide uppercase text-foreground">
            <span>Task Distribution</span>
            <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase text-accent">Status Mix</span>
          </CardTitle>
          <CardDescription className="text-xs">Categorized status distribution breakdown</CardDescription>
        </CardHeader>
        <CardContent className="flex h-64 flex-col justify-center p-4">
          <div className="relative h-48 w-full">
            {pieData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">No active task data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-foreground font-heading">{tasks.length}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Total Tasks</span>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-4 gap-1 text-center">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-[9px] font-semibold text-muted-foreground uppercase">{item.name}</span>
                <div className="mt-1 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold text-foreground">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/80">
        <CardHeader className="border-b border-border/40 bg-secondary/20">
          <CardTitle className="flex items-center justify-between text-xs font-semibold tracking-wide uppercase text-foreground">
            <span>Top Active Members</span>
            <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase text-accent">DB Rank</span>
          </CardTitle>
          <CardDescription className="text-xs">Top 5 by completion and assigned tasks</CardDescription>
        </CardHeader>
        <CardContent className="h-64 p-4">
          {topMembers.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No team data</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMembers} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="#8a8880" fontSize={10} tickLine={false} />
                <YAxis stroke="#8a8880" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px' }} />
                <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Completion" fill="#3b6e58" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Tasks" fill="#c5a880" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

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
    // Render skeleton loaders for charts while mounting
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((idx) => (
          <Card key={idx} className="h-80 animate-pulse-soft flex flex-col justify-between p-6">
            <div className="h-6 bg-secondary rounded-md w-1/2" />
            <div className="h-44 bg-secondary/60 rounded-lg w-full" />
            <div className="h-4 bg-secondary rounded-md w-3/4" />
          </Card>
        ))}
      </div>
    );
  }

  // 1. Dynamic Task Distribution (Pie Chart)
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const progressCount = tasks.filter(t => t.status === 'in-progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const overdueCount = tasks.filter(t => t.status === 'overdue').length;

  const pieData = [
    { name: 'Pending', value: pendingCount, color: '#f59e0b' },
    { name: 'In Progress', value: progressCount, color: '#3b82f6' },
    { name: 'Completed', value: completedCount, color: '#10b981' },
    { name: 'Overdue', value: overdueCount, color: '#ef4444' },
  ].filter(item => item.value > 0);

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Bar Chart: Weekly Performance */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center justify-between">
            <span>Weekly Activity</span>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">Tasks Flow</span>
          </CardTitle>
          <CardDescription className="text-xs">Created, completed, and pending overview</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--card)', 
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }} 
              />
              <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Created" fill="var(--foreground)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Chart: Task Status Distribution */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center justify-between">
            <span>Task Distribution</span>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">Status Mix</span>
          </CardTitle>
          <CardDescription className="text-xs">Categorized status distribution breakdown</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex flex-col justify-center">
          <div className="h-48 w-full relative">
            {pieData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                No active task data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: '12px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {/* Center Summary Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-foreground">{tasks.length}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Tasks</span>
            </div>
          </div>
          
          {/* Legend Labels Grid */}
          <div className="grid grid-cols-4 gap-1 text-center mt-2">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-[10px] font-semibold text-muted-foreground">{item.name}</span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold text-foreground">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Performance */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center justify-between">
            <span>Top Active Members</span>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">DB Rank</span>
          </CardTitle>
          <CardDescription className="text-xs">Top 5 by completion and assigned tasks</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          {topMembers.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No team data</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMembers} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '12px'
                  }} 
                />
                <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Completion" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

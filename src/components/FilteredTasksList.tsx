'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTaskStore } from '../store/taskStore';
import { useTeamStore } from '../store/teamStore';
import { TaskTable, PriorityBadge } from './TaskTable';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Clock, BarChart3, CheckSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FilteredTasksListProps {
  category: 'total' | 'pending' | 'in-progress' | 'completed';
}

export const FilteredTasksList: React.FC<FilteredTasksListProps> = ({ category }) => {
  const [mounted, setMounted] = useState(false);
  const { tasks } = useTaskStore();
  const { teamMembers } = useTeamStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getFilteredTasks = () => {
    if (category === 'total') return tasks;
    return tasks.filter((t) => t.status === category);
  };

  const filtered = getFilteredTasks();

  const titleMap = {
    total: 'All Tasks',
    pending: 'Pending Tasks',
    'in-progress': 'In Progress Tasks',
    completed: 'Completed Tasks',
  };

  const descMap = {
    total: 'Comprehensive list of all tasks managed in the workspace.',
    pending: 'Tasks waiting to be started or unassigned.',
    'in-progress': 'Tasks currently being actively worked on.',
    completed: 'Archived record of all completed tasks.',
  };

  // Compute metrics for this subset of tasks
  const lowCount = filtered.filter((t) => t.priority === 'low').length;
  const medCount = filtered.filter((t) => t.priority === 'medium').length;
  const highCount = filtered.filter((t) => t.priority === 'high').length;
  const critCount = filtered.filter((t) => t.priority === 'critical').length;

  const priorityData = [
    { name: 'Low', count: lowCount, color: '#64748b' },
    { name: 'Medium', count: medCount, color: '#6366f1' },
    { name: 'High', count: highCount, color: '#f97316' },
    { name: 'Critical', count: critCount, color: '#ef4444' },
  ].filter((item) => item.count > 0);

  // Team breakdown
  const teamBreakdown = teamMembers.map((member) => {
    const memberTasksCount = filtered.filter((t) => t.assignedTo === member.id).length;
    return {
      name: member.name.split(' ')[0],
      tasks: memberTasksCount,
      avatar: member.avatar,
    };
  }).filter((item) => item.tasks > 0);

  return (
    <div className="space-y-6">
      
      {/* Header with back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold mb-1 transition-colors">
            <ArrowLeft className="h-3 w-3" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            {titleMap[category]}
          </h1>
          <p className="text-sm text-muted-foreground">{descMap[category]}</p>
        </div>
        
        <div className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full font-bold uppercase w-fit self-start">
          {filtered.length} Tasks
        </div>
      </div>

      {/* Mini Analytics Widgets */}
      {mounted && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Priority Breakdown Bar Chart */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Priority Mix
              </CardTitle>
            </CardHeader>
            <CardContent className="h-48">
              {priorityData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  No priority data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData} layout="vertical" margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Member Workload Breakdown */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Team Assignment workload
              </CardTitle>
            </CardHeader>
            <CardContent className="h-48">
              {teamBreakdown.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  No tasks assigned to team members in this category
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamBreakdown} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="tasks" fill="var(--foreground)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

        </div>
      )}

      {/* Task Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Tasks in this Category</h2>
        <TaskTable tasks={filtered} />
      </div>

    </div>
  );
};

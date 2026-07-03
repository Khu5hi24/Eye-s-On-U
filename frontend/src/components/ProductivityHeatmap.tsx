'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, Award } from 'lucide-react';
import { Task } from '../types';

interface ProductivityHeatmapProps {
  tasks: Task[];
}

export const ProductivityHeatmap: React.FC<ProductivityHeatmapProps> = ({ tasks }) => {
  const { heatmapData, currentStreak, longestStreak, totalCompleted } = useMemo(() => {
    // Filter completed tasks
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.updatedAt);

    // Total completed
    const totalCompleted = completedTasks.length;

    // Map date strings (YYYY-MM-DD) to task counts
    const dateCounts: Record<string, number> = {};
    completedTasks.forEach(task => {
      const dateStr = task.updatedAt.split('T')[0];
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    });

    // Generate last 63 days (9 weeks of 7 days) to fill a perfect grid
    const today = new Date();
    const days: { dateStr: string; date: Date; count: number }[] = [];

    // We want the grid to end on "today" and go back 62 days
    for (let i = 62; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        date: d,
        count: dateCounts[dateStr] || 0
      });
    }

    // Calculate streaks
    // Sort all unique completion dates descending (newest first)
    const completionDates = Object.keys(dateCounts)
      .filter(dateStr => dateCounts[dateStr] > 0)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (completionDates.length > 0) {
      const oneDayMs = 24 * 60 * 60 * 1000;
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Check if user completed something today or yesterday to continue current streak
      const hasRecentCompletion = completionDates[0] === todayStr || completionDates[0] === yesterdayStr;

      if (hasRecentCompletion) {
        currentStreak = 1;
        let lastDate = new Date(completionDates[0]);

        for (let i = 1; i < completionDates.length; i++) {
          const currentDate = new Date(completionDates[i]);
          const diffDays = Math.round((lastDate.getTime() - currentDate.getTime()) / oneDayMs);

          if (diffDays === 1) {
            currentStreak++;
            lastDate = currentDate;
          } else if (diffDays > 1) {
            break; // Streak broken
          }
        }
      }

      // Calculate longest streak
      // Sort ascending to calculate forward
      const ascDates = [...completionDates].reverse();
      if (ascDates.length > 0) {
        longestStreak = 1;
        tempStreak = 1;
        let lastDate = new Date(ascDates[0]);

        for (let i = 1; i < ascDates.length; i++) {
          const currentDate = new Date(ascDates[i]);
          const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / oneDayMs);

          if (diffDays === 1) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
          } else if (diffDays > 1) {
            tempStreak = 1;
          }
          lastDate = currentDate;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      }
    }

    return {
      heatmapData: days,
      currentStreak,
      longestStreak,
      totalCompleted
    };
  }, [tasks]);

  // Color logic for heatmap cells based on task count
  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-secondary/40 dark:bg-slate-800/40 hover:bg-secondary/60';
    if (count === 1) return 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/30';
    if (count === 2) return 'bg-emerald-500/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-500/50';
    return 'bg-emerald-500 text-white hover:bg-emerald-600';
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Streaks Card */}
      <div className="lg:col-span-1 glass rounded-2xl border border-border p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
            <span>Activity Streaks</span>
          </h3>
          <p className="text-xs text-foreground/80 font-bold mt-1">Keep completing tasks daily to build your streak!</p>
        </div>

        <div className="grid grid-cols-2 gap-4 my-6">
          <div className="bg-secondary/30 dark:bg-slate-800/30 rounded-xl p-5 pr-12 border border-border/40 text-center relative overflow-hidden">
            <div className="absolute top-3 right-3 text-orange-400 opacity-70 pointer-events-none">
              <Flame className="h-8 w-8" />
            </div>
            <p className="text-xs text-foreground/80 font-bold uppercase tracking-wide">Current Streak</p>
            <h4 className="text-4xl font-extrabold text-foreground mt-3 flex items-center justify-center gap-2">
              <span>{currentStreak}</span>
              <span className="text-sm text-orange-500 font-semibold">days</span>
            </h4>
          </div>

          <div className="bg-secondary/30 dark:bg-slate-800/30 rounded-xl p-5 pr-12 border border-border/40 text-center relative overflow-hidden">
            <div className="absolute top-3 right-3 text-yellow-400 opacity-70 pointer-events-none">
              <Award className="h-8 w-8" />
            </div>
            <p className="text-xs text-foreground/80 font-bold uppercase tracking-wide">Longest Streak</p>
            <h4 className="text-4xl font-extrabold text-foreground mt-3 flex items-center justify-center gap-2">
              <span>{longestStreak}</span>
              <span className="text-sm text-yellow-500 font-semibold">days</span>
            </h4>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm border-t border-border/40 pt-4">
          <span className="text-foreground/85 font-bold">Total Completed:</span>
          <span className="font-bold text-foreground bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-lg">
            {totalCompleted} Tasks
          </span>
        </div>
      </div>

      {/* Heatmap Grid Card */}
      <div className="lg:col-span-2 glass rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Task Completion Heatmap</span>
          </h3>
          <span className="text-[10px] bg-secondary text-foreground px-2 py-0.5 border border-border/60 rounded font-extrabold uppercase">
            Last 60 Days
          </span>
        </div>

        <div className="relative overflow-x-auto pb-2 scrollbar-none">
          <div className="min-w-[480px]">
            {/* Months Header Labels */}
            <div className="flex pl-8 mb-2 text-[10px] text-slate-700 dark:text-slate-300 font-extrabold uppercase tracking-wider">
              {Array.from({ length: 9 }).map((_, index) => {
                const date = new Date();
                date.setDate(date.getDate() - (8 - index) * 7);
                // Only show label if it's the start of a month or every 2nd week to space things nicely
                return (
                  <div key={index} className="w-[44px] text-left">
                    {index % 2 === 0 ? getMonthName(date) : ''}
                  </div>
                );
              })}
            </div>

            {/* Grid Container */}
            <div className="flex gap-2">
              {/* Days of Week Labels (Left Side) */}
              <div className="flex flex-col justify-between text-[9px] font-extrabold text-slate-700 dark:text-slate-300 h-[112px] w-6 pr-1 pt-1 select-none">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
                <span>Sun</span>
              </div>

              {/* Grid Cells: 9 columns, 7 rows */}
              <div className="grid grid-flow-col grid-rows-7 gap-1 flex-1">
                {heatmapData.map((day, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    className={`h-3 w-3 rounded-xs transition-colors cursor-pointer relative group ${getCellColor(day.count)}`}
                  >
                    {/* Glass Tooltip */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-card/95 border border-border/80 text-[10px] font-bold py-1 px-2 rounded-lg shadow-xl whitespace-nowrap z-50 text-foreground">
                      {day.count} completed on {day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-foreground font-extrabold uppercase select-none">
          <span>Less</span>
          <div className="h-2.5 w-2.5 rounded-xs bg-secondary/40 dark:bg-slate-800/40" />
          <div className="h-2.5 w-2.5 rounded-xs bg-emerald-500/20" />
          <div className="h-2.5 w-2.5 rounded-xs bg-emerald-500/40" />
          <div className="h-2.5 w-2.5 rounded-xs bg-emerald-500" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

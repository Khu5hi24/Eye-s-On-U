'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const preferences = ['light', 'dark', 'auto'] as const;

const getAutoTheme = () => {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 18 ? 'light' : 'dark';
};

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [preference, setPreference] = useState<(typeof preferences)[number]>('auto');

  useEffect(() => {
    const saved = localStorage.getItem('eyesonu_theme_preference') as (typeof preferences)[number] | null;
    const next = saved && preferences.includes(saved) ? saved : 'auto';
    setPreference(next);
    setTheme(next === 'auto' ? getAutoTheme() : next);
    setMounted(true);
  }, [setTheme]);

  if (!mounted) return <div className="h-9 w-9 rounded-lg bg-secondary/30 border border-border/40 animate-pulse" />;

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    const next = preferences[(preferences.indexOf(preference) + 1) % preferences.length];
    setPreference(next);
    localStorage.setItem('eyesonu_theme_preference', next);
    setTheme(next === 'auto' ? getAutoTheme() : next);
  };

  const Icon = preference === 'auto' ? Timer : isDark ? Moon : Sun;

  return (
    <button
      onClick={toggleTheme}
      className="relative h-9 w-9 rounded-lg flex items-center justify-center border border-border/40 bg-secondary/30 hover:bg-secondary/60 hover:shadow-[0_0_12px_rgba(99,102,241,0.2)] transition-all duration-300 backdrop-blur-md focus:outline-none"
      title={`Theme: ${preference} (resolved: ${resolvedTheme || theme}). Click to toggle.`}
      aria-label={`Theme: ${preference}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={preference}
          initial={{ rotate: -90, scale: 0, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className={isDark ? 'h-[18px] w-[18px] text-indigo-400' : 'h-[18px] w-[18px] text-amber-600'} />
        </motion.div>
      </AnimatePresence>
    </button>
  );
};

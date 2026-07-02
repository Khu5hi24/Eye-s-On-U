'use client';

import { useEffect, useState, useCallback } from 'react';
import { useThemeStore, hydrateThemeStore } from '../store/themeStore';
import { ThemeMode } from '../types';

const getAutoTheme = (): ThemeMode => {
  const hour = new Date().getHours();
  return hour >= 8 && hour < 18 ? 'light' : 'dark';
};

export const useThemeManager = () => {
  const { theme, isAutoMode, setTheme, toggleTheme, resetToAuto } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Hydrate on mount to avoid SSR mismatch
  useEffect(() => {
    hydrateThemeStore();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Apply theme class to document element
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, mounted]);

  // Auto theme interval checker
  useEffect(() => {
    if (!isAutoMode || !mounted) return;

    const interval = setInterval(() => {
      const autoTheme = getAutoTheme();
      const current = useThemeStore.getState().theme;
      if (current !== autoTheme) {
        useThemeStore.setState({ theme: autoTheme });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAutoMode, mounted]);

  const handleSetTheme = useCallback(
    (newTheme: ThemeMode) => {
      setTheme(newTheme);
    },
    [setTheme]
  );

  const handleToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const handleResetToAuto = useCallback(() => {
    resetToAuto();
  }, [resetToAuto]);

  return {
    theme,
    isAutoMode,
    mounted,
    setTheme: handleSetTheme,
    toggleTheme: handleToggle,
    resetToAuto: handleResetToAuto,
  };
};
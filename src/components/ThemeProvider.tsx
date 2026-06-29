'use client';

import React, { useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

const getAutoTheme = () => {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 18 ? 'light' : 'dark';
};

const ThemeScheduler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setTheme } = useTheme();

  useEffect(() => {
    const applyPreference = () => {
      const preference = localStorage.getItem('eyesonu_theme_preference') || 'system';
      if (preference === 'auto') setTheme(getAutoTheme());
      else setTheme(preference);
    };

    applyPreference();
    const interval = window.setInterval(applyPreference, 60 * 1000);
    window.addEventListener('storage', applyPreference);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', applyPreference);
    };
  }, [setTheme]);

  return <>{children}</>;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem storageKey="eyesonu_resolved_theme">
      <ThemeScheduler>
        <div className={mounted ? '' : 'invisible'}>{children}</div>
      </ThemeScheduler>
    </NextThemesProvider>
  );
};

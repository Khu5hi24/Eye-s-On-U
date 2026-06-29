import { create } from 'zustand';
import { ThemeMode } from '../types';

interface ThemeState {
  theme: ThemeMode;
  isAutoMode: boolean;

  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  resetToAuto: () => void;
}

const getAutoTheme = (): ThemeMode => {
  const hour = new Date().getHours();
  return hour >= 8 && hour < 18 ? 'light' : 'dark';
};

const getInitialTheme = (): { theme: ThemeMode; isAutoMode: boolean } => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme-override') as ThemeMode | null;
    if (saved === 'light' || saved === 'dark') {
      return { theme: saved, isAutoMode: false };
    }
  }
  return { theme: getAutoTheme(), isAutoMode: true };
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
  isAutoMode: true,

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-override', theme);
    }
    set({ theme, isAutoMode: false });
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme: ThemeMode = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme-override', newTheme);
      }
      return { theme: newTheme, isAutoMode: false };
    });
  },

  resetToAuto: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('theme-override');
    }
    const autoTheme = getAutoTheme();
    set({ theme: autoTheme, isAutoMode: true });
  },
}));

// Hydration helper - call once on client mount
export const hydrateThemeStore = () => {
  const { theme, isAutoMode } = getInitialTheme();
  useThemeStore.setState({ theme, isAutoMode });
};
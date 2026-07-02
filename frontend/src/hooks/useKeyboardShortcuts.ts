'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

export function useKeyboardShortcuts() {
  const router = useRouter();
  const lastKeyRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key?.toLowerCase();

      // Escape key clears focus from text inputs
      if (event.key === 'Escape') {
        const target = event.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.tagName === 'SELECT'
        ) {
          target.blur();
          return;
        }
      }

      // Theme toggle shortcut: Ctrl + Alt + T
      if (event.ctrlKey && event.altKey && key === 't') {
        event.preventDefault();
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
        return;
      }

      // Ignore navigation shortcuts if typing in text fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      // Search shortcut: '/' key focuses search bar
      if (key === '/') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      // Check sequence 'g' + ... or 'c' + ...
      if (lastKeyRef.current === 'g') {
        lastKeyRef.current = null;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (key === 'd') {
          event.preventDefault();
          router.push('/');
          return;
        }
        if (key === 't') {
          event.preventDefault();
          router.push('/tasks');
          return;
        }
      }

      if (lastKeyRef.current === 'c') {
        lastKeyRef.current = null;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (key === 't') {
          event.preventDefault();
          router.push('/tasks/new');
          return;
        }
      }

      // Register trigger keys
      if (key === 'g' || key === 'c') {
        lastKeyRef.current = key;
        timeoutRef.current = setTimeout(() => {
          lastKeyRef.current = null;
        }, 1000); // 1 second window to complete the shortcut
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router]);
}

'use client';

import React, { useEffect, useState } from 'react';
import { ToastContainer } from '@/components/Toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const jokes = [
  "Compiling your destiny...",
  "Fixing bugs before they exist...",
  "404: Stress not found.",
  "Coffee converted into code successfully.",
  "Git commit -m 'Fixed typo in typo fix'...",
  "Optimizing layout for maximum procrastination...",
  "Centering a div... Please stand by...",
  "Locating the missing semicolon..."
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [jokeIndex, setJokeIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setJokeIndex((prev) => (prev + 1) % jokes.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#64748b12_1px,transparent_1px),linear-gradient(to_bottom,#64748b12_1px,transparent_1px)] bg-[size:18px_28px] pointer-events-none" />

      {/* Main Content Card Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl z-10 flex flex-col lg:flex-row justify-center items-stretch"
      >
        {children}
      </motion.div>

      {/* Joke Ticker */}
      <div className="mt-8 z-10 text-center h-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={jokeIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-xs sm:text-sm font-mono text-muted-foreground"
          >
            {jokes[jokeIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <ToastContainer />
    </div>
  );
}

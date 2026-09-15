'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check initial state
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);

    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('supermalazz-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('supermalazz-theme', 'light');
    }
  };

  // Avoid hydration mismatch by rendering placeholder until mounted
  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl border-2 border-[#0A1128] dark:border-slate-700 bg-white dark:bg-slate-800" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Mode Gelap (Dark Mode)'}
      aria-label="Toggle Dark Mode"
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl border-2 transition-all cursor-pointer select-none ${
        isDark
          ? 'bg-slate-900 text-amber-400 border-slate-700 shadow-[2px_2px_0px_#000000] hover:bg-slate-800'
          : 'bg-amber-50 text-amber-600 border-[#0A1128] shadow-[2px_2px_0px_#0A1128] hover:bg-amber-100'
      } hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
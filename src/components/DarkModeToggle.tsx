'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center h-10 w-20 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 bg-gray-200 dark:bg-gray-700"
      aria-label="Toggle dark mode"
    >
      {/* Toggle Background */}
      <span className="sr-only">Toggle dark mode</span>
      
      {/* Slider */}
      <span
        className={`${
          isDark ? 'translate-x-11' : 'translate-x-1'
        } inline-block h-8 w-8 transform rounded-full bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out flex items-center justify-center`}
      >
        {/* Icon */}
        {isDark ? (
          <MoonIcon className="h-5 w-5 text-indigo-400 animate-spin-in" />
        ) : (
          <SunIcon className="h-5 w-5 text-yellow-500 animate-spin-in" />
        )}
      </span>

      {/* Background Icons */}
      <span className="absolute left-2 top-2.5">
        <SunIcon className={`h-5 w-5 transition-opacity duration-300 ${isDark ? 'opacity-30 text-gray-400' : 'opacity-0'}`} />
      </span>
      <span className="absolute right-2 top-2.5">
        <MoonIcon className={`h-5 w-5 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-30 text-gray-500'}`} />
      </span>
    </button>
  );
}

import React, { useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

const ThemeToggle = () => {
    // Initialize state based on localStorage or system preference
    const [isDark, setIsDark] = useState(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            return true;
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-yellow-400 transition-all hover:scale-110 active:scale-90"
            aria-label="Toggle Theme"
        >
            {isDark ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
        </button>
    );
};

export default ThemeToggle;

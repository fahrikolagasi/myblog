import React, { useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

const ThemeToggleButton = () => {
    // Initial state check
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' ||
                (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    // Effect to apply class
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

    const toggleTheme = () => {
        setIsDark(prev => !prev);
    };

    return (
        <button
            onClick={toggleTheme}
            className="fixed top-6 right-6 z-50 p-3 rounded-full bg-gray-100 dark:bg-zinc-800 shadow-lg border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-yellow-400 hover:scale-110 active:scale-90 transition-all duration-300"
            aria-label="Toggle Theme"
        >
            {isDark ? <FaMoon /> : <FaSun />}
        </button>
    );
};

export default ThemeToggleButton;

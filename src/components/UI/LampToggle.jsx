import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';

const LampToggle = () => {
    const [isDark, setIsDark] = useState(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            return true;
        }
        return false;
    });

    const [isOn, setIsOn] = useState(!isDark); // "On" means Light mode (Lamp is on)

    // Physics
    const y = useMotionValue(0);
    const springY = useSpring(y, { stiffness: 400, damping: 15 });

    // Stretch effect for the cord string
    const stringHeight = useTransform(springY, [0, 200], [100, 300]);

    // Sync theme
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsOn(false);
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsOn(true);
        }
    }, [isDark]);

    const handleDragEnd = (_, info) => {
        // If pulled down more than 50px
        if (info.offset.y > 50) {
            setIsDark(!isDark);
            // Play sound effect (optional/conceptual)
        }
        y.set(0); // Snap back
    };

    return (
        <div className="fixed top-0 right-10 z-50 flex flex-col items-center">
            {/* The Cord */}
            <motion.div
                style={{ height: stringHeight }}
                className="w-1 bg-zinc-800 dark:bg-zinc-400 origin-top"
            />

            {/* The Handle / Knob */}
            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 150 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                style={{ y: springY }}
                className="cursor-grab active:cursor-grabbing touch-none"
            >
                <div className="w-4 h-8 bg-gradient-to-b from-zinc-700 to-zinc-900 rounded-full shadow-lg relative flex justify-center">
                    {/* Glow indicator on the handle */}
                    <div className={`absolute bottom-[-5px] w-2 h-2 rounded-full transition-all duration-300 ${isOn ? 'bg-yellow-400 shadow-[0_0_10px_orange]' : 'bg-gray-800'}`}></div>
                </div>
            </motion.div>
        </div>
    );
};

export default LampToggle;

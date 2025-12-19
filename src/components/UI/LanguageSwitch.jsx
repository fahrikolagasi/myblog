import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const LanguageSwitch = () => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const toggleLanguage = () => {
        const newLang = currentLang === 'tr' ? 'en' : 'tr';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="relative flex items-center justify-center w-16 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-pointer overflow-hidden transition-colors duration-300"
            aria-label="Toggle Language"
        >
            {/* Sliding Background Pill */}
            <motion.div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-zinc-600 rounded-full shadow-sm z-0"
                initial={false}
                animate={{
                    x: currentLang === 'tr' ? '-50%' : '50%'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            {/* Labels */}
            <div className="relative z-10 flex w-full justify-between px-2.5">
                <span
                    className={`text-[10px] font-bold tracking-wider transition-colors duration-300 ${currentLang === 'tr' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
                        }`}
                >
                    TR
                </span>
                <span
                    className={`text-[10px] font-bold tracking-wider transition-colors duration-300 ${currentLang === 'en' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
                        }`}
                >
                    EN
                </span>
            </div>
        </button>
    );
};

export default LanguageSwitch;

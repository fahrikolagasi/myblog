import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useSiteContent } from '../../context/SiteContext';

const Hero = () => {
    const { content, loading } = useSiteContent();
    const { profile } = content;

    if (loading) {
        return (
            <section className="w-full max-w-lg mx-auto z-10 px-6 py-8">
                <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-[#1a1b26]/90 dark:bg-white/90 backdrop-blur-xl border border-white/10 dark:border-zinc-200 shadow-2xl h-[400px] animate-pulse">
                    <div className="w-40 h-40 rounded-2xl bg-white/10 dark:bg-zinc-200 mb-6"></div>
                    <div className="h-8 w-48 bg-white/10 dark:bg-zinc-200 rounded mb-2"></div>
                    <div className="h-6 w-32 bg-white/10 dark:bg-zinc-200 rounded mb-4"></div>
                    <div className="w-full h-[1px] bg-white/10 dark:bg-zinc-200 mb-6"></div>
                    <div className="h-4 w-64 bg-white/10 dark:bg-zinc-200 rounded"></div>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full max-w-lg mx-auto z-10 px-6 py-8">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                // INVERTED THEME LOGIC: 
                // Light Mode (Default) -> Dark Card (Tokyo Night)
                // Dark Mode ('dark') -> White Card
                className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-[#1a1b26]/90 dark:bg-white/90 backdrop-blur-xl border border-white/10 dark:border-zinc-200 shadow-2xl overflow-hidden"
            >
                {/* 1. Square Profile Image with Glow */}
                <div className="mb-6 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                    <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-white/20 dark:border-zinc-200 shadow-xl">
                        <img
                            src={profile.image}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* 2. Info Block */}
                <div className="flex flex-col items-center mb-6">
                    {/* Text: White in Light Mode, Black in Dark Mode */}
                    <h1 className="text-3xl font-bold text-white dark:text-zinc-900 mb-2 tracking-tight">
                        {profile.name}
                    </h1>

                    <span className="px-3 py-1 rounded-full bg-zinc-800 dark:bg-zinc-100 text-sm font-medium text-zinc-300 dark:text-zinc-600 mb-2 border border-zinc-700 dark:border-zinc-200">
                        {profile.title}
                    </span>

                    <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-sm mt-1">
                        <FaMapMarkerAlt className="text-red-500" />
                        <span>{profile.location}</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-[1px] bg-white/10 dark:bg-zinc-200 mb-6"></div>

                {/* 3. Quote Section (Integrated) */}
                <blockquote className="relative max-w-sm mx-auto">
                    <p className="text-lg italic font-serif text-[#c0caf5] dark:text-zinc-700 leading-relaxed">
                        "{profile.quote}"
                    </p>
                    <footer className="mt-3 text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                        — {profile.quoteAuthor}
                    </footer>
                </blockquote>

            </motion.div>
        </section>
    );
};

export default Hero;

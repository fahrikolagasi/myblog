import React from 'react';
import { motion } from 'framer-motion';
import { useSiteContent } from '../../context/SiteContext';

const BioSection = () => {
    const { content, loading } = useSiteContent();
    const { bio, profile } = content;

    // Loading Skeleton
    if (loading) {
        return (
            <div className="w-full max-w-2xl mx-auto px-6 mb-20 space-y-8">
                {/* About Skeleton */}
                <div className="bg-zinc-800/10 dark:bg-zinc-800/50 rounded-2xl p-8 h-48 animate-pulse border border-white/5"></div>
                {/* Mission Skeleton */}
                <div className="bg-zinc-800/10 dark:bg-zinc-800/50 rounded-2xl p-8 h-56 animate-pulse border border-white/5"></div>
                {/* Education Skeleton */}
                <div className="space-y-4 pt-8">
                    <div className="h-4 w-32 bg-zinc-800/20 dark:bg-zinc-800/50 rounded mx-auto mb-8"></div>
                    <div className="pl-16 space-y-4">
                        <div className="h-24 bg-zinc-800/10 dark:bg-zinc-800/50 rounded-xl animate-pulse"></div>
                        <div className="h-24 bg-zinc-800/10 dark:bg-zinc-800/50 rounded-xl animate-pulse delay-100"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section className="w-full max-w-2xl mx-auto px-6 mb-20 z-10 relative space-y-8">

            {/* 1. About Me Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="group relative"
            >
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 blur group-hover:opacity-40 transition duration-1000"></div>

                <div className="relative bg-[#1a1b26]/90 dark:bg-white/90 backdrop-blur-xl rounded-2xl p-8 border border-white/10 dark:border-zinc-200/50 shadow-2xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 dark:text-blue-600 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                                Hakkımda
                            </h2>
                            <div className="h-1 w-12 bg-blue-500/50 rounded-full mt-1"></div>
                        </div>
                    </div>
                    <p className="text-zinc-300 dark:text-zinc-700 leading-loose text-base md:text-lg font-light">
                        {bio.about}
                    </p>
                </div>
            </motion.div>

            {/* 2. Mission Card (Featured) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e1e2e] to-[#151520] dark:from-zinc-50 dark:to-white border border-white/5 dark:border-zinc-200 p-8 shadow-2xl group"
            >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-[0.03] transform translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-64 w-64 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 dark:text-purple-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400 dark:text-purple-600">
                            Misyonum
                        </h2>
                    </div>
                    <blockquote className="text-xl md:text-2xl font-serif italic text-zinc-200 dark:text-zinc-800 leading-relaxed relative">
                        <span className="text-5xl text-purple-500/20 absolute -top-4 -left-2 font-sans">"</span>
                        {bio.mission}
                        <span className="text-5xl text-purple-500/20 absolute -bottom-8 -right-2 font-sans">"</span>
                    </blockquote>
                </div>
            </motion.div>

            {/* 3. Education Timeline */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="pt-8"
            >
                <div className="flex items-center gap-3 mb-8 px-4">
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-400 dark:via-zinc-600 to-transparent"></span>
                    <span className="text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Eğitim Yolculuğum</span>
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-400 dark:via-zinc-600 to-transparent"></span>
                </div>

                <div className="space-y-0 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-green-500/50 via-green-500/20 to-transparent"></div>

                    {bio.education && bio.education.map((edu, index) => (
                        <motion.div
                            key={edu.id}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3 }}
                            className="relative pl-16 py-4 group"
                        >
                            {/* Dot */}
                            <div className="absolute left-[20px] top-8 w-4 h-4 rounded-full bg-[#1a1b26] dark:bg-zinc-50 border-2 border-green-500 group-hover:scale-125 group-hover:bg-green-500 transition-all duration-300 z-10 shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>

                            {/* Card */}
                            <div className="bg-gradient-to-br from-[#1e1e2e] to-[#151520] dark:from-zinc-50 dark:to-white hover:to-[#2a2a35] dark:hover:to-zinc-100 rounded-xl p-5 border border-white/5 dark:border-zinc-200/50 hover:border-green-500/30 dark:hover:border-green-500/30 transition-all duration-300 group-hover:translate-x-2 shadow-lg">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                    <h3 className="font-bold text-zinc-100 dark:text-zinc-900 text-lg">
                                        {edu.school}
                                    </h3>
                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/10 text-green-400 dark:text-green-600 border border-green-500/20">
                                        {edu.year}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 dark:bg-zinc-400"></span> {edu.degree}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
};

export default BioSection;

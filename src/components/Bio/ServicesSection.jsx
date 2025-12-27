import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '../../context/SiteContext';

const ServiceCard = ({ item, isOpen, onClick, getIcon }) => (
    <motion.div
        layout
        onClick={onClick}
        className={`relative flex flex-col items-start p-5 rounded-2xl border cursor-pointer transition-colors duration-300 overflow-hidden 
            ${isOpen
                ? 'col-span-2 bg-[#1f2335] dark:bg-blue-50 border-blue-500/50 dark:border-blue-200 ring-2 ring-blue-500/20'
                : 'bg-[#1a1b26] dark:bg-white border-zinc-800 dark:border-zinc-200 hover:border-blue-500/50 dark:hover:border-blue-400'
            }`}
    >
        <motion.div layout className="flex items-center gap-3 w-full">
            <div className={`text-2xl transition-colors ${isOpen ? 'text-blue-400 dark:text-blue-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {getIcon(item.iconName)}
            </div>
            <div className="flex-1">
                <motion.h3 layout className="font-bold text-[#c0caf5] dark:text-zinc-800 text-sm">
                    {item.title}
                </motion.h3>
                {!isOpen && (
                    <motion.p layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-[#565f89] dark:text-zinc-500 mt-0.5">
                        {item.short}
                    </motion.p>
                )}
            </div>
            <motion.div layout className="text-zinc-300 dark:text-zinc-400 ml-auto">
                {isOpen ? '−' : '+'}
            </motion.div>
        </motion.div>

        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full"
                >
                    <div className="h-[1px] w-full bg-white/5 dark:bg-zinc-200 my-3"></div>
                    <p className="text-xs md:text-sm text-[#9aa5ce] dark:text-zinc-600 leading-relaxed">
                        {item.desc}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
);

const ServicesSection = () => {
    const [activeId, setActiveId] = useState(null);
    const { content, getIcon, loading } = useSiteContent();
    const { services } = content;

    if (loading) {
        return (
            <div className="w-full max-w-lg mx-auto px-6 mb-10">
                <div className="h-4 w-24 bg-zinc-800/50 rounded mb-4 mx-auto md:mx-0 animate-pulse"></div>
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-zinc-800/10 dark:bg-zinc-800/50 border border-white/5 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg mx-auto px-6 mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-[#565f89] mb-4 pl-1 text-center md:text-left">
                HİZMETLERİM
            </h2>
            <div className="grid grid-cols-2 gap-3 auto-rows-max">
                {services.map((service) => (
                    <ServiceCard
                        key={service.id}
                        item={service}
                        isOpen={activeId === service.id}
                        onClick={() => setActiveId(activeId === service.id ? null : service.id)}
                        getIcon={getIcon}
                    />
                ))}
            </div>
        </div>
    );
};

export default ServicesSection;

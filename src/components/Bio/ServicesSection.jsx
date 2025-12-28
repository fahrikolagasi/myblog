import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '../../context/SiteContext';

const ServiceCard = ({ item, isOpen, onClick, getIcon }) => (
    <div
        onClick={onClick}
        className={`relative flex flex-col items-start p-5 rounded-2xl border cursor-pointer transition-colors duration-300 overflow-hidden 
            ${isOpen
                ? 'col-span-2 bg-[#1f2335] dark:bg-blue-50 border-blue-500/50 dark:border-blue-200 ring-2 ring-blue-500/20'
                : 'bg-[#1a1b26] dark:bg-white border-zinc-800 dark:border-zinc-200 hover:border-blue-500/50 dark:hover:border-blue-400'
            }`}
    >
        <div className="flex items-center gap-3 w-full">
            <div className={`text-2xl transition-colors ${isOpen ? 'text-blue-400 dark:text-blue-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {getIcon(item.iconName)}
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-[#c0caf5] dark:text-zinc-800 text-sm">
                    {item.title}
                </h3>
                {!isOpen && (
                    <p className="text-xs text-[#565f89] dark:text-zinc-500 mt-0.5">
                        {item.short}
                    </p>
                )}
            </div>
            <div className="text-zinc-300 dark:text-zinc-400 ml-auto">
                {isOpen ? '−' : '+'}
            </div>
        </div>

        {isOpen && (
            <div
                className="w-full"
            >
                <div className="h-[1px] w-full bg-white/5 dark:bg-zinc-200 my-3"></div>
                <p className="text-xs md:text-sm text-[#9aa5ce] dark:text-zinc-600 leading-relaxed">
                    {item.desc}
                </p>
            </div>
        )}
    </div>
);

const ServicesSection = () => {
    const [activeId, setActiveId] = useState(null);
    const { content, getIcon, loading } = useSiteContent();
    const { services } = content;

    // Simplified: No Skeleton
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

import React from 'react';
import { motion } from 'framer-motion';
import { useSiteContent } from '../../context/SiteContext';

const BioSection = () => {
    const { content } = useSiteContent();
    const { bio, profile } = content;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-lg mx-auto px-6 mb-12 z-10 relative"
        >
            {/* INVERTED CARD */}
            <div className="bg-[#1a1b26]/80 dark:bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-zinc-800 dark:border-zinc-200 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-4">
                    Hakkımda
                </h2>
                <div className="space-y-4 text-zinc-300 dark:text-zinc-700 leading-relaxed text-sm md:text-base">
                    <p>
                        {bio.text1.replace('[Adınız]', profile.name)}
                    </p>
                    <p>
                        {bio.text2}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default BioSection;

import React from 'react';
import { motion } from 'framer-motion';

const QuoteSection = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-lg mx-auto px-6 mb-8 text-center"
        >
            <blockquote className="relative p-6 bg-transparent">
                <p className="text-lg italic font-serif text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    "Tasarım sadece nasıl göründüğü değil, nasıl çalıştığıdır."
                </p>
                <footer className="mt-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                    — Steve Jobs
                </footer>
            </blockquote>
        </motion.div>
    );
};

export default QuoteSection;

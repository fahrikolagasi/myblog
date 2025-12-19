import React, { useState } from 'react';
import { motion } from 'framer-motion';

const QuoteArea = () => {
    const [quote, setQuote] = useState("İlham veren sözünüzü buraya yazın...");
    const [isEditing, setIsEditing] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="max-w-2xl mx-auto px-6 mb-16 text-center"
        >
            <div className="relative p-8 rounded-2xl bg-glass-light backdrop-blur-sm border border-glass-border hover:border-luxury-gold/30 transition-colors duration-500">
                <span className="absolute top-4 left-6 text-6xl text-luxury-gold/20 font-serif leading-none">“</span>

                {isEditing ? (
                    <textarea
                        value={quote}
                        onChange={(e) => setQuote(e.target.value)}
                        onBlur={() => setIsEditing(false)}
                        autoFocus
                        className="w-full bg-transparent text-center font-serif text-xl md:text-2xl text-gray-200 italic focus:outline-none resize-none"
                        rows="2"
                    />
                ) : (
                    <p
                        onClick={() => setIsEditing(true)}
                        className="font-serif text-xl md:text-2xl text-gray-200 italic cursor-text hover:text-white transition-colors"
                    >
                        {quote}
                    </p>
                )}

                <span className="absolute bottom-[-10px] right-6 text-6xl text-luxury-gold/20 font-serif leading-none rotate-180">“</span>
            </div>
            <p className="mt-4 text-xs text-gray-500 font-sans tracking-wider opacity-60">
                (Düzenlemek için metne tıklayın)
            </p>
        </motion.div>
    );
};

export default QuoteArea;

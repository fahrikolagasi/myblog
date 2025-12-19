import React from 'react';
import { motion } from 'framer-motion';

const TurkishFlag = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center opacity-20 dark:opacity-10 pointer-events-none overflow-hidden">
            {/* Wave Container */}
            <motion.div
                animate={{
                    rotate: [0, 2, -2, 0],
                    scale: [1, 1.05, 1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-[300px] h-[200px] md:w-[600px] md:h-[400px] bg-[#E30A17] flex items-center justify-center shadow-2xl skew-y-2 rounded-sm"
            >
                {/* Crescent */}
                <div className="absolute left-[20%] w-[50%] h-[50%] bg-white rounded-full"></div>
                <div className="absolute left-[25%] w-[40%] h-[40%] bg-[#E30A17] rounded-full"></div>

                {/* Star */}
                <div className="absolute left-[70%] text-white text-[50px] md:text-[100px] transform rotate-[35deg]">
                    ★
                </div>

                {/* Wave Shine Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-pulse"></div>
            </motion.div>
        </div>
    );
};

export default TurkishFlag;

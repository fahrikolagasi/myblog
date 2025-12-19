import React from 'react';
import { motion } from 'framer-motion';

const ProfileHeader = () => {
    return (
        <div className="flex flex-col items-center justify-center pt-20 pb-10 px-4">
            {/* Image Box */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative group mb-8"
            >
                <div className="absolute -inset-1 bg-gradient-to-r from-luxury-gold to-white rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-2 border-glass-border shadow-2xl">
                    {/* Placeholder for user image */}
                    <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3000&auto=format&fit=crop"
                        alt="Profile"
                        className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
                    />
                </div>
            </motion.div>

            {/* Name & Title */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-center"
            >
                <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                    AD SOYAD
                </h1>
                <p className="text-luxury-gold/80 font-sans text-sm tracking-[0.2em] uppercase">
                    Developer & Visionary
                </p>
            </motion.div>
        </div>
    );
};

export default ProfileHeader;

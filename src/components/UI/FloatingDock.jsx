import React from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaPenNib, FaUser, FaEnvelope } from 'react-icons/fa';

const DockItem = ({ icon, label, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.2, y: -5 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className="relative group p-3 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 hover:border-white/20 backdrop-blur-md"
    >
        <span className="text-xl">{icon}</span>

        {/* Tooltip */}
        <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {label}
        </span>
    </motion.button>
);

const FloatingDock = () => {
    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-luxury-black/80 backdrop-blur-xl border border-white/10 shadow-2xl">
                <DockItem icon={<FaHome />} label="Home" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
                <DockItem icon={<FaPenNib />} label="Journal" onClick={() => { }} />
                <DockItem icon={<FaUser />} label="About" onClick={() => { }} />
                <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
                <DockItem icon={<FaEnvelope />} label="Contact" onClick={() => { }} />
            </div>
        </div>
    );
};

export default FloatingDock;

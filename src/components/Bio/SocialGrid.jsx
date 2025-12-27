import React from 'react';
import { motion } from 'framer-motion';
import { useSiteContent } from '../../context/SiteContext';

const SocialCard = ({ icon, label, href, color, glowColor, delay }) => {
    // If it's the "Mail" or "Bana Yazın" link (custom check), scroll to contact
    const handleScroll = (e) => {
        if (label === 'Mail' || label === 'E-posta' || href.includes('#contact')) {
            e.preventDefault();
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <motion.a
            href={href}
            onClick={handleScroll}
            target={href.includes('#') ? "_self" : "_blank"}
            rel="noopener noreferrer"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: delay, duration: 0.4 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            style={{ '--neon-color': glowColor }}
            className="group relative flex flex-col items-center justify-between p-6 rounded-2xl bg-zinc-900/40 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-700/50 transition-all duration-300 hover:border-[color:var(--neon-color)] hover:shadow-[0_0_20px_-5px_var(--neon-color)] w-full overflow-hidden aspect-square md:aspect-auto md:h-48 cursor-pointer"
        >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--neon-color)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Top: Center Icon - Always Large and Prominent */}
            <div className="z-10 bg-zinc-800/80 p-4 rounded-full border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-300 mb-auto mt-auto scale-125">
                <span className="text-3xl" style={{ color: color }}>
                    {icon}
                </span>
            </div>

            {/* Bottom: Label */}
            <div className="z-10 mt-auto text-center">
                <span className="block font-bold text-zinc-200 group-hover:text-white transition-colors text-sm tracking-wide">
                    {label === 'Mail' ? 'Bana Yazın' : label}
                </span>
                <div className="h-4 overflow-hidden relative">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest group-hover:text-[color:var(--neon-color)] transition-colors block mt-1">
                        {(() => {
                            const l = label.toLowerCase();
                            if (l.includes('mail') || l.includes('gmail')) return 'İLETİŞİME GEÇ';
                            if (l.includes('linkedin')) return 'BAĞLANTI KUR';
                            if (l.includes('github')) return 'PROJELERİME GÖZ AT';
                            return 'TAKİP ET';
                        })()}
                    </span>
                </div>
            </div>
        </motion.a>
    );
};

const SocialGrid = () => {
    const { content, getIcon } = useSiteContent();
    const { socials } = content;

    return (
        <div className="w-full max-w-lg mx-auto px-6 pb-24 z-10 relative">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mb-4 pl-1 text-center">
                SOSYAL AĞLAR
            </h3>

            <div className="grid grid-cols-2 gap-4">
                {socials.filter(s => s.show && s.platform !== 'WhatsApp').map((link, index) => (
                    <SocialCard
                        key={link.id}
                        icon={getIcon(link.iconName)}
                        label={link.platform}
                        href={link.url}
                        color={link.color}
                        glowColor={link.color}
                        delay={0.1 + (index * 0.1)}
                    />
                ))}
            </div>
        </div>
    );
};

export default SocialGrid;

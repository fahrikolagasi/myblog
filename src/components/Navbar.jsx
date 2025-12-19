import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useSiteContent } from '../context/SiteContext';

const Navbar = () => {
  const { content } = useSiteContent(); // Get dynamic content
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Safe Language Access
  const currentLang = i18n.language || 'tr';
  const isEn = currentLang.startsWith('en');

  // Theme Toggle Handler
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  // Initial Theme Setup
  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Scroll Handler
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Language Change Handler
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const navLinks = [
    { name: t('nav.home'), href: "#home" },
    { name: t('nav.about'), href: "#about" },
    { name: t('nav.services'), href: "#services" },
    { name: t('nav.projects'), href: "#projects" },
    { name: t('nav.contact'), href: "#contact" }
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md py-4 shadow-lg' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

        {/* Logo */}
        <a href="#" className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">
          {content.profile.name}<span className="text-blue-600">.</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">

          {/* Navigation Links */}
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white transition-colors"
            >
              {link.name}
            </a>
          ))}

          <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-2"></div>

          {/* Language Switcher (Pill Style) */}
          <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 rounded-full p-1 relative h-9 w-24 border-2 border-zinc-300 dark:border-zinc-700">
            {/* Sliding Pill Background */}
            <motion.div
              className="absolute bg-white dark:bg-zinc-600 rounded-full shadow-md h-6 top-1"
              initial={false}
              animate={{
                width: '45%',
                x: isEn ? '100%' : '0%'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            <button
              onClick={() => changeLanguage('tr')}
              className={`flex-1 relative z-10 text-xs font-bold text-center transition-colors duration-200 ${!isEn ? 'text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}
            >
              TR
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`flex-1 relative z-10 text-xs font-bold text-center transition-colors duration-200 ${isEn ? 'text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}
            >
              EN
            </button>
          </div>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-yellow-400 hover:scale-110 transition-transform">
            {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={18} />}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-zinc-900 dark:text-white text-2xl"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-xl md:hidden flex flex-col items-center py-8 gap-6"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-zinc-800 dark:text-zinc-200 hover:text-blue-600"
              >
                {link.name}
              </a>
            ))}

            <div className="flex items-center gap-6 mt-4">
              {/* Mobile Language Switcher (Pill Style) */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full p-1 relative h-10 w-28">
                <motion.div
                  className="absolute bg-white dark:bg-zinc-600 rounded-full shadow-sm h-8 top-1"
                  initial={false}
                  animate={{
                    width: '50%',
                    x: isEn ? '100%' : '0%'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />

                <button
                  onClick={() => { changeLanguage('tr'); setMobileMenuOpen(false); }}
                  className={`flex-1 relative z-10 text-sm font-bold text-center transition-colors duration-200 ${!isEn ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}
                >
                  TR
                </button>
                <button
                  onClick={() => { changeLanguage('en'); setMobileMenuOpen(false); }}
                  className={`flex-1 relative z-10 text-sm font-bold text-center transition-colors duration-200 ${isEn ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}
                >
                  EN
                </button>
              </div>

              <button onClick={toggleTheme} className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-yellow-400">
                {theme === 'dark' ? <FaSun size={20} /> : <FaMoon size={20} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

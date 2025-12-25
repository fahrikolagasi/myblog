import React from 'react';
import CoffeeTap from './CoffeeTap';

const Footer = () => {
  return (
    <footer className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 mt-20 pb-8">
      <div className="container mx-auto px-4">

        {/* Coffee Interaction Section */}
        <div className="flex justify-center mb-10">
          <CoffeeTap />
        </div>

        <div className="text-center text-zinc-500 dark:text-zinc-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Tüm Hakları Saklıdır.</p>
          <p className="mt-2 text-xs opacity-60">React & Tailwind & Firebase ile sevgiyle kodlandı.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

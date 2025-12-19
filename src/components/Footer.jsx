import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-void-900 text-glass-text py-8 text-center border-t border-glass-stroke">
      <p>&copy; {new Date().getFullYear()} Tüm Hakları Saklıdır.</p>
    </footer>
  );
};

export default Footer;


import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-8 bg-gray-100 text-center text-muted-foreground border-t">
      <div className="container mx-auto">
        <p>&copy; {currentYear} Mindmap Genius. All rights reserved.</p>
        <p className="text-sm mt-1">
          Built with <span className="text-red-500">&hearts;</span> by Lovable.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

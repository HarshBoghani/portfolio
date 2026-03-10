'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

function Navbar() {
  const pathname = usePathname();
  const navItems = [
    // { title: 'Home', route: '/' },
    { title: 'Projects', route: '/projects' },
    { title: 'Contact', route: '/contact' },
  ];

  return (
    <nav className="flex justify-center gap-6 p-6 text-neutral-400 relative z-10">
      {navItems.map((item) => (
        <motion.a
          key={item.route}
          href={item.route}
          className={`text-sm hover:text-white transition-colors ${pathname === item.route ? 'text-white' : ''}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {item.title}
        </motion.a>
      ))}
    </nav>
  );
}

export default Navbar;

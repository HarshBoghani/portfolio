'use client';

import { motion } from 'framer-motion';
import ParticleEffect from './_components/ParticleEffect';
import Navbar from './_components/Navbar';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projects } from '@/lib/info';

export default function HomeClient() {
  const router = useRouter();

  // Comprehensive prefetching for all pages and data
  useEffect(() => {
    // Prefetch main pages
    const routesToPrefetch = ['/projects', '/contact'];

    routesToPrefetch.forEach((route: string) => {
      router.prefetch(route);
    });

    // Prefetch all individual project pages
    projects.forEach((project) => {
      router.prefetch(`/projects/${project.id}`);
    });

    // Prefetch API routes to warm up the cache
    const prefetchAPIs = async () => {
      try {
        // Prefetch view data for the first project (just to warm up)
        if (projects.length > 0) {
          await fetch(`/api/view?id=${projects[0].id}`, { cache: 'no-store' });
        }

        console.log('All pages and data prefetched successfully');
      } catch (error) {
        console.log('Prefetching completed with some warnings:', error);
      }
    };

    prefetchAPIs();
  }, [router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden"
    >
      <ParticleEffect />
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center gap-6 p-6 relative z-10">
        <motion.h1
          className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
        >
          Dev Italiya
        </motion.h1>
        <motion.p
          className="text-neutral-400 text-sm md:text-base max-w-[600px] text-center"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
        >
          I'm building web applications and websites for clients around the
          world.
        </motion.p>

        {/* Available for Work Indicator */}
        <motion.div
          className="flex items-center gap-3 text-neutral-300"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
        >
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <span className="text-sm font-medium">Available for work</span>
        </motion.div>
      </main>
    </motion.div>
  );
}

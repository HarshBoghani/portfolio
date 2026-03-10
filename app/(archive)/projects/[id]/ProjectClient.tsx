'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpRight,
  EyeIcon,
  Github,
  Instagram,
} from 'lucide-react';
import ParticleEffect from '../../_components/ParticleEffect';
import OldPageBanner from '../../_components/OldPageBanner';
import React, { useState, useEffect } from 'react';
import { Project } from '@/lib/info';
import Link from 'next/link';
import NumberFlow from '@number-flow/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ProjectClientProps {
  project: Project;
}

export default function ProjectClient({ project }: ProjectClientProps) {
  const [currentViews, setCurrentViews] = useState(project.views);

  // Listen for custom events from ViewIncrementer
  useEffect(() => {
    const handleViewIncrement = (event: CustomEvent) => {
      if (event.detail.projectId === project.id) {
        setCurrentViews(event.detail.newViews);
      }
    };

    window.addEventListener(
      'viewIncremented',
      handleViewIncrement as EventListener
    );

    return () => {
      window.removeEventListener(
        'viewIncremented',
        handleViewIncrement as EventListener
      );
    };
  }, [project.id]);

  const formatViews = (views: number) => {
    return views < 1000 ? views : parseFloat((views / 1000).toFixed(0));
  };

  const getViewsSuffix = (views: number) => {
    return views < 1000 ? '' : 'K';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden"
    >
      <OldPageBanner />
      <ParticleEffect />
      <nav className="flex justify-between items-center p-6 z-10 relative">
        <Link
          href="/projects"
          className="text-sm text-neutral-400 hover:text-white transition-colors inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
        <div className="text-sm text-neutral-400 flex items-center">
          <EyeIcon className="h-4 w-4 mr-1" />
          <NumberFlow
            value={formatViews(currentViews)}
            format={{
              notation: 'standard',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }}
            locales="en-US"
            className="inline-block font-satoshi-bold"
          />
          <span className="font-satoshi-light">
            {getViewsSuffix(currentViews)}
          </span>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-start justify-start gap-12 p-6 relative z-10 max-w-4xl mx-auto w-full">
        <motion.div
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4 font-mono">
            {project.title}

          </h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags &&
              project.tags.length > 0 &&
              project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-neutral-800 text-neutral-300 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-neutral-400 mr-3 hover:text-white transition-colors ml-10 ${
                  project.github === 'private' ? 'pointer-events-none' : ''
                }`}
              >
                {project.github === 'private' ? (
                  'Private Repo'
                ) : (
                  <Github className="h-6 w-6" />
                )}
              </a>
            )}
            {project.href && (
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowUpRight className="h-6 w-6" />
              </a>
            )}
            {project.instagram && (
              <a
                href={project.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
            )}
          </div>
          <p className="text-neutral-400 text-lg mb-8 font-mono">
            {project.description}
          </p>



          <div className="text-neutral-300 prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-white mb-4 mt-6 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold text-white mb-3 mt-6 first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-medium text-white mb-2 mt-4 first:mt-0">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-neutral-300 mb-3 leading-relaxed font-mono">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 mb-4 text-neutral-300 font-mono ml-4">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-4 text-neutral-300 font-mono ml-4">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-neutral-300 leading-relaxed">
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="text-white font-semibold">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="text-neutral-200 italic">{children}</em>
                ),
                code: ({ children }) => (
                  <code className="bg-neutral-800 px-2 py-1 rounded text-sm text-neutral-200 font-mono">
                    {children}
                  </code>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-neutral-600 pl-4 my-4 text-neutral-300 italic">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline transition-colors"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {project.longDescription}
            </ReactMarkdown>
          </div>
        </motion.div>

        <motion.div
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
        >
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <ul
            className={`list-disc list-inside space-y-2 text-neutral-300 font-mono`}
          >
            {project.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
        >
          <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech, index) => (
              <span
                key={index}
                className="bg-neutral-800 text-neutral-300 px-3 py-1 rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="h-16 md:h-20"></div>
      </main>
    </motion.div>
  );
}

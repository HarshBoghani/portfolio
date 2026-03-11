'use client';

import { ExternalLink } from 'lucide-react';

export default function PortfolioProjects() {
  const projects = [
    {
      title: 'C++ Trie Engine',
      description: 'A high-performance search engine built with C++ Trie data structure, featuring real-time autocomplete recommendations and fast file search capabilities.',
      link: 'https://github.com/HarshBoghani/trie-mini-search-engine', // assuming, or leave blank
    },
    {
      title: 'KronosDB: High-Performance C++ Key-Value Store',
      description: 'A persistent, high-performance, and concurrent key-value database server built from the ground up in C++ with Boost.Asio and lock striping.',
      link: 'https://github.com/HarshBoghani/KronosDB', // assuming
    },
    {
      title: 'Distributed Rate Limiter in C++',
      description: 'A high-performance, distributed rate limiter microservice built in C++ using gRPC, Redis, and atomic Lua scripts for Token Bucket algorithm.',
      link: 'https://github.com/HarshBoghani/Limitron', // assuming
    },
  ];

  return (
    <section className="mb-16">
      <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200">
        Projects
      </h2>
      <div className="space-y-6">
        {projects.map((project, index) => (
          <div key={index} className="border-b border-neutral-200 dark:border-neutral-800/50 pb-4 last:border-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-neutral-800 dark:text-white mb-2">
                  {project.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {project.description}
                </p>
              </div>
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
'use client';

import { ExternalLink } from 'lucide-react';

export default function PortfolioBlogs() {
  const blogs = [
    {
      title: 'All About Competitive Programming',
      description: 'A comprehensive guide to competitive programming levels and topics on Codeforces, covering Pupil, Specialist, and Expert levels with hand-picked resources.',
      link: 'https://medium.com/@thrilled_bisque_gnu_255/all-about-competitive-programming-b8ee9e53d844',
      date: 'Dec 2, 2024',
    },
    {
      title: 'Exploring Prime Factorization and the Sieve of Eratosthenes in Number Theory',
      description: 'Deep dive into prime factorization algorithms and the Sieve of Eratosthenes, with C++ implementations for prime checking and factorization.',
      link: 'https://medium.com/@thrilled_bisque_gnu_255/exploring-prime-factorization-and-the-sieve-of-eratosthenes-in-number-theory-934a363f4507',
      date: 'Dec 12, 2024',
    },
  ];

  return (
    <section className="mb-16">
      <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200">
        blogs
      </h2>
      <div className="space-y-6">
        {blogs.map((blog, index) => (
          <div key={index} className="border-b border-neutral-200 dark:border-neutral-800/50 pb-4 last:border-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-neutral-800 dark:text-white mb-2">
                  {blog.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-2">
                  {blog.description}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  {blog.date}
                </p>
              </div>
              <a
                href={blog.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors flex-shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
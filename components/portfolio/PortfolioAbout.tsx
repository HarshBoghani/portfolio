'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function PortfolioAbout() {
  return (
    <section className="mb-16">
      <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200">
        About
      </h2>
      <div className="space-y-5 text-neutral-600 dark:text-neutral-500 leading-relaxed">
        <p>
          I build high-performance C++ systems and spend a lot of time on competitive programming and algorithmic thinking.
        </p>
      </div>
    </section>
  );
}

'use client';

import { useState } from 'react';
import { Twitter, Globe, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HumanEntry } from './types';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function HumanCard({ name, imageUrl, links }: HumanEntry) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = imageUrl && !imageFailed;
  const initials = getInitials(name);
  const hasLinks = links.x || links.portfolio || links.product;

  return (
    <div
      className={cn(
        'flex items-center gap-4 w-full rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700',
        'min-h-[70px] max-h-[100px] h-[84px] p-3'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 rounded-full border-2 border-dashed border-neutral-300 dark:border-neutral-600',
          'overflow-hidden flex items-center justify-center',
          'w-12 h-12 sm:w-14 sm:h-14 bg-neutral-100 dark:bg-neutral-800'
        )}
      >
        {showImage ? (
          <img
            src={imageUrl}
            alt=""
            width={56}
            height={56}
            className="w-full h-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span
            className="text-sm font-medium text-neutral-600 dark:text-neutral-400"
            aria-hidden
          >
            {initials}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
          {name}
        </span>
        {hasLinks && (
          <div className="flex flex-wrap items-center gap-3">
            {links.x && (
              <a
                href={links.x}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors inline-flex items-center justify-center"
                aria-label="X"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 1200 1227"
                  className="shrink-0"
                  aria-hidden
                >
                  <path d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z" />
                </svg>
              </a>
            )}
            {links.portfolio && (
              <a
                href={links.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                aria-label="Portfolio"
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
            {links.product && (
              <a
                href={links.product}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                aria-label="Product"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductEntry } from './types';

export default function ProductCard({
  name,
  link,
  reason,
  logoUrl,
}: ProductEntry) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 w-full rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700',
        'min-h-[70px] p-3'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 overflow-hidden flex items-center justify-center',
          'w-12 h-12 sm:w-14 sm:h-14'
        )}
      >
        <Image
          src={logoUrl}
          alt=""
          width={56}
          height={56}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
          {name}
        </span>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
          {reason}
        </p>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors w-fit"
            aria-label="Link"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span className="text-xs">link</span>
          </a>
        )}
      </div>
    </div>
  );
}

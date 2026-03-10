'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MovieEntry } from './types';

export default function MovieCard({
  title,
  posterUrl,
  year,
  link,
}: MovieEntry) {
  return (
    <div
      className={cn(
        'w-full rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 overflow-hidden',
        'flex flex-col'
      )}
    >
      <div className="relative w-full aspect-[2/3] border-b border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
        <Image
          src={posterUrl}
          alt=""
          fill
          sizes="(max-width: 400px) 50vw, 200px"
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="p-3 flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
          {title}
          {year && (
            <span className="font-normal text-neutral-500 dark:text-neutral-400 ml-1">
              ({year})
            </span>
          )}
        </span>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors w-fit"
            aria-label="Watch or more info"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span className="text-xs">link</span>
          </a>
        )}
      </div>
    </div>
  );
}

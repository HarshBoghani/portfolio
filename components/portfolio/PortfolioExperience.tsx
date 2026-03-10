'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
// import { getInitials } from './utils';
import {
  experienceByCategory,
  categoryLabels,
  categoryOrder,
  type ExperienceItem,
} from '@/lib/experience';

function ExperienceRow({
  item,
  isOpen,
  onToggle,
}: {
  item: ExperienceItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const hasDetails = item.description || item.links.length > 0;

  return (
    <li className="border-b border-neutral-200 dark:border-neutral-800/50 last:border-0">
      <div
        className={
          hasDetails
            ? 'flex items-center gap-4 py-3 cursor-pointer'
            : 'flex items-center gap-4 py-2'
        }
        onClick={() => hasDetails && onToggle()}
        role={hasDetails ? 'button' : undefined}
        aria-expanded={hasDetails ? isOpen : undefined}
        aria-label={hasDetails ? 'Toggle details' : undefined}
      >
        {/* <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-medium text-neutral-400">
          {getInitials(item.name)}
        </div> */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-neutral-800 dark:text-white flex items-baseline gap-2 flex-wrap">
            {item.name}
            {item.private && (
              <span className="text-[10px] font-normal text-neutral-400 dark:text-neutral-500 tracking-wide">
                (private)
              </span>
            )}
          </div>
          {(item.role || item.roleLink) && (
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {item.role}
              {item.roleLink && (
                <a
                  href={item.roleLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors underline decoration-neutral-400 dark:decoration-neutral-600 underline-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.roleLink.text}
                </a>
              )}
            </div>
          )}
        </div>
        <span className="flex-shrink-0 text-sm text-neutral-600 dark:text-neutral-500">
          {item.date}
        </span>
        {hasDetails && (
          <span
            className="flex-shrink-0 p-1.5 text-neutral-600 dark:text-neutral-500 transition-transform duration-200"
            aria-hidden
          >
            <ChevronDown className={`h-4 w-4 ${isOpen ? 'rotate-180' : ''}`} />
          </span>
        )}
      </div>
      {hasDetails && isOpen && (
        <div className="pb-4 pr-4 pt-0">
          {item.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              {item.description}
            </p>
          )}
          {item.links.length > 0 && (
            <ul className="list-disc list-inside space-y-1.5 py-1 text-sm text-neutral-600 dark:text-neutral-400 [&_li]:marker:text-pink-400">
              {item.links.map((href, j) => (
                <li key={j}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-neutral-900 dark:hover:text-white transition-colors truncate inline-block align-top"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {href.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

export default function PortfolioExperience() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  // Collect all items from all categories
  const allItems = categoryOrder.flatMap((category) => 
    experienceByCategory[category].map((item, i) => ({
      ...item,
      key: `${category}-${item.name}-${i}`,
    }))
  );

  return (
    <section className="mb-16">
      <h2 className="text-lg font-semibold mb-6 text-neutral-800 dark:text-white">
        cool places i worked at
      </h2>

      <ul className="space-y-0">
        {allItems.map((item) => {
          const isOpen = openKey === item.key;

          return (
            <ExperienceRow
              key={item.key}
              item={item}
              isOpen={isOpen}
              onToggle={() => setOpenKey(isOpen ? null : item.key)}
            />
          );
        })}
      </ul>
    </section>
  );
}

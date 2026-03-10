'use client';

import { useEffect, useState } from 'react';

export default function PageViews() {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function incrementAndFetch() {
      try {
        const res = await fetch('/api/main-page/increment', { method: 'POST' });
        const data = await res.json();
        if (mounted && typeof data.views === 'number') {
          setViews(data.views);
        }
      } catch {
        if (mounted) setViews(null);
      }
    }

    incrementAndFetch();
    return () => {
      mounted = false;
    };
  }, []);

  if (views === null) {
    return (
      <span
        className="inline-block h-3.5 w-14 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse font-mono text-xs"
        aria-label="Loading view count"
      />
    );
  }

  return (
    <span className="text-xs text-neutral-600 dark:text-neutral-500 font-mono">
      {views} {views === 1 ? 'view' : 'views'}
    </span>
  );
}

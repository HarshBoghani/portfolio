'use client';

import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'initial-blur-reveal-shown';

function getHasShownBefore(): boolean {
  if (typeof window === 'undefined') return false;
  return !!sessionStorage.getItem(STORAGE_KEY);
}

/**
 * Wraps content and plays a blur-to-clear animation on first page load.
 * Matches the blur effect used during theme transitions (blur(8px) → blur(0px)).
 * Only runs once per session to avoid repetition on client-side navigation.
 */
export function InitialBlurReveal({ children }: { children: React.ReactNode }) {
  const [hasShownBefore] = useState(getHasShownBefore);

  useEffect(() => {
    if (!hasShownBefore && typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }
  }, [hasShownBefore]);

  return (
    <div
      className={!hasShownBefore ? 'initial-blur-reveal' : undefined}
      style={!hasShownBefore ? { willChange: 'filter' } : undefined}
    >
      {children}
    </div>
  );
}

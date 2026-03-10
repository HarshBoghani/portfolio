'use client';

import React from 'react';

export default function LiveTime() {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <span className="text-xs text-neutral-600 dark:text-neutral-500 font-mono">
      {time.toLocaleTimeString()}
    </span>
  );
}

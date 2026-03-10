'use client';

import { useThemeToggle } from '@/components/portfolio/skipper-toggle';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { isDark, toggleTheme } = useThemeToggle({
    variant: 'circle',
    start: 'center',
    blur: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="size-9 rounded-full"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'size-9 rounded-full text-neutral-500 hover:text-foreground dark:text-neutral-400 dark:hover:text-white'
      )}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

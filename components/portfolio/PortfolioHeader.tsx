'use client';

import Image from 'next/image';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from 'next-themes';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const skills = [
  { name: 'C++', icon: '/skills/cpp.svg' },
  { name: 'Java', icon: '/skills/java.svg' },
  { name: 'Python', icon: '/skills/python.svg' },
  { name: 'JavaScript', icon: '/skills/js.svg' },
  { name: 'TypeScript', icon: '/skills/ts.svg' },
  { name: 'Docker', icon: '/skills/docker.svg' },
  { name: 'PostgreSQL', icon: '/skills/pg.svg' },
  { name: 'Prisma', icon: '/skills/prisma.svg', darkInvert: true },
];

export default function PortfolioHeader() {
  const { theme } = useTheme();
  return (
    <header className="flex justify-between items-start gap-8 mb-16">
      <div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 text-neutral-800 dark:text-neutral-200">
          Hi, harsh here
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-3">
          Computer Engineer | Competitive Programmer
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <TooltipProvider delayDuration={0}>
            {skills.map(({ name, icon, darkInvert }) => (
              <Tooltip key={name}>
                <TooltipTrigger asChild>
                  <span
                    className={`inline-flex cursor-default ${darkInvert ? 'dark:bg-white dark:rounded dark:p-0.5' : ''}`}
                  >
                    <Image
                      src={icon}
                      alt={name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-transparent border-0 p-0 text-neutral-600 dark:text-neutral-400 text-sm font-medium"
                >
                  {name}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <ThemeToggle />
        {theme === 'dark' ? (
          <Image
            src="/odsy-dark.jpg"
            alt="Harsh Boghani"
            width={80}
            height={80}
            className="rounded-full object-cover w-16 h-16 md:w-20 md:h-20"
          />
        ) : (
          <Image
            src="/odsy-light.jpg"
            alt="Harsh Boghani"
            width={80}
            height={80}
            className="rounded-full object-cover w-16 h-16 md:w-20 md:h-20"
          />
        )}
      </div>
    </header>
  );
}

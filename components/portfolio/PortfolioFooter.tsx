'use client';

import { socialLinks } from '@/lib/info';
import LiveTime from '@/components/ui/LiveTime';
import PageViews from '@/components/ui/PageViews';
import { FileText } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function PortfolioFooter() {
  const footerLinks = socialLinks.filter((link) =>
    ['Github', 'Twitter', 'Linkedin', 'Email', 'Instagram', 'Medium'].includes(
      link.label
    )
  );

  return (
    <footer className="mt-16 mb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <TooltipProvider delayDuration={200}>
            {footerLinks.map((link) => {
              const IconComponent = link.icon;
              const isMedium = link.label === 'Medium';
              const isX = link.label === 'Twitter';
              return (
                <Tooltip key={link.label}>
                  <TooltipTrigger asChild>
                    <a
                      href={link.href}
                      target={
                        link.href.startsWith('mailto:') ? undefined : '_blank'
                      }
                      rel={
                        link.href.startsWith('mailto:')
                          ? undefined
                          : 'noopener noreferrer'
                      }
                      className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors inline-flex items-center justify-center"
                    >
                      {isMedium ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 -55 256 256"
                          fill="currentColor"
                          className="shrink-0"
                          aria-hidden
                        >
                          <path d="M72.2009141,1.42108547e-14 C112.076502,1.42108547e-14 144.399375,32.5485469 144.399375,72.6964154 C144.399375,112.844284 112.074049,145.390378 72.2009141,145.390378 C32.327779,145.390378 0,112.844284 0,72.6964154 C0,32.5485469 32.325326,1.42108547e-14 72.2009141,1.42108547e-14 Z M187.500628,4.25836743 C207.438422,4.25836743 223.601085,34.8960455 223.601085,72.6964154 L223.603538,72.6964154 C223.603538,110.486973 207.440875,141.134463 187.503081,141.134463 C167.565287,141.134463 151.402624,110.486973 151.402624,72.6964154 C151.402624,34.9058574 167.562834,4.25836743 187.500628,4.25836743 Z M243.303393,11.3867175 C250.314,11.3867175 256,38.835526 256,72.6964154 C256,106.547493 250.316453,134.006113 243.303393,134.006113 C236.290333,134.006113 230.609239,106.554852 230.609239,72.6964154 C230.609239,38.837979 236.292786,11.3867175 243.303393,11.3867175 Z" />
                        </svg>
                      ) : isX ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="currentColor"
                          viewBox="0 0 1200 1227"
                          className="shrink-0"
                          aria-hidden
                        >
                          <path d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z" />
                        </svg>
                      ) : (
                        <IconComponent className="h-5 w-5" />
                      )}
                    </a>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
                  >
                    {isX ? 'X' : link.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://resume.devitaliya.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  <FileText className="h-5 w-5 shrink-0" aria-hidden />
                </a>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
              >
                Resume
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <LiveTime />
          <span
            className="w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-600 shrink-0"
            aria-hidden
          />
          <PageViews />
        </div>
      </div>
    </footer>
  );
}

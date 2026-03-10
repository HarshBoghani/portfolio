'use client';

import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import PortfolioHeader from './PortfolioHeader';
import PortfolioAbout from './PortfolioAbout';
import PortfolioProfiles from './PortfolioProfiles';
import PortfolioExperience from './PortfolioExperience';
import PortfolioProjects from './PortfolioProjects';
import PortfolioBlogs from './PortfolioBlogs';
import PortfolioFooter from './PortfolioFooter';
import RatingGraph from './RatingGraph';
import Heatmap from './Heatmap';

export default function PortfolioContent() {
  return (
    <div className="flex w-full min-h-screen justify-center">
      {/* Left wall - only when > 750px, grows 0–50px */}
      <div
        className="hidden min-[751px]:block wall-pattern flex-1 min-w-0 max-w-[50px] min-h-screen flex-shrink-0"
        aria-hidden
      />
      <main className="w-full max-w-[750px] flex-shrink-0">
        <div className="relative w-full overflow-hidden min-[751px]:rounded-t-lg pt-6 px-4">
          <RatingGraph handle="HarshBoghani" />
        </div>
        <div className="px-4 min-[828px]:px-6 pb-8 pt-8">
          <PortfolioHeader />
          <Separator className="my-4 h-0 border-t border-dashed border-neutral-300 dark:border-neutral-800 bg-transparent" />
          <PortfolioAbout />
          <Separator className="my-4 h-0 border-t border-dashed border-neutral-300 dark:border-neutral-800 bg-transparent" />
          <PortfolioProfiles />
          <Separator className="my-4 h-0 border-t border-dashed border-neutral-300 dark:border-neutral-800 bg-transparent" />
          <PortfolioExperience />
          <Separator className="my-4 h-0 border-t border-dashed border-neutral-300 dark:border-neutral-800 bg-transparent" />
          <PortfolioProjects />
          <Separator className="my-4 h-0 border-t border-dashed border-neutral-300 dark:border-neutral-800 bg-transparent" />
          <PortfolioBlogs />
          <Separator className="my-4 h-0 border-t border-dashed border-neutral-300 dark:border-neutral-800 bg-transparent" />
          <div className="pb-8"><Heatmap handle="HarshBoghani" /></div>
          <Separator className="my-4 h-0 border-t border-dashed border-neutral-300 dark:border-neutral-800 bg-transparent" />
          <PortfolioFooter />
        </div>
      </main>
      {/* Right wall - only when > 750px, grows 0–50px */}
      <div
        className="hidden min-[751px]:block wall-pattern flex-1 min-w-0 max-w-[50px] min-h-screen flex-shrink-0"
        aria-hidden
      />
    </div>
  );
}

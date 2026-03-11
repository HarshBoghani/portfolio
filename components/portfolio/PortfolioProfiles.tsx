'use client';

import { ExternalLink } from 'lucide-react';

export default function PortfolioProfiles() {
  const profiles = [
    {
      name: 'Codeforces  (Expert)',
      handle: 'HarshBoghani',
      url: 'https://codeforces.com/profile/HarshBoghani',
      maxRating: '1685',
      description: 'Competitive programming platform',
    },
    {
      name: 'LeetCode  (Top 1.5%)',
      handle: 'hr_boghani',
      url: 'https://leetcode.com/u/hr_boghani/',
      maxRating: '2150',
      description: 'Algorithm and coding interview prep',
    },
  ];

  return (
    <section className="mb-16">
      <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200">
        Profiles
      </h2>
      <div className="space-y-4">
        {profiles.map((profile) => (
          <div key={profile.name} className="flex items-center justify-between">
            <div>
              <div className="font-medium text-neutral-800 dark:text-white">
                {profile.name}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {profile.handle} • Max Rating: {profile.maxRating}
              </div>
            </div>
            <a
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
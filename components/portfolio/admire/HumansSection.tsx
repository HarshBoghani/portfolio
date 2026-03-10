'use client';

import HumanCard from './HumanCard';
import { HUMANS_PLACEHOLDER } from './humans-data';

export default function HumansSection() {
  return (
    <section className="space-y-3 pb-12">
      {HUMANS_PLACEHOLDER.map((human) => (
        <HumanCard key={human.id} {...human} />
      ))}
      <p className="text-sm text-neutral-500 dark:text-neutral-400 pt-2">
       ofc order didn&apos;t matter
      </p>
    </section>
  );
}

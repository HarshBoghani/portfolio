import { getInitials } from './utils';
import Link from 'next/link';

const education = [
  {
    school: 'B.Tech CS',
    degree: '9.21 CGPA',
    period: '2022-26',
    href: '',
    subtitle: 'Surat, India',
  },
];

export default function PortfolioEducation() {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-6 text-neutral-800 dark:text-neutral-200">
        education
      </h2>
      <ul className="space-y-4">
        {education.map((edu, i) => (
          <li
            key={i}
            className="flex items-center gap-4 py-2 border-b border-neutral-200 dark:border-neutral-800/50 last:border-0"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {getInitials(edu.school)}
            </div>
            <div className="flex-1 min-w-0">
              {edu.href ? (
                <Link
                  href={edu.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-neutral-800 dark:text-neutral-200 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                >
                  {edu.school}
                </Link>
              ) : (
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {edu.school}
                </span>
              )}
              <span className="text-neutral-600 dark:text-neutral-400">
                {' '}
                · {edu.degree}
              </span>
              <br />
              <span className="text-neutral-600 dark:text-neutral-400">
                {' '}
                {edu.subtitle}
              </span>
            </div>
            <span className="flex-shrink-0 text-sm text-neutral-600 dark:text-neutral-500">
              {edu.period}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

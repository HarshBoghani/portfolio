export type ExperienceCategory =
  | 'internship'
  | 'teaching';

export interface ExperienceItem {
  name: string;
  role?: string;
  roleLink?: { text: string; href: string };
  date: string;
  sortDate: string; // YYYY-MM-DD for sorting
  links: string[];
  description?: string;
  private?: boolean;
}

function parseSortDate(dateStr: string): string {
  const months: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    june: '06', july: '07', jul: '07', aug: '08', sept: '09', sep: '09',
    oct: '10', nov: '11', dec: '12',
  };
  if (dateStr.toLowerCase() === 'present') return '2099-12-31';
  const parts = dateStr.toLowerCase().replace(/,/g, '').split(/\s+/);
  if (parts.includes('–') && parts.length >= 5) {
    const month = months[parts[3]] || '01';
    const year = parts[4];
    if (/^\d{4}$/.test(year)) return `${year}-${month}-01`;
  }
  if (parts.length >= 3) {
    const month = months[parts[0].replace(/^0/, '')] || parts[0];
    const day = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  if (parts.length === 2) {
    const month = months[parts[0]] || '01';
    const year = parts[1];
    return `${year}-${month}-01`;
  }
  return dateStr;
}

function item(
  name: string,
  date: string,
  links: string[] = [],
  role?: string,
  roleLink?: { text: string; href: string },
  isPrivate?: boolean,
  description?: string
): ExperienceItem {
  return {
    name,
    role,
    roleLink,
    date,
    sortDate: parseSortDate(date),
    links: links.filter(Boolean),
    description,
    ...(isPrivate && { private: true }),
  };
}

export const experienceByCategory: Record<ExperienceCategory, ExperienceItem[]> = {
  internship: [
    item(
      'VideoSDK',
      'Jan 2026 – Apr 2026',
      ['https://videosdk.live/'],
      'Backend Developer',
      undefined,
      false,
      'Worked on WebRTC system, implemented scripts for merging media streams, and optimized video processing pipelines, gained experience of api development and real-time communication technologies.'
    ),
  ],
  teaching: [
    item(
      'Code Daily',
      'Jan 2025 – Jun 2025',
      ['https://acodedaily.com/'],
      'Mentor',
      undefined,
      false,
      'Mentored students in Data Structures and Algorithms, Competitive Programming in community of 15000+ members, conducted live problem-solving sessions and provided personalized feedback to help students improve their coding skills and performance in competitive programming contests.'
    ),
  ],
};

function sortByDateDesc(items: ExperienceItem[]): ExperienceItem[] {
  return [...items].sort((a, b) => b.sortDate.localeCompare(a.sortDate));
}

Object.keys(experienceByCategory).forEach((key) => {
  const cat = key as ExperienceCategory;
  if (cat !== 'teaching') {
    experienceByCategory[cat] = sortByDateDesc(experienceByCategory[cat]);
  }
});

export const categoryLabels: Record<ExperienceCategory, string> = {
  internship: 'internships',
  teaching: 'teaching',
};

export const categoryOrder: ExperienceCategory[] = [
  'internship',
  'teaching',
];

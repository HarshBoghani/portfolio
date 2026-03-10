import type { ProductEntry } from './types';

export const PRODUCTS_PLACEHOLDER: ProductEntry[] = [
  {
    id: 'linear',
    name: 'Linear',
    link: 'https://linear.app/',
    reason: 'Sync engine.',
    logoUrl: '/linear-logo.svg',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    link: 'https://vercel.com',
    reason: 'Fluid compute.',
    logoUrl: '/vercel-logo.svg',
  },
  {
    id: 'shadcn',
    name: 'shadcn/ui',
    link: 'https://ui.shadcn.com/',
    reason: 'shadcn',
    logoUrl: '/shadcn-logo.svg',
  },
  {
    id: 'tanstack',
    name: 'TanStack',
    link: 'https://tanstack.com/',
    reason: 'Everything',
    logoUrl: '/tanstack-logo.svg',
  },
  {
    id: 'notion',
    name: 'Notion',
    link: 'https://www.notion.com/product',
    reason: 'Design',
    logoUrl: '/notion-logo.svg',
  },
];

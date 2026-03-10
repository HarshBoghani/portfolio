import PortfolioContent from '@/components/portfolio/PortfolioContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Harsh Boghani - Computer Engineer | Competitive Programmer',
  description:
    'Computer Engineer and Competitive Programmer specializing in C++, algorithms, and system design. Building high-performance systems and solving complex problems.',
  keywords: [
    'harsh boghani',
    'computer engineer',
    'competitive programmer',
    'c++ developer',
    'algorithms',
    'system design',
    'portfolio',
  ],
  openGraph: {
    title: 'Harsh Boghani - Computer Engineer | Competitive Programmer',
    description:
      'Computer Engineer and Competitive Programmer specializing in C++, algorithms, and system design.',
    url: 'https://www.harshboghani.me', // assuming, or whatever
    type: 'website',
  },
  twitter: {
    title: 'Harsh Boghani - Computer Engineer | Competitive Programmer',
    description:
      'Computer Engineer and Competitive Programmer specializing in C++, algorithms, and system design.',
  },
};

export default function Page() {
  return <PortfolioContent />;
}

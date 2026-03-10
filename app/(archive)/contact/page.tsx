import { Metadata } from 'next';
import ContactClient from './ContactClient';
import { socialLinks } from '@/lib/info';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Contact - Dev Italiya',
  description:
    'Get in touch with Dev Italiya. Connect through social media, email, or professional networks. Available for freelance projects and collaborations.',
  keywords: [
    'contact',
    'dev italiya',
    'freelance',
    'collaboration',
    'social media',
    'email',
    'github',
    'dev italiya github',
    'dev italiya medium',
    'dev italiya instagram',
    'dev italiya twitter',
    'dev italiya x',
    'dev italiya email',
  ],
  openGraph: {
    title: 'Contact - Dev Italiya',
    description:
      'Get in touch with Dev Italiya. Available for freelance projects and collaborations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact - Dev Italiya',
    description:
      'Get in touch with Dev Italiya. Available for freelance projects and collaborations.',
  },
};

export default function ContactPage() {
  // Generate structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Dev Italiya',
    jobTitle: 'Full Stack Developer',
    description:
      'Full-stack developer building innovative solutions with modern technologies',
    sameAs: socialLinks.map((link) => link.href),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Professional',
      availableLanguage: 'English',
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Client Component with animations */}
      <ContactClient />
    </>
  );
}

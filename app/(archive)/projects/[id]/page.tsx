import { redirect } from 'next/navigation';
import React from 'react';
import { Project, projects } from '@/lib/info';
import { getProjectViews } from '@/lib/views-kv';
import { Metadata } from 'next';
import ViewIncrementer from './ViewIncrementer';
import ProjectClient from './ProjectClient';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return projects.map((project) => ({
    id: project.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const project = projects.find((p) => p.id === params.id);

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.title} - Dev Italiya`,
    description: project.description,
    keywords: [...project.tags, 'dev italiya', 'project', 'portfolio'],
    openGraph: {
      title: `${project.title} - Dev Italiya`,
      description: project.description,
      url: `https://www.devitaliya.me/projects/${project.id}`,
      type: 'article',
    },
    twitter: {
      title: `${project.title} - Dev Italiya`,
      description: project.description,
    },
  };
}

export default async function ProjectDetail({
  params,
}: {
  params: { id: string };
}) {
  const project = projects.find((p) => p.id === params.id);

  if (!project) {
    redirect('/projects');
  }

  // Get view count from Vercel KV
  const projectViews = await getProjectViews(params.id);

  const projectWithViews = {
    ...project,
    views: projectViews,
  };

  // Generate structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    dateCreated: project.date,
    creator: {
      '@type': 'Person',
      name: 'Dev Italiya',
    },
    keywords: project.tags,
    programmingLanguage: project.techStack,
    url: `https://www.devitaliya.me/projects/${project.id}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Dev Italiya Portfolio',
      url: 'https://www.devitaliya.me',
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

      {/* Client-side view incrementer */}
      <ViewIncrementer projectId={params.id} />

      {/* Client component with animations */}
      <ProjectClient project={projectWithViews} />
    </>
  );
}

import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';
import HashpageApp from '@/components/HashpageApp';
import { summarize } from '@/lib/summary';

// A preview link: the same document as a #v. link, but in the path so link-preview crawlers can read it.
export async function generateMetadata({ params }: PageProps<'/p/[payload]'>): Promise<Metadata> {
  const { payload } = await params;
  const s = await summarize(payload);
  // Shared pages are for the people they're shared with, not for search engines.
  const robots = { index: false, follow: false };
  if (!s) return { robots };
  return {
    title: { absolute: s.title },
    description: s.description,
    robots,
    openGraph: { title: s.title, description: s.description, siteName: 'Hashpage', type: 'article' },
    twitter: { card: 'summary_large_image', title: s.title, description: s.description },
  };
}

// The page shell is static; only the metadata depends on the URL. This marks that as intentional.
async function Connection() {
  await connection();
  return null;
}

export default function PreviewPage() {
  return (
    <>
      <HashpageApp />
      <Suspense>
        <Connection />
      </Suspense>
    </>
  );
}

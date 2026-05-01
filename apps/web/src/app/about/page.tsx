import type { JSX } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata = { title: 'About' };

export default function AboutPage(): JSX.Element {
  return (
    <main className="page">
      <SiteHeader />
      <article id="reader" className="reader font-md">
        <h1>About</h1>
        <p>
          <strong>socialMediaReplacer</strong> is a small reading app. It publishes a short, daily
          digest in four categories — Tech, News, DIY, and TIL — assembled from public sources
          (Reddit, Hacker News, Wikipedia, and a curated list of RSS feeds), with full attribution
          and a link out to every original.
        </p>
        <p>
          It is deliberately not a social product. There is no infinite scroll. There are no
          comment sections, like counters, streaks, or push notifications. The home page lists
          today&apos;s pieces, finite and quiet, and tomorrow it will list tomorrow&apos;s.
        </p>
        <p>
          Bookmarks live on your device. We collect no PII. The only third-party network requests
          on the article page are for the original sources you choose to follow.
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}

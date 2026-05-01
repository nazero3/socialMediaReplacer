import type { Metadata } from 'next';
import { cssVariables } from '@smr/theme';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'socialMediaReplacer — calm reading, daily',
    template: '%s — socialMediaReplacer',
  },
  description:
    'A reader-first daily digest in Tech, News, DIY, and TIL. No infinite scroll. No engagement mechanics. One Today page.',
  alternates: {
    types: { 'application/atom+xml': '/feed.xml' },
  },
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&display=swap"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try { var t = localStorage.getItem('smr-theme'); if (t) document.documentElement.setAttribute('data-theme', t); } catch (e) {}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

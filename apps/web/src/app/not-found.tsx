import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export default function NotFound() {
  return (
    <main className="page">
      <SiteHeader />
      <article className="reader">
        <h1>Not here.</h1>
        <p>That page doesn&apos;t exist (yet). Try the <Link href="/">Today page</Link>.</p>
      </article>
      <SiteFooter />
    </main>
  );
}

import Link from 'next/link';
import { CATEGORIES, CATEGORY_LABELS } from '@smr/types';
import { ThemeToggle } from './ThemeToggle';

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        socialMediaReplacer
      </Link>
      <nav className="nav" aria-label="Primary">
        <Link href="/">Today</Link>
        {CATEGORIES.map((c) => (
          <Link key={c} href={`/category/${c}`}>
            {CATEGORY_LABELS[c]}
          </Link>
        ))}
        <Link href="/search">Search</Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}

import * as React from 'react';
import type { ArticleSummary } from '@smr/types';
import { CategoryBadge } from './CategoryBadge';

export interface ArticleCardProps {
  article: ArticleSummary;
  href: string;
}

export function ArticleCard({ article, href }: ArticleCardProps) {
  const date = new Date(article.publishedAt);
  return (
    <article
      style={{
        display: 'grid',
        gap: 8,
        padding: '20px 24px',
        borderRadius: 12,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <CategoryBadge category={article.category} />
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          {date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          {' · '}
          {Math.max(1, Math.round(article.readingTimeSec / 60))} min read
        </span>
      </div>
      <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.6rem', lineHeight: 1.25 }}>
        <a href={href} style={{ color: 'var(--color-text)', textDecoration: 'none' }}>
          {article.title}
        </a>
      </h2>
      <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{article.summary}</p>
    </article>
  );
}

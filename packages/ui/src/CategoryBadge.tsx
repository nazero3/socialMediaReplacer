import * as React from 'react';
import { CATEGORY_LABELS, type Category } from '@smr/types';

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        fontFamily: 'var(--font-body)',
        fontSize: '0.75rem',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--color-accent)',
        border: '1px solid var(--color-border)',
        borderRadius: 999,
        background: 'var(--color-surface-muted)',
      }}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

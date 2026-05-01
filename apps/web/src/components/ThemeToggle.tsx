'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    try {
      const saved = (localStorage.getItem('smr-theme') as Theme | null) ?? 'system';
      setTheme(saved);
      apply(saved);
    } catch {
      // ignore
    }
  }, []);

  function next() {
    const order: Theme[] = ['system', 'light', 'dark'];
    const i = order.indexOf(theme);
    const n = order[(i + 1) % order.length] ?? 'system';
    setTheme(n);
    apply(n);
    try {
      if (n === 'system') localStorage.removeItem('smr-theme');
      else localStorage.setItem('smr-theme', n);
    } catch {
      // ignore
    }
  }

  const label = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Auto';
  return (
    <button type="button" onClick={next} aria-label={`Theme: ${label}. Click to change.`}>
      Theme: {label}
    </button>
  );
}

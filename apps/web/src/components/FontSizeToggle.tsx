'use client';

import { useEffect, useState } from 'react';

type Size = 'sm' | 'md' | 'lg';
const labels: Record<Size, string> = { sm: 'Small', md: 'Medium', lg: 'Large' };

export function FontSizeToggle({ targetId }: { targetId: string }) {
  const [size, setSize] = useState<Size>('md');

  useEffect(() => {
    try {
      const saved = (localStorage.getItem('smr-font') as Size | null) ?? 'md';
      setSize(saved);
      apply(saved);
    } catch {
      // ignore
    }
    function apply(s: Size) {
      const el = document.getElementById(targetId);
      if (!el) return;
      el.classList.remove('font-sm', 'font-md', 'font-lg');
      el.classList.add(`font-${s}`);
    }
  }, [targetId]);

  function cycle() {
    const order: Size[] = ['sm', 'md', 'lg'];
    const next = order[(order.indexOf(size) + 1) % order.length] ?? 'md';
    setSize(next);
    const el = document.getElementById(targetId);
    if (el) {
      el.classList.remove('font-sm', 'font-md', 'font-lg');
      el.classList.add(`font-${next}`);
    }
    try {
      localStorage.setItem('smr-font', next);
    } catch {
      // ignore
    }
  }

  return (
    <button type="button" onClick={cycle} aria-label={`Font size: ${labels[size]}. Click to change.`}>
      Font: {labels[size]}
    </button>
  );
}

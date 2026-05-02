import { palette, fonts, lineHeights, type ThemeName } from './tokens';

function block(selector: string, vars: Record<string, string | number>): string {
  const lines = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`);
  return `${selector} {\n${lines.join('\n')}\n}`;
}

type PaletteSlot = (typeof palette)[ThemeName];

function paletteToVars(p: PaletteSlot): Record<string, string> {
  return {
    '--color-background': p.background,
    '--color-surface': p.surface,
    '--color-surface-muted': p.surfaceMuted,
    '--color-border': p.border,
    '--color-text': p.text,
    '--color-text-muted': p.textMuted,
    '--color-accent': p.accent,
    '--color-accent-soft': p.accentSoft,
    '--color-link': p.link,
    '--color-danger': p.danger,
  };
}

const sharedVars: Record<string, string | number> = {
  '--font-body': fonts.body,
  '--font-heading': fonts.heading,
  '--font-mono': fonts.mono,
  '--line-height-relaxed': lineHeights.relaxed,
  '--line-height-snug': lineHeights.snug,
  '--reader-max-width': '68ch',
  '--page-max-width': '72rem',
};

const root = block(':root', { ...sharedVars, ...paletteToVars(palette.light) });
const darkExplicit = block("[data-theme='dark']", paletteToVars(palette.dark));
const darkAuto = `@media (prefers-color-scheme: dark) {\n${block(
  ":root:not([data-theme='light'])",
  paletteToVars(palette.dark),
)
  .split('\n')
  .map((l) => '  ' + l)
  .join('\n')}\n}`;

export const cssVariables = [root, darkExplicit, darkAuto].join('\n\n');

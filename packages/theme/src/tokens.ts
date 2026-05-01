export const palette = {
  light: {
    background: '#F4ECD8',
    surface: '#FBF6E9',
    surfaceMuted: '#EFE6CC',
    border: '#D8CDA9',
    text: '#2B2A26',
    textMuted: '#5C574A',
    accent: '#8C5A3C',
    accentSoft: '#C68B5E',
    link: '#7A4A2E',
    danger: '#A23B26',
  },
  dark: {
    background: '#1B1A17',
    surface: '#23211D',
    surfaceMuted: '#2C2924',
    border: '#3A352D',
    text: '#E8E2D1',
    textMuted: '#9A917D',
    accent: '#D9A066',
    accentSoft: '#B47A48',
    link: '#E0B080',
    danger: '#E07A5F',
  },
} as const;

export const fonts = {
  body: "'Lora', Georgia, 'Times New Roman', serif",
  heading: "'Source Serif 4', 'Source Serif Pro', Georgia, serif",
  mono: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 18,
  md: 20,
  lg: 24,
  xl: 30,
  xxl: 38,
  xxxl: 48,
} as const;

export const lineHeights = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.55,
  relaxed: 1.7,
  loose: 1.85,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

export const layout = {
  readerMaxWidth: '68ch',
  pageMaxWidth: '72rem',
} as const;

export type Palette = typeof palette.light;
export type ThemeName = 'light' | 'dark';

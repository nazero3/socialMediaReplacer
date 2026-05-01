export * from './tokens';
export { cssVariables } from './cssVariables';

import { palette, fonts, fontSizes, lineHeights, spacing, radii, layout } from './tokens';

export const theme = {
  light: {
    colors: palette.light,
    fonts,
    fontSizes,
    lineHeights,
    spacing,
    radii,
    layout,
  },
  dark: {
    colors: palette.dark,
    fonts,
    fontSizes,
    lineHeights,
    spacing,
    radii,
    layout,
  },
} as const;

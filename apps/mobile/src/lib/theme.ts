import { useColorScheme } from 'react-native';
import { theme } from '@smr/theme';

export function useAppTheme() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? theme.dark : theme.light;
}

export type AppTheme = ReturnType<typeof useAppTheme>;

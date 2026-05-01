import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { theme } from '@smr/theme';

export default function RootLayout() {
  const scheme = useColorScheme();
  const t = scheme === 'dark' ? theme.dark : theme.light;
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.colors.background },
          headerTitleStyle: { fontFamily: t.fonts.heading, color: t.colors.text },
          headerTintColor: t.colors.accent,
          contentStyle: { backgroundColor: t.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="article/[slug]" options={{ title: '' }} />
      </Stack>
    </>
  );
}

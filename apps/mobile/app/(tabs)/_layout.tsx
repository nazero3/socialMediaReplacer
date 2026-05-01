import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { theme } from '@smr/theme';

export default function TabsLayout() {
  const scheme = useColorScheme();
  const t = scheme === 'dark' ? theme.dark : theme.light;
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: t.colors.surface,
          borderTopColor: t.colors.border,
        },
        tabBarActiveTintColor: t.colors.accent,
        tabBarInactiveTintColor: t.colors.textMuted,
        headerStyle: { backgroundColor: t.colors.background },
        headerTitleStyle: { fontFamily: t.fonts.heading, color: t.colors.text },
        headerTintColor: t.colors.accent,
        sceneStyle: { backgroundColor: t.colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="categories" options={{ title: 'Categories' }} />
      <Tabs.Screen name="bookmarks" options={{ title: 'Saved' }} />
    </Tabs>
  );
}

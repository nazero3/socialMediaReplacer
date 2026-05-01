import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CATEGORIES, CATEGORY_LABELS } from '@smr/types';
import { useAppTheme } from '../../src/lib/theme';

export default function CategoriesScreen() {
  const t = useAppTheme();
  return (
    <View style={{ flex: 1, padding: t.spacing.lg, backgroundColor: t.colors.background }}>
      <Text
        style={{
          fontFamily: t.fonts.heading,
          color: t.colors.text,
          fontSize: t.fontSizes.xxl,
          marginBottom: t.spacing.sm,
        }}
      >
        Categories
      </Text>
      <Text style={{ color: t.colors.textMuted, marginBottom: t.spacing.lg }}>
        Pick something to read.
      </Text>
      {CATEGORIES.map((c) => (
        <Pressable
          key={c}
          onPress={() => router.push(`/category/${c}`)}
          style={({ pressed }) => ({
            padding: t.spacing.lg,
            marginBottom: t.spacing.md,
            backgroundColor: pressed ? t.colors.surfaceMuted : t.colors.surface,
            borderRadius: t.radii.lg,
            borderColor: t.colors.border,
            borderWidth: 1,
          })}
        >
          <Text
            style={{
              fontFamily: t.fonts.heading,
              fontSize: t.fontSizes.lg,
              color: t.colors.text,
            }}
          >
            {CATEGORY_LABELS[c]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

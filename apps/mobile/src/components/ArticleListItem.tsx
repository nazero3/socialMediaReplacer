import { Pressable, Text, View } from 'react-native';
import type { ArticleSummary } from '@smr/types';
import { CATEGORY_LABELS } from '@smr/types';
import { useAppTheme } from '../lib/theme';

export interface ArticleListItemProps {
  article: ArticleSummary;
  onPress: () => void;
}

export function ArticleListItem({ article, onPress }: ArticleListItemProps) {
  const t = useAppTheme();
  const date = new Date(article.publishedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      style={({ pressed }) => ({
        backgroundColor: pressed ? t.colors.surfaceMuted : t.colors.surface,
        borderColor: t.colors.border,
        borderWidth: 1,
        borderRadius: t.radii.lg,
        padding: t.spacing.lg,
        marginBottom: t.spacing.md,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: t.spacing.sm }}>
        <Text
          style={{
            color: t.colors.accent,
            fontSize: t.fontSizes.xs,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            marginRight: t.spacing.md,
          }}
        >
          {CATEGORY_LABELS[article.category]}
        </Text>
        <Text style={{ color: t.colors.textMuted, fontSize: t.fontSizes.xs }}>
          {date} · {Math.max(1, Math.round(article.readingTimeSec / 60))} min
        </Text>
      </View>
      <Text
        style={{
          color: t.colors.text,
          fontFamily: t.fonts.heading,
          fontSize: t.fontSizes.lg,
          lineHeight: t.fontSizes.lg * t.lineHeights.snug,
          marginBottom: t.spacing.sm,
        }}
      >
        {article.title}
      </Text>
      <Text
        style={{
          color: t.colors.textMuted,
          fontFamily: t.fonts.body,
          fontSize: t.fontSizes.sm,
          lineHeight: t.fontSizes.sm * t.lineHeights.normal,
        }}
      >
        {article.summary}
      </Text>
    </Pressable>
  );
}

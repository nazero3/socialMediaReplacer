import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import type { ArticleDetail } from '@smr/types';
import { CATEGORY_LABELS } from '@smr/types';
import { formatReadingTime } from '@smr/content';
import { getArticleBySlug } from '../../src/lib/api';
import {
  cacheArticle,
  getCachedArticle,
  isBookmarked,
  pushHistory,
  setBookmark,
} from '../../src/lib/storage';
import { useAppTheme } from '../../src/lib/theme';

const FONT_STEPS = [16, 18, 21] as const;

export default function ArticleScreen() {
  const t = useAppTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontIdx, setFontIdx] = useState(1);
  const [bookmarked, setBookmarked] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const cached = await getCachedArticle(slug);
      if (cached) setArticle(cached);
      try {
        const fresh = await getArticleBySlug(slug);
        setArticle(fresh);
        setOffline(false);
        await cacheArticle(fresh);
        await pushHistory(fresh);
      } catch {
        if (cached) setOffline(true);
      } finally {
        setLoading(false);
      }
      setBookmarked(await isBookmarked(slug));
    })();
  }, [slug]);

  if (loading && !article) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: t.colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={t.colors.accent} />
      </View>
    );
  }
  if (!article) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: t.colors.background,
          padding: t.spacing.lg,
        }}
      >
        <Text style={{ color: t.colors.text }}>Could not load this article.</Text>
      </View>
    );
  }

  const fontSize = FONT_STEPS[fontIdx] ?? 18;
  const date = new Date(article.publishedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.colors.background }}
      contentContainerStyle={{ padding: t.spacing.lg, paddingBottom: t.spacing.xxxl }}
    >
      <Stack.Screen options={{ title: '' }} />
      {offline ? (
        <Text
          style={{
            color: t.colors.textMuted,
            fontSize: t.fontSizes.xs,
            marginBottom: t.spacing.md,
            fontStyle: 'italic',
          }}
        >
          You&apos;re offline. Showing cached copy.
        </Text>
      ) : null}
      <Text
        style={{
          color: t.colors.accent,
          letterSpacing: 1.2,
          fontSize: t.fontSizes.xs,
          textTransform: 'uppercase',
          marginBottom: t.spacing.sm,
        }}
      >
        {CATEGORY_LABELS[article.category]} · {date} · {formatReadingTime(article.readingTimeSec)}
      </Text>
      <Text
        style={{
          fontFamily: t.fonts.heading,
          fontSize: t.fontSizes.xxl,
          color: t.colors.text,
          lineHeight: t.fontSizes.xxl * t.lineHeights.snug,
          marginBottom: t.spacing.md,
        }}
      >
        {article.title}
      </Text>
      <Text
        style={{
          color: t.colors.textMuted,
          fontFamily: t.fonts.body,
          fontSize: t.fontSizes.base,
          lineHeight: t.fontSizes.base * t.lineHeights.normal,
          marginBottom: t.spacing.lg,
        }}
      >
        {article.summary}
      </Text>

      <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginBottom: t.spacing.lg }}>
        <Pressable
          onPress={() => setFontIdx((i) => (i + 1) % FONT_STEPS.length)}
          accessibilityLabel="Cycle font size"
          style={{
            paddingVertical: t.spacing.sm,
            paddingHorizontal: t.spacing.md,
            borderRadius: t.radii.md,
            borderColor: t.colors.border,
            borderWidth: 1,
          }}
        >
          <Text style={{ color: t.colors.text }}>A · {FONT_STEPS[fontIdx]}</Text>
        </Pressable>
        <Pressable
          onPress={async () => {
            const next = !bookmarked;
            setBookmarked(next);
            await setBookmark(article.slug, next);
          }}
          accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark this article'}
          style={{
            paddingVertical: t.spacing.sm,
            paddingHorizontal: t.spacing.md,
            borderRadius: t.radii.md,
            borderColor: t.colors.border,
            borderWidth: 1,
            backgroundColor: bookmarked ? t.colors.surfaceMuted : 'transparent',
          }}
        >
          <Text style={{ color: bookmarked ? t.colors.accent : t.colors.text }}>
            {bookmarked ? '★ Saved' : '☆ Save'}
          </Text>
        </Pressable>
      </View>

      <Markdown
        style={{
          body: {
            color: t.colors.text,
            fontFamily: t.fonts.body,
            fontSize,
            lineHeight: fontSize * t.lineHeights.relaxed,
          },
          heading2: {
            fontFamily: t.fonts.heading,
            color: t.colors.text,
            fontSize: fontSize * 1.4,
            marginTop: t.spacing.xl,
            marginBottom: t.spacing.sm,
          },
          heading3: {
            fontFamily: t.fonts.heading,
            color: t.colors.text,
            fontSize: fontSize * 1.2,
            marginTop: t.spacing.lg,
            marginBottom: t.spacing.sm,
          },
          link: { color: t.colors.link },
          paragraph: { marginBottom: t.spacing.md },
          blockquote: {
            borderLeftColor: t.colors.accent,
            borderLeftWidth: 3,
            paddingLeft: t.spacing.md,
            color: t.colors.textMuted,
          },
        }}
        onLinkPress={(url) => {
          Linking.openURL(url).catch(() => undefined);
          return false;
        }}
      >
        {article.bodyMarkdown}
      </Markdown>

      <View
        style={{
          marginTop: t.spacing.xxl,
          paddingTop: t.spacing.lg,
          borderTopColor: t.colors.border,
          borderTopWidth: 1,
        }}
      >
        <Text
          style={{
            color: t.colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            fontSize: t.fontSizes.xs,
            marginBottom: t.spacing.md,
          }}
        >
          Sources
        </Text>
        {article.sources.length === 0 ? (
          <Text style={{ color: t.colors.textMuted }}>(No external sources cited.)</Text>
        ) : (
          article.sources.map((s, i) => (
            <Pressable
              key={s.id}
              onPress={() => Linking.openURL(s.url).catch(() => undefined)}
              style={{ marginBottom: t.spacing.sm }}
            >
              <Text style={{ color: t.colors.link, fontSize: t.fontSizes.sm }}>
                {i + 1}. {s.title}
              </Text>
              {s.author ? (
                <Text style={{ color: t.colors.textMuted, fontSize: t.fontSizes.xs }}>
                  {s.author}
                </Text>
              ) : null}
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}
